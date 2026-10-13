import { keyOf, type CatalogEntry, type WordStatus } from '@/features/dictionary'

// Быстрая проверка «знаю / не знаю» (LNG-S1-021, D-12): порядок слов, порции, итог.

export const BATCH = 10

const POS_ORDER = ['verb', 'noun', 'adj', 'adv']
const posIndex = (pos: string) => {
  const i = POS_ORDER.indexOf(pos)
  return i < 0 ? POS_ORDER.length : i
}

/** D-2: ранги частей речи вперемешку — 1-й глагол, 1-е существительное, …, 2-й глагол. */
export function placementOrder(entries: readonly CatalogEntry[]): CatalogEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank || posIndex(a.pos) - posIndex(b.pos))
}

type StatusOf = (key: string) => WordStatus | undefined

/** Следующая порция — первые слова порядка без отметки: продолжение после выхода (AC-3). */
export function nextBatch(
  order: readonly CatalogEntry[],
  statusOf: StatusOf,
  size = BATCH,
): CatalogEntry[] {
  return order.filter((e) => statusOf(keyOf(e)) === undefined).slice(0, size)
}

/** Итоговое состояние порции: отмеченные — unknown, остальные — known. */
export function batchStatuses(
  batch: readonly CatalogEntry[],
  unknownIds: ReadonlySet<string>,
): { key: string; status: WordStatus }[] {
  return batch.map((e) => ({ key: keyOf(e), status: unknownIds.has(e.id) ? 'unknown' : 'known' }))
}

export interface PlacementSummary {
  total: number
  checked: number
  known: number
}

export function summarize(order: readonly CatalogEntry[], statusOf: StatusOf): PlacementSummary {
  let checked = 0
  let known = 0
  for (const e of order) {
    const s = statusOf(keyOf(e))
    if (s) checked++
    if (s === 'known') known++
  }
  return { total: order.length, checked, known }
}
