import { TOPICS, wordKey } from '@/features/dictionary'

import type { Lesson, WordsLesson } from './domain/types'

// Путь уроков языка (LNG-S1-022, D-1): один источник и для «следующего» на «Главной»,
// и для вкладки «Уроки». Уроки не блокируются — путь рекомендует (D-2).

export type LessonStatus = 'done' | 'known' | 'next' | 'open'

export interface PathItem {
  lesson: WordsLesson
  status: LessonStatus
}

export interface LessonPath {
  items: PathItem[]
  next: WordsLesson | null
}

const topicOrder = (topic: string) => {
  const i = (TOPICS as readonly string[]).indexOf(topic)
  return i < 0 ? TOPICS.length : i
}

/** Все слова урока известны ученику (D-4 LNG-S1-021). */
const allKnown = (l: WordsLesson, known: ReadonlySet<string>) =>
  l.words.length > 0 && l.words.every((id) => known.has(wordKey(l.lang, id)))

export function lessonPath(
  lessons: readonly Lesson[],
  lang: string,
  done: ReadonlySet<string>,
  known: ReadonlySet<string> = new Set(),
): LessonPath {
  const ordered = lessons
    .filter((l): l is WordsLesson => l.kind === 'words' && l.lang === lang)
    .sort((a, b) => topicOrder(a.topic) - topicOrder(b.topic) || a.order - b.order)
  const next =
    ordered.find(
      (l) =>
        !done.has(l.id) && !allKnown(l, known) && (l.requires ?? []).every((id) => done.has(id)),
    ) ?? null
  const status = (l: WordsLesson): LessonStatus =>
    done.has(l.id) ? 'done' : l === next ? 'next' : allKnown(l, known) ? 'known' : 'open'
  return { items: ordered.map((lesson) => ({ lesson, status: status(lesson) })), next }
}
