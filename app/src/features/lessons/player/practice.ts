import { article, type CatalogEntry } from '@/features/dictionary'

import type { Exercise, WordsLesson } from '../domain/types'
import { normalizeAnswer } from './answer'
import { scramble, shuffle, splitBlocks, type Rng } from './blocks'

// План урока слов (LNG-S1-017): шаги знакомства и задания практики по лестнице
// «узнать → услышать → вспомнить → применить» (D-7, D-2 задачи).

export const OPTIONS = 4

export type IntroStep = { kind: 'word'; word: CatalogEntry } | { kind: 'phrase' } | { kind: 'rule' }

export type Task =
  | { kind: 'recognize'; word: CatalogEntry; options: string[]; answer: string }
  | { kind: 'hear'; word: CatalogEntry; options: string[]; answer: string }
  | { kind: 'pick'; word: CatalogEntry; prompt: string; options: string[]; answer: string }
  | { kind: 'recall'; word: CatalogEntry; prompt: string; accepted: string[] }
  | { kind: 'fill'; sentence: string; translation?: string; accepted: string[] }
  | { kind: 'build'; sentence: string; translation?: string; blocks: string[] }
  | { kind: 'translate'; prompt: string; accepted: string[] }

/** Перевод для задания: на языке интерфейса, иначе русский; до первой «;» (D-2). */
export function shortTranslation(word: Pick<CatalogEntry, 'translations'>, locale: string): string {
  const full =
    word.translations[locale] ?? word.translations.ru ?? Object.values(word.translations)[0] ?? ''
  return full.split(';')[0]!.trim()
}

/** Текст на языке интерфейса из пары «оригинал + переводы»; язык урока не подходит. */
function translated(
  item: Record<string, unknown>,
  lang: string,
  locale: string,
): string | undefined {
  const pick = (k: string) => (k !== lang && typeof item[k] === 'string' ? item[k] : undefined)
  return (
    pick(locale) ??
    pick('ru') ??
    Object.keys(item)
      .filter((k) => k.length === 2)
      .map(pick)
      .find(Boolean)
  )
}

/** Слова урока в его порядке; пропавшие из словаря пропускаются. */
export function lessonWords(lesson: WordsLesson, entries: readonly CatalogEntry[]): CatalogEntry[] {
  const byId = new Map(entries.map((e) => [e.id, e]))
  return lesson.words.flatMap((id) => {
    const e = byId.get(id)
    return e ? [e] : []
  })
}

export function introSteps(lesson: WordsLesson, words: readonly CatalogEntry[]): IntroStep[] {
  return [
    ...words.map((word) => ({ kind: 'word' as const, word })),
    { kind: 'phrase' as const },
    ...(lesson.rule ? [{ kind: 'rule' as const }] : []),
  ]
}

/**
 * Кандидаты в отвлекающие (TD-5): той же части речи — слова урока, затем словарь по близости
 * ранга; прочие слова урока — добором. Иначе ответ угадывается по виду перевода.
 */
function neighbours(
  word: CatalogEntry,
  words: readonly CatalogEntry[],
  entries: readonly CatalogEntry[],
): CatalogEntry[] {
  const others = words.filter((w) => w.id !== word.id)
  const lessonIds = new Set(words.map((w) => w.id))
  const dictionary = entries
    .filter((e) => e.pos === word.pos && !lessonIds.has(e.id))
    .sort((a, b) => Math.abs(a.rank - word.rank) - Math.abs(b.rank - word.rank))
  return [
    ...others.filter((w) => w.pos === word.pos),
    ...dictionary,
    ...others.filter((w) => w.pos !== word.pos),
  ]
}

/** Правильный + до OPTIONS−1 отвлекающих с другим текстом (ключ к корректности). */
function options(answer: string, candidates: readonly string[], rng: Rng): string[] {
  const seen = new Set([normalizeAnswer(answer)])
  const picked: string[] = []
  for (const c of candidates) {
    if (picked.length === OPTIONS - 1) break
    const key = normalizeAnswer(c)
    if (!key || seen.has(key)) continue
    seen.add(key)
    picked.push(c)
  }
  return shuffle([answer, ...picked], rng)
}

