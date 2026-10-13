import {
  LISTS,
  keyOf,
  type CatalogEntry,
  type ListId,
  type WordStatus,
} from '@/features/dictionary'
import { DAY_MS, isDue, retrievability, type Card } from '@/features/review'

// Подбор раунда тренировки по словарю (LNG-S1-030, D-35): к повторению → новые по частоте →
// досрочные повторы самых слабых. Чистые функции: всё состояние ученика приходит параметрами.

export type TrainScope = 'all' | ListId | 'saved' | 'hard'
export const SCOPES: readonly TrainScope[] = ['all', ...LISTS, 'saved', 'hard']

export const ROUND_SIZE = 15
export const NEW_MAX = 5
/** Даже при завале повторений раунд приносит пару новых слов — иначе словарь «стоит». */
export const NEW_MIN = 2
/** Сложность FSRS (1…10), с которой слово считается трудным: первый ответ «Забыл» даёт ~7,2. */
const HARD_DIFFICULTY = 7

export interface PlanInput {
  /** Словарь одного языка. */
  entries: readonly CatalogEntry[]
  /** Карточки профиля (любых языков — лишние отсеиваются по словарю). */
  cards: ReadonlyMap<string, Card>
  scope: TrainScope
  saved: ReadonlySet<string>
  statuses: ReadonlyMap<string, WordStatus>
  now: Date
  size?: number
}

/** Слово раунда; без карточки — новое. */
export interface PlannedWord {
  word: CatalogEntry
  card?: Card
}

export const isHard = (card: Card): boolean =>
  card.state === 'review' && (card.lapses > 0 || card.difficulty >= HARD_DIFFICULTY)

/** Запоминаемость сейчас: у карточки без повторений — 0 (её пора проверить первой). */
function recall(card: Card, now: Date): number {
  if (!card.lastReview || card.state === 'new') return 0
  return retrievability((now.getTime() - Date.parse(card.lastReview)) / DAY_MS, card.stability)
}

function startOfDay(now: Date): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Самые забытые первыми, при равной запоминаемости — более сложные. */
const weakestFirst =
  (now: Date) =>
  (a: PlannedWord, b: PlannedWord): number =>
    recall(a.card!, now) - recall(b.card!, now) || b.card!.difficulty - a.card!.difficulty

interface Pools {
  due: PlannedWord[]
  fresh: CatalogEntry[]
  ahead: PlannedWord[]
}

function pools({ entries, cards, scope, saved, statuses, now }: PlanInput): Pools {
  const due: PlannedWord[] = []
  const fresh: CatalogEntry[] = []
  const ahead: PlannedWord[] = []
  const today = startOfDay(now)
  for (const word of entries) {
    const key = keyOf(word)
    if (scope === 'saved' ? !saved.has(key) : LISTS.includes(scope as ListId) && word.pos !== scope)
      continue
    const card = cards.get(key)
    if (!card) {
      if (scope !== 'hard' && statuses.get(key) !== 'known') fresh.push(word)
      continue
    }
    if (scope === 'hard' && !isHard(card)) continue
    if (isDue(card, now)) due.push({ word, card })
    // Досрочно — только то, что уже повторялось и не сегодня; в «трудных» срок не важен.
    else if (
      scope === 'hard' ||
      (card.state === 'review' && card.lastReview && Date.parse(card.lastReview) < today)
    )
      ahead.push({ word, card })
  }
  const order = (e: CatalogEntry) => LISTS.indexOf(e.pos as ListId)
  const unknown = (e: CatalogEntry) => (statuses.get(keyOf(e)) === 'unknown' ? 0 : 1)
  fresh.sort((a, b) => unknown(a) - unknown(b) || a.rank - b.rank || order(a) - order(b))
  due.sort(weakestFirst(now))
  ahead.sort(weakestFirst(now))
  return { due, fresh, ahead }
}

/** Слова раунда: сначала повторения (в порядке важности), потом новые. */
export function planRound(input: PlanInput): PlannedWord[] {
  const size = input.size ?? ROUND_SIZE
  const { due, fresh, ahead } = pools(input)
  const newCount = Math.min(fresh.length, NEW_MAX, Math.max(NEW_MIN, size - due.length))
  const review = due.slice(0, size - newCount)
  const extra = ahead.slice(0, Math.max(0, size - review.length - newCount))
  return [...review, ...extra, ...fresh.slice(0, newCount).map((word) => ({ word }))]
}

export interface ScopeStats {
  due: number
  fresh: number
  hard: number
}

/** Счётчики для экрана настройки: к повторению и новых — в разделе, трудных — во всём языке. */
export function scopeStats(input: PlanInput): ScopeStats {
  const { due, fresh } = pools(input)
  const hard = pools({ ...input, scope: 'hard' })
  return { due: due.length, fresh: fresh.length, hard: hard.due.length + hard.ahead.length }
}
