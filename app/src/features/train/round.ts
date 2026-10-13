import { keyOf, type CatalogEntry } from '@/features/dictionary'
import {
  answerPractice,
  currentTask,
  hearTask,
  pickTask,
  recallTask,
  recognizeTask,
  startPractice,
  type Practice,
  type Task,
} from '@/features/lessons'
import { gradeFor, type Card, type Grade } from '@/features/review'

import type { PlannedWord } from './plan'

// Шаги и оценка раунда тренировки (LNG-S1-030, D-35).

/** Стабильность (дни): ниже — слово молодое, с этой — зрелое (можно писать). */
const YOUNG_BELOW = 3
const MATURE_FROM = 21

export type TrainKind = 'recognize' | 'pick' | 'hear' | 'recall'

/**
 * Задание по зрелости карточки: в основном «слово → перевод», иногда «перевод → выбери слово»,
 * у окрепших — «услышь», у зрелых — «напиши». Новое слово — только «узнай» (закрепление — потом).
 */
export function trainKind(card: Card | undefined, canHear: boolean, rng: () => number): TrainKind {
  if (!card || card.state === 'new') return 'recognize'
  const r = rng()
  const hear: TrainKind = canHear ? 'hear' : 'recognize'
  if (card.stability < YOUNG_BELOW) return r < 0.8 ? 'recognize' : 'pick'
  if (card.stability < MATURE_FROM) return r < 0.55 ? 'recognize' : r < 0.85 ? 'pick' : hear
  return r < 0.4 ? 'recognize' : r < 0.7 ? 'pick' : r < 0.85 ? 'recall' : hear
}

export type RoundStep =
  | { kind: 'intro'; word: CatalogEntry }
  | { kind: 'task'; key: string; word: CatalogEntry; task: Task }

export interface RoundOptions {
  locale: string
  canHear: boolean
  rng: () => number
}

function task(
  word: CatalogEntry,
  kind: TrainKind,
  entries: readonly CatalogEntry[],
  opts: RoundOptions,
): RoundStep {
  const t =
    kind === 'pick'
      ? pickTask(word, [], entries, opts)
      : kind === 'hear'
        ? hearTask(word, [], entries, opts)
        : kind === 'recall'
          ? recallTask(word, opts)
          : recognizeTask(word, [], entries, opts)
  return { kind: 'task', key: keyOf(word), word, task: t }
}

/**
 * Шаги раунда: повторения вперемешку с новыми (новое — карточка + «узнай»), новые равномерно
 * между повторениями; в конце — «выбери слово» для каждого нового (вспомнить через паузу).
 */
export function buildRound(
  words: readonly PlannedWord[],
  entries: readonly CatalogEntry[],
  opts: RoundOptions,
): RoundStep[] {
  const reviews = words.filter((w) => w.card)
  const news = words.filter((w) => !w.card).map((w) => w.word)
  const kinds = reviews.map((w) => trainKind(w.card, opts.canHear, opts.rng))
  // AC-4: «перевод → слово» в каждом раунде; без новых — у последнего окрепшего «узнай».
  if (!news.length && !kinds.includes('pick')) {
    const i = kinds.lastIndexOf('recognize')
    if (i >= 0 && reviews[i]!.card!.state === 'review') kinds[i] = 'pick'
  }
  const R = reviews.length
  const N = news.length
  const steps: RoundStep[] = []
  let r = 0
  let n = 0
  while (r < R || n < N) {
    // Новое — когда доля выданных новых отстаёт от доли повторений; раунд открывает повторение.
    if (n < N && (r >= R || (n + 1) * (R + 1) < (r + 1) * (N + 1))) {
      const word = news[n++]!
      steps.push({ kind: 'intro', word }, task(word, 'recognize', entries, opts))
    } else {
      steps.push(task(reviews[r]!.word, kinds[r]!, entries, opts))
      r++
    }
  }
  for (const word of news) steps.push(task(word, 'pick', entries, opts))
  return steps
}

export interface Round {
  practice: Practice<RoundStep>
  /** Сколько первых (не повторных) заданий слова ещё впереди. */
  left: Record<string, number>
  /** Худшая оценка слова за раунд: одна ошибка — «Забыл» для всего слова. */
  worst: Record<string, Grade>
}

export function startRound(steps: readonly RoundStep[]): Round {
  const left: Record<string, number> = {}
  for (const s of steps) if (s.kind === 'task') left[s.key] = (left[s.key] ?? 0) + 1
  return { practice: startPractice(steps), left, worst: {} }
}

export interface Graded {
  key: string
  grade: Grade
}

/**
 * Ответ на текущий шаг (знакомство — `correct: true`). Оценка слова выходит один раз —
 * после его последнего первого задания; повтор после ошибки не оценивает (D-4 LNG-S1-024).
 */
export function answerRound(
  round: Round,
  correct: boolean,
  accent = false,
): { round: Round; graded?: Graded } {
  const item = currentTask(round.practice)
  if (!item) return { round }
  const practice = answerPractice(round.practice, correct)
  const step = item.task
  if (step.kind !== 'task' || item.retry) return { round: { ...round, practice } }
  const grade = Math.min(round.worst[step.key] ?? 3, gradeFor(correct, accent)) as Grade
  const left = round.left[step.key]! - 1
  return {
    round: {
      practice,
      left: { ...round.left, [step.key]: left },
      worst: { ...round.worst, [step.key]: grade },
    },
    ...(left === 0 && { graded: { key: step.key, grade } }),
  }
}
