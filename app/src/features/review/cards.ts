import {
  DESIRED_RETENTION,
  nextDifficulty,
  nextInterval,
  forgetStability,
  initialDifficulty,
  initialStability,
  recallStability,
  retrievability,
  type Grade,
} from './fsrs'

// Карточка повторения слова (LNG-S1-023): ключ — ключ слова `word:<lang>:<id>` (D-4).

export const DAY_MS = 86_400_000

export interface Card {
  profileId: string
  key: string
  lang: string
  state: 'new' | 'review'
  /** ISO-время, когда карточку пора повторить. */
  due: string
  stability: number
  difficulty: number
  lastReview?: string
  reps: number
  lapses: number
}

export const addDays = (from: Date, days: number): Date => new Date(from.getTime() + days * DAY_MS)

/** `word:<lang>:<id>` → язык; id слова может содержать двоеточия только после языка. */
export const langOfKey = (key: string): string => key.split(':')[1] ?? ''

/** Новая карточка слова урока: первое повторение завтра. */
export function newCard(profileId: string, key: string, now: Date): Card {
  return {
    profileId,
    key,
    lang: langOfKey(key),
    state: 'new',
    due: addDays(now, 1).toISOString(),
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
  }
}

/** Детерминированный разброс 0…19 по ключу слова. */
function spread(key: string): number {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 20
}

/** Известное слово (D-2, D-12): редкое повторение через 21–40 дней. */
export function knownCard(profileId: string, key: string, now: Date): Card {
  const days = 21 + spread(key)
  return {
    profileId,
    key,
    lang: langOfKey(key),
    state: 'review',
    due: addDays(now, days).toISOString(),
    stability: days,
    difficulty: 3,
    lastReview: now.toISOString(),
    reps: 1,
    lapses: 0,
  }
}

/** Применить оценку; время считается от прошлого повторения, а не от срока. */
export function review(card: Card, grade: Grade, now: Date): Card {
  let stability: number
  let difficulty: number
  if (card.state === 'new' || !card.lastReview) {
    stability = initialStability(grade)
    difficulty = initialDifficulty(grade)
  } else {
    const elapsed = (now.getTime() - new Date(card.lastReview).getTime()) / DAY_MS
    const r = retrievability(elapsed, card.stability)
    difficulty = nextDifficulty(card.difficulty, grade)
    stability =
      grade === 1
        ? forgetStability(card.difficulty, card.stability, r)
        : recallStability(card.difficulty, card.stability, r, grade)
  }
  return {
    ...card,
    state: 'review',
    stability,
    difficulty,
    lastReview: now.toISOString(),
    due: addDays(now, nextInterval(stability, DESIRED_RETENTION)).toISOString(),
    reps: card.reps + 1,
    lapses: card.lapses + (grade === 1 && card.state === 'review' ? 1 : 0),
  }
}

/** Конец локальных суток (D-3): всё, что созревает до него, — «к повторению сегодня». */
export function endOfDay(now: Date): Date {
  const d = new Date(now)
  d.setHours(23, 59, 59, 999)
  return d
}

export const isDue = (card: Card, now: Date): boolean =>
  new Date(card.due).getTime() <= endOfDay(now).getTime()
