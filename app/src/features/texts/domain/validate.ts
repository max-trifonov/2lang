import {
  Checker,
  LANG_RE,
  fold,
  isObj,
  join,
  parseJson,
  type Issue,
  type Obj,
} from '@/features/content'

import {
  LEVELS,
  LICENSES,
  LINK_TYPES,
  PARTS_OF_SPEECH,
  STANZA_TYPES,
  TEXT_KINDS,
  type TextDoc,
} from './types'

// Проверка текста v1 по .flow/content-format.md: сначала структура узла, затем его
// межполевые правила. Узел со структурной ошибкой межполевые правила не проходит —
// иначе одна опечатка рождает каскад вторичных ошибок.

export interface CheckResult {
  /** Текст, если ошибок нет; предупреждения загрузку не блокируют. */
  text: TextDoc | null
  errors: Issue[]
  warnings: Issue[]
}

const ROOT_REQUIRED = ['format', 'version', 'id', 'kind', 'lang', 'license', 'title', 'stanzas']
const ROOT_KEYS = new Set([
  ...ROOT_REQUIRED,
  'author',
  'performer',
  'year',
  'level',
  'tags',
  'links',
  'note',
  'ext',
])
const STANZA_KEYS = new Set(['id', 'type', 'lines', 'ref', 'ext'])
const LINE_KEYS = new Set(['lit', 'phrases', 'words', 'note', 't', 'ext'])
const PHRASE_KEYS = new Set(['note', 'ext'])
const WORD_KEYS = new Set(['lemma', 'pos', 'ext'])
const LINK_KEYS = new Set(['type', 'url'])

export function checkTextFile(source: string): CheckResult {
  const parsed = parseJson(source)
  if (!parsed.ok) return { text: null, errors: [parsed.issue], warnings: [] }
  return validateText(parsed.value)
}

export function validateText(raw: unknown): CheckResult {
  const v = new Validator()
  v.root(raw)
  return {
    text: v.errors.length === 0 ? (raw as TextDoc) : null,
    errors: v.errors,
    warnings: v.warnings,
  }
}

interface LineInfo {
  path: string
  translations: string[]
}

class Validator extends Checker {
  private lang = ''

  root(raw: unknown): void {
    if (!isObj(raw)) {
      this.error('not_object', '')
      return
    }
    this.keys(raw, '', ROOT_KEYS)
    this.required(raw, '', ROOT_REQUIRED)
    if ('format' in raw && raw.format !== '2lang/text')
      this.error('bad_value', 'format', { allowed: '2lang/text' })
    if ('version' in raw && raw.version !== 1) this.error('bad_value', 'version', { allowed: 1 })
    if ('id' in raw) this.slug(raw.id, 'id')
    if ('kind' in raw) this.oneOf(raw.kind, 'kind', TEXT_KINDS)
    if ('license' in raw) this.oneOf(raw.license, 'license', LICENSES)
    if ('level' in raw) this.oneOf(raw.level, 'level', LEVELS)
    if ('author' in raw) this.type(raw.author, 'author', 'string')
    if ('performer' in raw) this.type(raw.performer, 'performer', 'string')
    if ('year' in raw) this.type(raw.year, 'year', 'integer')
    if ('note' in raw) this.localized(raw.note, 'note')
    if ('ext' in raw) this.type(raw.ext, 'ext', 'object')
    if ('tags' in raw) this.tags(raw.tags)
    if ('links' in raw) this.links(raw.links)

    const langOk = 'lang' in raw && this.langCode(raw.lang, 'lang')
    if (langOk) this.lang = raw.lang as string
    const titleOk = 'title' in raw && this.localized(raw.title, 'title')
    if (langOk && titleOk && !((raw.lang as string) in (raw.title as Obj))) {
      this.error('missing_original', 'title', { lang: this.lang })
    }

    if ('stanzas' in raw && this.type(raw.stanzas, 'stanzas', 'array')) {
      const stanzas = raw.stanzas as unknown[]
      if (stanzas.length === 0) this.error('empty', 'stanzas')
      this.stanzas(stanzas)
    }
  }

  private stanzas(stanzas: unknown[]): void {
    const declared = new Set<string>()
    const lines: LineInfo[] = []
    stanzas.forEach((stanza, i) => {
      const path = join('stanzas', i)
      if (!this.type(stanza, path, 'object')) return
      const s = stanza as Obj
      this.keys(s, path, STANZA_KEYS)
      if ('type' in s) this.oneOf(s.type, join(path, 'type'), STANZA_TYPES)
      if ('ext' in s) this.type(s.ext, join(path, 'ext'), 'object')
      if ('id' in s && this.slug(s.id, join(path, 'id'))) {
        const id = s.id as string
        if (declared.has(id)) this.error('duplicate_stanza_id', join(path, 'id'), { id })
        declared.add(id)
      }
      const hasLines = 'lines' in s
      const hasRef = 'ref' in s
      if (hasLines && hasRef) return this.error('stanza_lines_and_ref', path)
      if (!hasLines && !hasRef) return this.error('stanza_no_content', path)
      if (hasRef) {
        // Ссылка — только назад: строфа, объявленная ниже, при показе ещё не известна.
        if (this.type(s.ref, join(path, 'ref'), 'string') && !declared.has(s.ref as string)) {
          this.error('ref_unknown', join(path, 'ref'), { ref: s.ref as string })
        }
        return
      }
      const linesPath = join(path, 'lines')
      if (!this.type(s.lines, linesPath, 'array')) return
      const list = s.lines as unknown[]
      if (list.length === 0) this.error('empty', linesPath)
      list.forEach((line, j) => {
        const info = this.line(line, join(linesPath, j))
        if (info) lines.push(info)
      })
    })
    this.translationWarnings(lines)
  }

