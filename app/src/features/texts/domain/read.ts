import type { Line, LangCode, Localized, Stanza, TextDoc, Word } from './types'
import { textIn } from './types'

// Чтение текста (LNG-S1-026): раскрытие повторов, выбор перевода, поиск слов в словаре.

export interface ReadStanza {
  id?: string | undefined
  type: NonNullable<Stanza['type']>
  /** Строфа показана по `ref` — повтор объявленной выше. */
  repeat: boolean
  speaker?: string | undefined
  lines: Line[]
}

/** Строфы по порядку, `ref` заменён строками объявленной строфы (валидатор гарантирует её наличие выше). */
export function expandStanzas(doc: TextDoc): ReadStanza[] {
  const declared = new Map<string, Line[]>()
  const result: ReadStanza[] = []
  for (const s of doc.stanzas) {
    const own = 'lines' in s ? s.lines : undefined
    const lines = own ?? declared.get((s as { ref: string }).ref) ?? []
    if (s.id && own) declared.set(s.id, own)
    result.push({ id: s.id, type: s.type ?? 'verse', repeat: !own, speaker: s.speaker, lines })
  }
  return result
}

/** Перевод на язык интерфейса; иначе — первый имеющийся, не оригинал. */
export function translationOf(
  node: Line | Localized,
  lang: LangCode,
  ui: LangCode,
): { lang: LangCode; text: string } | undefined {
  const get = (l: LangCode) => (isLine(node) ? textIn(node, l) : node[l])
  if (ui !== lang && get(ui)) return { lang: ui, text: get(ui)! }
  for (const k of Object.keys(node)) {
    if (k.length === 2 && k !== lang && get(k)) return { lang: k, text: get(k)! }
  }
  return undefined
}

const isLine = (n: Line | Localized): n is Line => !('length' in n) && typeof n === 'object'

/** Слова строки для разбора: вручную размеченные; пусто — слова строки без разбора. */
export function lineWords(line: Line, lang: LangCode): Word[] {
  if (line.words?.length) return line.words
  return (textIn(line, lang) ?? '')
    .split(/[\s,.;:!?¡¿()"«»—]+/u)
    .filter(Boolean)
    .map((w) => ({ [lang]: w }) as Word)
}

interface DictLike {
  id: string
  lemma: string
  forms?: Record<string, string | string[]> | undefined
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Статья словаря для слова: по лемме, затем по форме (quiero → querer), без регистра и ударений. */
export function findEntry<E extends DictLike>(
  entries: readonly E[],
  word: { form: string; lemma?: string | undefined },
): E | undefined {
  const lemma = word.lemma ? fold(word.lemma) : null
  if (lemma) {
    const byLemma = entries.find((e) => fold(e.lemma) === lemma)
    if (byLemma) return byLemma
  }
  const form = fold(word.form)
  return (
    entries.find((e) => fold(e.lemma) === form) ??
    entries.find((e) =>
      Object.values(e.forms ?? {})
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .flatMap((f) => f.split(' / '))
        .some((f) => fold(f) === form),
    )
  )
}
