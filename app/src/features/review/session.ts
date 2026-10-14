import { keyOf, type CatalogEntry } from '@/features/dictionary'
import {
  buildGrammarPractice,
  hearTask,
  recallTask,
  recognizeTask,
  scramble,
  splitBlocks,
  type GrammarLesson,
  type Task,
} from '@/features/lessons'

import type { Card } from './cards'
import type { Grade } from './fsrs'

// Сессия повторения (LNG-S1-024): отбор карточек, задание по зрелости, оценка по ответу.

export const SESSION_SIZE = 20
/** Порог стабильности (дни): ниже — узнать, ниже второго — услышать, иначе — вспомнить. */
const RECOGNIZE_BELOW = 3
const HEAR_BELOW = 10

export type ReviewKind = 'recognize' | 'hear' | 'recall'

/** D-1 LNG-S1-024: лестница по зрелости; без голоса «услышать» заменяется «узнать». */
export function kindFor(card: Card, canHear: boolean): ReviewKind {
  if (card.state === 'new' || card.stability < RECOGNIZE_BELOW) return 'recognize'
  if (card.stability < HEAR_BELOW) return canHear ? 'hear' : 'recognize'
  return 'recall'
}

/** D-1: ошибка — «Забыл», верно с подсказкой написания — «Трудно», верно — «Хорошо». */
export function gradeFor(correct: boolean, accent: boolean): Grade {
  if (!correct) return 1
  return accent ? 2 : 3
}

export interface ReviewItem {
  card: Card
  task: Task
  /** Тема грамматики, из которой задание (D-40): подпись «Правило» над заданием. */
  rule?: GrammarLesson
}

export interface ReviewOptions {
  locale: string
  canHear: boolean
  rng: () => number
  /** Фразы текстов по ключу карточки (LNG-S1-027); карточки фраз без записи пропускаются. */
  phrases?: ReadonlyMap<string, { text: string; translation: string }>
  /** Темы грамматики по ключу карточки (D-40); карточки тем без урока пропускаются. */
  grammar?: ReadonlyMap<string, GrammarLesson>
}

export const isPhraseKey = (key: string): boolean => key.startsWith('phrase:')

/** Фраза: пока не отложилась — собрать из слов, потом — вспомнить по переводу целиком. */
export function phraseTask(
  card: Card,
  phrase: { text: string; translation: string },
  rng: () => number,
): Task {
  if (card.state === 'new' || card.stability < HEAR_BELOW) {
    return {
      kind: 'build',
      sentence: phrase.text,
      translation: phrase.translation,
      blocks: scramble(splitBlocks(phrase.text), rng),
    }
  }
  return { kind: 'translate', prompt: phrase.translation, accepted: [phrase.text] }
}

/** Карточка темы грамматики (D-40): `grammar:<lang>:<id урока>`. */
export const grammarKey = (lesson: Pick<GrammarLesson, 'lang' | 'id'>): string =>
  `grammar:${lesson.lang}:${lesson.id}`

export const isGrammarKey = (key: string): boolean => key.startsWith('grammar:')

/**
 * Тема в повторении (D-40): одно случайное упражнение темы — каждый раз другое, чтобы правило
 * вспоминалось, а не ответ. «Своё предложение» не берём: самоотметка не годится для оценки FSRS.
 */
export function grammarTask(
  lesson: GrammarLesson,
  opts: Pick<ReviewOptions, 'locale' | 'rng'>,
): Task | null {
  const tasks = buildGrammarPractice(lesson, opts).filter((t) => t.kind !== 'compose')
  return tasks[Math.floor(opts.rng() * tasks.length)] ?? null
}

/** Карточки (уже отсортированные по сроку) → задания; слова, которых нет в словаре, пропускаются. */
export function buildReview(
  cards: readonly Card[],
  entries: readonly CatalogEntry[],
  opts: ReviewOptions,
  size = SESSION_SIZE,
): ReviewItem[] {
  const byKey = new Map(entries.map((e) => [keyOf(e), e]))
  const items: ReviewItem[] = []
  for (const card of cards) {
    if (items.length >= size) break
    if (isPhraseKey(card.key)) {
      const phrase = opts.phrases?.get(card.key)
      if (phrase) items.push({ card, task: phraseTask(card, phrase, opts.rng) })
      continue
    }
    if (isGrammarKey(card.key)) {
      const rule = opts.grammar?.get(card.key)
      const task = rule && grammarTask(rule, opts)
      if (task) items.push({ card, task, rule })
      continue
    }
    const word = byKey.get(card.key)
    if (!word) continue
    const kind = kindFor(card, opts.canHear)
    const task =
      kind === 'recall'
        ? recallTask(word, opts)
        : kind === 'hear'
          ? hearTask(word, [], entries, opts)
          : recognizeTask(word, [], entries, opts)
    items.push({ card, task })
  }
  return items
}
