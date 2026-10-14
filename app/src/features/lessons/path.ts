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

/** Узел маршрута: урок слов или тема грамматики между ними (D-40). */
export type RouteNode = { kind: 'words'; item: PathItem } | { kind: 'grammar'; item: GrammarItem }

/**
 * Единый маршрут языка (D-40): уроки слов по порядку, темы грамматики — между ними, там, где путь
 * их предлагает. Будущие темы — перед уроком слов, который путь даст после темы (прогон «следующего»
 * от текущего прогресса); пройденные — после каждого GRAMMAR_EVERY-го пройденного урока слов;
 * темы, до которых слов не хватает, — в конце.
 */
export function courseRoute(
  lessons: readonly Lesson[],
  lang: string,
  done: ReadonlySet<string>,
  known: ReadonlySet<string> = new Set(),
): RouteNode[] {
  const path = lessonPath(lessons, lang, done, known)
  const before = new Map<string, GrammarItem[]>()
  const after = new Map<string, GrammarItem[]>()
  const end: GrammarItem[] = []
  const push = (m: Map<string, GrammarItem[]>, id: string, g: GrammarItem) =>
    m.set(id, [...(m.get(id) ?? []), g])
  const byId = new Map(path.grammar.map((g) => [g.lesson.id, g]))

  // Прогон пути вперёд: порядок, в котором ученик получит оставшиеся уроки.
  const sim = new Set(done)
  const seq: Lesson[] = []
  for (let l = path.next; l && seq.length <= lessons.length;) {
    seq.push(l)
    sim.add(l.id)
    l = lessonPath(lessons, lang, sim, known).next
  }
  seq.forEach((l, i) => {
    const g = byId.get(l.id)
    if (!g) return
    const anchor = seq.slice(i + 1).find((x) => x.kind === 'words')
    if (anchor) push(before, anchor.id, g)
    else end.push(g)
    byId.delete(l.id)
  })

  const doneWords = path.items.filter((i) => i.status === 'done')
  let k = 0
  for (const g of path.grammar) {
    if (!byId.has(g.lesson.id)) continue
    if (g.status !== 'done') {
      end.push(g)
      continue
    }
    const anchor = doneWords[Math.min(GRAMMAR_EVERY * ++k, doneWords.length) - 1]
    if (anchor) push(after, anchor.lesson.id, g)
    else push(before, path.items[0]?.lesson.id ?? '', g)
  }
  end.sort((a, b) => a.lesson.order - b.lesson.order)

  const grammar = (list: GrammarItem[] = []): RouteNode[] =>
    list.map((item) => ({ kind: 'grammar', item }))
  const nodes = path.items.flatMap((item): RouteNode[] => [
    ...grammar(before.get(item.lesson.id)),
    { kind: 'words', item },
    ...grammar(after.get(item.lesson.id)),
  ])
  return [...nodes, ...grammar(before.get('')), ...grammar(end)]
}
