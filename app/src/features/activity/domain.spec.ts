import { describe, expect, it } from 'vitest'

import { localDay, nextDay, pickIndex, streak } from './domain'

const days = (...list: string[]) => new Set(list)
/** Подряд n дней, заканчивая `last`. */
function run(last: string, n: number): string[] {
  const out = [last]
  const [y, m, d] = last.split('-').map(Number) as [number, number, number]
  for (let i = 1; i < n; i++) out.unshift(localDay(new Date(y, m - 1, d - i, 12)))
  return out
}

describe('серия дней (К1, AC-3, AC-4)', () => {
  it('день календаря: локальный, переход через месяц и год', () => {
    expect(localDay(new Date(2026, 9, 2, 23, 59))).toBe('2026-10-02')
    expect(localDay(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05')
    expect(nextDay('2026-10-31')).toBe('2026-11-01')
    expect(nextDay('2026-12-31')).toBe('2027-01-01')
    expect(nextDay('2026-03-28')).toBe('2026-03-29')
  })

  it('пустой журнал — серии нет', () => {
    expect(streak(days(), '2026-10-02')).toEqual({ days: 0, freezes: 0, todayDone: false })
  })

  it('подряд, включая сегодня', () => {
    expect(streak(days('2026-10-01', '2026-10-02'), '2026-10-02')).toEqual({
      days: 2,
      freezes: 0,
      todayDone: true,
    })
  })

  it('сегодня без активности серию не обрывает и не продлевает (AC-4)', () => {
    expect(streak(days('2026-09-30', '2026-10-01'), '2026-10-02')).toEqual({
      days: 2,
      freezes: 0,
      todayDone: false,
    })
  })

  it('пропуск вчерашнего дня без заморозки обнуляет серию', () => {
    expect(streak(days('2026-09-28', '2026-09-29'), '2026-10-02').days).toBe(0)
    expect(streak(days('2026-09-28', '2026-09-29', '2026-10-02'), '2026-10-02').days).toBe(1)
  })

  it('каждые 7 дней — заморозка; пропуск тратит её и серия продолжается', () => {
    const week = run('2026-09-24', 7) // 7 подряд → 1 заморозка
    const withGap = days(...week, '2026-09-26') // 25-го пропуск, 26-го снова
    expect(streak(days(...week), '2026-09-24')).toMatchObject({ days: 7, freezes: 1 })
    expect(streak(withGap, '2026-09-26')).toMatchObject({ days: 8, freezes: 0 })
  })

  it('заморозок не больше двух', () => {
    expect(streak(days(...run('2026-10-02', 28)), '2026-10-02')).toMatchObject({
      days: 28,
      freezes: 2,
    })
  })

  it('заморозка закрывает ровно один пропуск, второй подряд обнуляет', () => {
    const week = run('2026-09-24', 7)
    expect(streak(days(...week, '2026-09-27'), '2026-09-27').days).toBe(1)
  })

  it('активность в будущем (сдвиг часов) серию не ломает', () => {
    expect(streak(days('2026-10-02', '2026-10-09'), '2026-10-02').days).toBe(1)
  })
})

describe('индекс по строке', () => {
  it('детерминирован, в пределах n, при n = 0 — 0', () => {
    expect(pickIndex('p1:2026-10-02', 5)).toBe(pickIndex('p1:2026-10-02', 5))
    for (let i = 0; i < 30; i++) expect(pickIndex(`p:${i}`, 4)).toBeLessThan(4)
    expect(pickIndex('x', 0)).toBe(0)
  })
})
