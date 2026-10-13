// Активность и серия дней (LNG-S1-025): чистые функции по журналу.

/** Локальный день `YYYY-MM-DD` (D-4). */
export function localDay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** День после `day` по календарю (через полдень — без сдвигов из-за перехода на летнее время). */
export function nextDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  return localDay(new Date(y, m - 1, d + 1, 12))
}

export const FREEZE_EVERY = 7
export const FREEZE_MAX = 2

export interface Streak {
  /** Подряд активных дней (с учётом «заморозок»). */
  days: number
  /** Сколько «заморозок» осталось. */
  freezes: number
  /** Сегодня уже есть активность. */
  todayDone: boolean
}

/**
 * Серия по журналу (D-1, D-3): проходим дни от первого активного до вчера, затем сегодня.
 * Активный день — серия +1 (каждые 7 — заморозка, не больше 2); пропуск — тратит заморозку
 * или обнуляет серию. Сегодняшний день без активности серию не трогает (AC-4).
 */
export function streak(activeDays: ReadonlySet<string>, today: string): Streak {
  const first = [...activeDays].filter((d) => d <= today).sort()[0]
  if (!first) return { days: 0, freezes: 0, todayDone: false }
  let days = 0
  let freezes = 0
  for (let day = first; day <= today; day = nextDay(day)) {
    if (activeDays.has(day)) {
      days++
      if (days % FREEZE_EVERY === 0) freezes = Math.min(FREEZE_MAX, freezes + 1)
    } else if (day !== today) {
      if (freezes > 0) freezes--
      else days = 0
    }
  }
  return { days, freezes, todayDone: activeDays.has(today) }
}

/** Детерминированный индекс 0…n−1 по строке (выбор фразы дня, D-5). */
export function pickIndex(seed: string, n: number): number {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return n ? h % n : 0
}
