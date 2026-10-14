import { TOPICS, wordKey } from '@/features/dictionary'

import type { GrammarLesson, Lesson, WordsLesson } from './domain/types'

// Путь уроков языка (LNG-S1-022, D-1): один источник и для «следующего» на «Главной»,
// и для вкладки «Уроки». Уроки не блокируются — путь рекомендует (D-2).
// Грамматика (D-14, D-38): тема по порядку после каждых GRAMMAR_EVERY пройденных уроков слов,
// когда её слова-условие выучены (слова пройденных уроков или известные по проверке).

export type LessonStatus = 'done' | 'known' | 'next' | 'open'

export interface PathItem {
  lesson: WordsLesson
  status: LessonStatus
}

export interface GrammarItem {
  lesson: GrammarLesson
  status: Exclude<LessonStatus, 'known'>
}

export interface LessonPath {
  items: PathItem[]
  /** Темы грамматики языка по порядку. */
  grammar: GrammarItem[]
  next: Lesson | null
}

/** Урок грамматики — после каждых двух уроков слов (D-14). */
export const GRAMMAR_EVERY = 2

const topicOrder = (topic: string) => {
  const i = (TOPICS as readonly string[]).indexOf(topic)
  return i < 0 ? TOPICS.length : i
}

/** Все слова урока известны ученику (D-4 LNG-S1-021). */
const allKnown = (l: WordsLesson, known: ReadonlySet<string>) =>
  l.words.length > 0 && l.words.every((id) => known.has(wordKey(l.lang, id)))

const ready = (l: Lesson, done: ReadonlySet<string>) =>
  !done.has(l.id) && (l.requires ?? []).every((id) => done.has(id))

export function lessonPath(
  lessons: readonly Lesson[],
  lang: string,
  done: ReadonlySet<string>,
  known: ReadonlySet<string> = new Set(),
): LessonPath {
  const ordered = lessons
    .filter((l): l is WordsLesson => l.kind === 'words' && l.lang === lang)
    .sort((a, b) => topicOrder(a.topic) - topicOrder(b.topic) || a.order - b.order)
  const grammar = lessons
    .filter((l): l is GrammarLesson => l.kind === 'grammar' && l.lang === lang)
    .sort((a, b) => a.order - b.order)

  const nextWords = ordered.find((l) => ready(l, done) && !allKnown(l, known)) ?? null

  // Слова, которые ученик уже встречал: пройденные уроки слов + известные по проверке.
  const learned = new Set(known)
  for (const l of ordered)
    if (done.has(l.id)) for (const w of l.words) learned.add(wordKey(lang, w))
  // Темы идут строго по порядку: следующая — первая непройденная; ждёт, пока не выучены её слова.
  const nextGrammar = grammar.find((l) => ready(l, done)) ?? null
  const grammarOpen =
    nextGrammar !== null && (nextGrammar.words ?? []).every((w) => learned.has(wordKey(lang, w)))
  const wordsDone = ordered.filter((l) => done.has(l.id)).length
  const grammarDone = grammar.filter((l) => done.has(l.id)).length
  const grammarDue = grammarOpen && wordsDone >= GRAMMAR_EVERY * (grammarDone + 1)

  const next = grammarDue ? nextGrammar : (nextWords ?? (grammarOpen ? nextGrammar : null))

  const status = (l: WordsLesson): LessonStatus =>
    done.has(l.id) ? 'done' : l === next ? 'next' : allKnown(l, known) ? 'known' : 'open'
  return {
    items: ordered.map((lesson) => ({ lesson, status: status(lesson) })),
    grammar: grammar.map((lesson) => ({
      lesson,
      status: done.has(lesson.id) ? 'done' : lesson === next ? 'next' : 'open',
    })),
    next,
  }
}
