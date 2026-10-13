import type { Lesson, WordsLesson } from '../domain/types'
import { lessonPath } from '../path'

// «Следующий урок» языка (LNG-S1-017, D-6) — тонкая обёртка над путём (LNG-S1-022, D-1).

export interface NextLesson {
  next: WordsLesson | null
  /** Уроков слов в языке: 0 — «уроков пока нет», иначе next = null — «все пройдены». */
  total: number
}

export function nextLesson(
  lessons: readonly Lesson[],
  lang: string,
  done: ReadonlySet<string>,
  known: ReadonlySet<string> = new Set(),
): NextLesson {
  const { items, next } = lessonPath(lessons, lang, done, known)
  return { next, total: items.length }
}