function exerciseTask(ex: Exercise, lang: string, locale: string): Task | null {
  const sentence = typeof ex[lang] === 'string' ? ex[lang] : undefined
  const translation = translated(ex, lang, locale)
  const accepted = (a: string | string[]) => (typeof a === 'string' ? [a] : a)
  switch (ex.type) {
    case 'fill':
      return sentence
        ? {
            kind: 'fill',
            sentence,
            accepted: accepted(ex.answer),
            ...(translation && { translation }),
          }
        : null
    case 'build':
      return sentence
        ? { kind: 'build', sentence, blocks: [], ...(translation && { translation }) }
        : null
    case 'translate':
      return translation
        ? { kind: 'translate', prompt: translation, accepted: accepted(ex.answer) }
        : null
  }
}

export interface PracticeOptions {
  locale: string
  /** Есть голос языка урока — иначе «услышать» пропускается (AC-3). */
  canHear: boolean
  rng: Rng
}

/** Задание «узнать»: слово → перевод из вариантов; `siblings` — слова урока (D-27, TD-5). */
export function recognizeTask(
  word: CatalogEntry,
  siblings: readonly CatalogEntry[],
  entries: readonly CatalogEntry[],
  { locale, rng }: Pick<PracticeOptions, 'locale' | 'rng'>,
): Task {
  const answer = shortTranslation(word, locale)
  const others = neighbours(word, siblings, entries).map((e) => shortTranslation(e, locale))
  return { kind: 'recognize', word, answer, options: options(answer, others, rng) }
}

/** Задание «услышать»: голос → написание из вариантов. */
export function hearTask(
  word: CatalogEntry,
  siblings: readonly CatalogEntry[],
  entries: readonly CatalogEntry[],
  { rng }: Pick<PracticeOptions, 'rng'>,
): Task {
  const others = neighbours(word, siblings, entries).map((e) => e.lemma)
  return { kind: 'hear', word, answer: word.lemma, options: options(word.lemma, others, rng) }
}

/** Слово с артиклем, если он есть (существительные ES): вариант сразу учит род. */
const withArticle = (e: CatalogEntry): string => {
  const art = article(e)
  return art ? `${art} ${e.lemma}` : e.lemma
}

/** Задание «выбрать слово»: перевод → слово из вариантов той же части речи (LNG-S1-030). */
export function pickTask(
  word: CatalogEntry,
  siblings: readonly CatalogEntry[],
  entries: readonly CatalogEntry[],
  { locale, rng }: Pick<PracticeOptions, 'locale' | 'rng'>,
): Task {
  const prompt = shortTranslation(word, locale)
  const answer = withArticle(word)
  // Отвлекающий с тем же переводом сделал бы вопрос нерешаемым.
  const others = neighbours(word, siblings, entries)
    .filter((e) => normalizeAnswer(shortTranslation(e, locale)) !== normalizeAnswer(prompt))
    .map(withArticle)
  return { kind: 'pick', word, prompt, answer, options: options(answer, others, rng) }
}

/** Задание «вспомнить»: перевод → слово (с артиклем тоже верно). */
export function recallTask(word: CatalogEntry, { locale }: Pick<PracticeOptions, 'locale'>): Task {
  const art = article(word)
  return {
    kind: 'recall',
    word,
    prompt: shortTranslation(word, locale),
    accepted: art ? [word.lemma, `${art} ${word.lemma}`] : [word.lemma],
  }
}

export function buildPractice(
  lesson: WordsLesson,
  words: readonly CatalogEntry[],
  entries: readonly CatalogEntry[],
  opts: PracticeOptions,
): Task[] {
  const recognize = words.map((w) => recognizeTask(w, words, entries, opts))
  const hear = opts.canHear ? words.map((w) => hearTask(w, words, entries, opts)) : []
  const recall = words.map((w) => recallTask(w, opts))
  const { rng, locale } = opts
  const apply = (lesson.exercises ?? []).flatMap((ex) => {
    const task = exerciseTask(ex, lesson.lang, locale)
    if (task?.kind === 'build' && ex.type === 'build')
      task.blocks = scramble([...splitBlocks(task.sentence), ...(ex.extra ?? [])], rng)
    return task ? [task] : []
  })
  return [...recognize, ...hear, ...recall, ...apply]
}
