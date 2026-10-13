import type { Issue } from '@/features/content'
import { phraseKey } from './phrase-key'
import { textIn, type TextDoc } from './types'
import { checkTextFile } from './validate'

// План загрузки файла текста (LNG-S1-003): что произойдёт, если загрузить файл.
// Решение о замене принимает человек; план только считает последствия.

/** Песня — единицы КБ; больше — почти наверняка не тот файл (D-3 задачи). */
export const MAX_FILE_BYTES = 1_000_000

export interface PhraseDiff {
  /** Прогресс по ним сохранится: ключ не изменился. */
  kept: number
  added: number
  /** Уходят из повторения. */
  removed: number
}

export type ImportPlan =
  | { kind: 'invalid'; errors: Issue[]; warnings: Issue[] }
  | { kind: 'new'; text: TextDoc; warnings: Issue[] }
  | { kind: 'replace'; text: TextDoc; previous: TextDoc; phrases: PhraseDiff; warnings: Issue[] }
  | { kind: 'unchanged'; text: TextDoc; warnings: Issue[] }

export function tooLargePlan(bytes: number): ImportPlan {
  return {
    kind: 'invalid',
    errors: [
      {
        severity: 'error',
        code: 'file_too_large',
        path: '',
        params: { size: Math.ceil(bytes / 1024), max: MAX_FILE_BYTES / 1000 },
      },
    ],
    warnings: [],
  }
}

export function planImport(
  source: string,
  existing: (id: string) => TextDoc | undefined,
): ImportPlan {
  const { text, errors, warnings } = checkTextFile(source)
  if (!text) return { kind: 'invalid', errors, warnings }
  const previous = existing(text.id)
  if (!previous) return { kind: 'new', text, warnings }
  if (canonical(previous) === canonical(text)) return { kind: 'unchanged', text, warnings }
  return { kind: 'replace', text, previous, phrases: diffPhrases(previous, text), warnings }
}

/** Ключи прогресса всех фраз текста; строфы-повторы (`ref`) новых фраз не дают. */
export function phraseKeys(text: TextDoc): Set<string> {
  const keys = new Set<string>()
  for (const stanza of text.stanzas) {
    if (!('lines' in stanza)) continue
    for (const line of stanza.lines) {
      for (const phrase of line.phrases ?? []) {
        const original = textIn(phrase, text.lang)
        if (original) keys.add(phraseKey(text.id, original))
      }
    }
  }
  return keys
}

function diffPhrases(previous: TextDoc, next: TextDoc): PhraseDiff {
  const before = phraseKeys(previous)
  const after = phraseKeys(next)
  let kept = 0
  for (const key of after) if (before.has(key)) kept++
  return { kept, added: after.size - kept, removed: before.size - kept }
}

/** JSON с упорядоченными ключами: разное форматирование файла — не изменение текста. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v,
  )
}
