import { pickIndex } from '@/features/activity'

import type { Lesson } from './domain/types'

// Фраза дня на «Главной» (LNG-S1-025, D-5): из пройденных уроков, одна и та же в течение суток.

export interface PhraseOfDay {
  lang: string
  text: string
  translation: string
  lessonId: string
}

export function phraseOfDay(
  lessons: readonly Lesson[],
  done: ReadonlySet<string>,
  langs: readonly string[],
  locale: string,
  seed: string,
): PhraseOfDay | null {
  const pool = lessons.flatMap((l) => {
    if (l.kind !== 'words' || !done.has(l.id) || !langs.includes(l.lang)) return []
    const text = l.phrase[l.lang]
    if (typeof text !== 'string') return []
    const own = (k: string) => (k !== l.lang && typeof l.phrase[k] === 'string' ? l.phrase[k] : '')
    const translation = own(locale) || own('ru')
    return translation
      ? [{ lang: l.lang, text, translation: String(translation), lessonId: l.id }]
      : []
  })
  return pool.length
    ? (pool.sort((a, b) => a.lessonId.localeCompare(b.lessonId))[pickIndex(seed, pool.length)] ??
        null)
    : null
}
