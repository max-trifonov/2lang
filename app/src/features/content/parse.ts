import type { Issue } from './issues'

export type ParseResult = { ok: true; value: unknown } | { ok: false; issue: Issue }

/**
 * JSON.parse + место первой синтаксической ошибки. Позицию ищет свой сканер:
 * текст исключения у движков разный, а JavaScriptCore (iOS) позиции не даёт вовсе.
 */
export function parseJson(source: string): ParseResult {
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch {
    const offset = locateSyntaxError(text)
    const { line, column } = lineColumn(text, offset)
    return {
      ok: false,
      issue: {
        severity: 'error',
        code: 'json_syntax',
        path: '',
        params: { line, column, near: text.slice(offset, offset + 20).split('\n')[0] ?? '' },
      },
    }
  }
}

function lineColumn(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset)
  const line = before.split('\n').length
  return { line, column: offset - before.lastIndexOf('\n') }
}

class SyntaxAt {
  constructor(readonly offset: number) {}
}

/** Смещение первого символа, на котором JSON перестаёт быть корректным. */
export function locateSyntaxError(text: string): number {
  let i = 0
  const fail = (): never => {
    throw new SyntaxAt(i)
  }
  const ws = () => {
    while (i < text.length && ' \t\n\r'.includes(text[i]!)) i++
  }
  const literal = (word: string) => {
    for (const ch of word) {
      if (text[i] !== ch) fail()
      i++
    }
  }
  const string = () => {
    if (text[i] !== '"') fail()
    i++
    while (i < text.length) {
      const ch = text[i]!
      if (ch === '"') {
        i++
        return
      }
      if (ch < ' ') fail()
      if (ch === '\\') {
        i++
        const esc = text[i]
        if (esc === 'u') {
          for (let k = 0; k < 4; k++) {
            i++
            if (!/[0-9a-fA-F]/.test(text[i] ?? '')) fail()
          }
        } else if (esc === undefined || !'"\\/bfnrt'.includes(esc)) fail()
      }
      i++
    }
    fail()
  }
  const number = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i))
    if (!m) fail()
    i += m![0].length
  }
  const value = (): void => {
    ws()
    const ch = text[i]
    if (ch === '{') {
      i++
      ws()
      if (text[i] === '}') {
        i++
        return
      }
      for (;;) {
        ws()
        string()
        ws()
        if (text[i] !== ':') fail()
        i++
        value()
        ws()
        if (text[i] === ',') {
          i++
          continue
        }
        if (text[i] === '}') {
          i++
          return
        }
        fail()
      }
    }
    if (ch === '[') {
      i++
      ws()
      if (text[i] === ']') {
        i++
        return
      }
      for (;;) {
        value()
        ws()
        if (text[i] === ',') {
          i++
          continue
        }
        if (text[i] === ']') {
          i++
          return
        }
        fail()
      }
    }
    if (ch === '"') return string()
    if (ch === 't') return literal('true')
    if (ch === 'f') return literal('false')
    if (ch === 'n') return literal('null')
    return number()
  }
  try {
    value()
    ws()
    if (i < text.length) fail()
  } catch (e) {
    if (e instanceof SyntaxAt) return Math.min(e.offset, text.length)
    throw e
  }
  // JSON.parse упал, а сканер — нет: показываем начало, а не выдумываем место.
  return 0
}