  /** Возвращает сведения для предупреждений, если у строки есть оригинал. */
  private line(raw: unknown, path: string): LineInfo | null {
    if (!this.type(raw, path, 'object')) return null
    const line = raw as Obj
    let ok = this.langKeys(line, path, LINE_KEYS)
    if ('lit' in line) ok = this.localized(line.lit, join(path, 'lit')) && ok
    if ('note' in line) ok = this.localized(line.note, join(path, 'note')) && ok
    if ('ext' in line) ok = this.type(line.ext, join(path, 'ext'), 'object') && ok
    if ('t' in line && this.type(line.t, join(path, 't'), 'number') && (line.t as number) < 0) {
      ok = this.error('bad_value', join(path, 't'), { allowed: '≥ 0' })
    }
    const phrases = 'phrases' in line ? this.list(line.phrases, join(path, 'phrases')) : []
    const words = 'words' in line ? this.list(line.words, join(path, 'words')) : []
    if (!this.lang || !ok) return null

    const original = line[this.lang]
    if (typeof original !== 'string') {
      this.error('missing_original', path, { lang: this.lang })
      return null
    }
    phrases?.forEach((phrase, k) => this.phrase(phrase, join(join(path, 'phrases'), k), original))
    words?.forEach((word, k) => this.word(word, join(join(path, 'words'), k), original))
    return { path, translations: this.translations(line) }
  }

  private phrase(raw: unknown, path: string, line: string): void {
    if (!this.type(raw, path, 'object')) return
    const phrase = raw as Obj
    let ok = this.langKeys(phrase, path, PHRASE_KEYS)
    if ('note' in phrase) ok = this.localized(phrase.note, join(path, 'note')) && ok
    if ('ext' in phrase) ok = this.type(phrase.ext, join(path, 'ext'), 'object') && ok
    if (!ok) return
    const original = phrase[this.lang]
    if (typeof original !== 'string') {
      this.error('missing_original', path, { lang: this.lang })
      return
    }
    if (this.translations(phrase).length === 0) this.error('phrase_no_translation', path)
    if (!fold(line).includes(fold(original))) {
      this.error('phrase_not_in_line', path, { fragment: original, line })
    }
  }

  private word(raw: unknown, path: string, line: string): void {
    if (!this.type(raw, path, 'object')) return
    const word = raw as Obj
    let ok = this.langKeys(word, path, WORD_KEYS)
    if ('lemma' in word) ok = this.nonEmpty(word.lemma, join(path, 'lemma')) && ok
    if ('pos' in word) ok = this.oneOf(word.pos, join(path, 'pos'), PARTS_OF_SPEECH) && ok
    if ('ext' in word) ok = this.type(word.ext, join(path, 'ext'), 'object') && ok
    if (!ok) return
    const original = word[this.lang]
    if (typeof original !== 'string') {
      this.error('missing_original', path, { lang: this.lang })
      return
    }
    if (!fold(line).includes(fold(original))) {
      this.error('word_not_in_line', path, { fragment: original, line })
    }
  }

  private translationWarnings(lines: LineInfo[]): void {
    const all = new Set(lines.flatMap((l) => l.translations))
    for (const { path, translations } of lines) {
      if (translations.length === 0) {
        this.warn('line_no_translation', path)
        continue
      }
      const missing = [...all].filter((l) => !translations.includes(l)).sort()
      if (missing.length > 0) this.warn('line_missing_langs', path, { langs: missing.join(', ') })
    }
  }

  private translations(node: Obj): string[] {
    return Object.keys(node).filter((key) => LANG_RE.test(key) && key !== this.lang)
  }

  private tags(value: unknown): boolean {
    if (!this.type(value, 'tags', 'array')) return false
    const seen = new Set<string>()
    let ok = true
    ;(value as unknown[]).forEach((tag, i) => {
      if (!this.nonEmpty(tag, join('tags', i))) return (ok = false)
      if (seen.has(tag as string))
        ok = this.error('duplicate_tag', join('tags', i), { tag: tag as string })
      seen.add(tag as string)
    })
    return ok
  }

  private links(value: unknown): boolean {
    if (!this.type(value, 'links', 'array')) return false
    let ok = true
    ;(value as unknown[]).forEach((link, i) => {
      const path = join('links', i)
      if (!this.type(link, path, 'object')) return (ok = false)
      const l = link as Obj
      ok = this.keys(l, path, LINK_KEYS) && ok
      ok = this.required(l, path, ['type', 'url']) && ok
      if ('type' in l) ok = this.oneOf(l.type, join(path, 'type'), LINK_TYPES) && ok
      if ('url' in l && this.type(l.url, join(path, 'url'), 'string') && !isUrl(l.url as string)) {
        ok = this.error('bad_url', join(path, 'url'), { url: l.url as string })
      }
    })
    return ok
  }
}

function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
