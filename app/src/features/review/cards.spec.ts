import { describe, expect, it } from 'vitest'

import { DAY_MS, isDue, knownCard, newCard, review } from './cards'

const t0 = new Date('2026-10-02T10:00:00')
const days = (n: number) => new Date(t0.getTime() + n * DAY_MS)

describe('карточки', () => {
  it('новая карточка: срок завтра, язык из ключа (AC-3)', () => {
    const c = newCard('p', 'word:es:tener', t0)
    expect(c).toMatchObject({ state: 'new', lang: 'es', reps: 0, lapses: 0 })
    expect(new Date(c.due).getTime()).toBe(t0.getTime() + DAY_MS)
  })

  it('первое «Хорошо»: S = 3,173, D ≈ 5,28, срок через 3 дня (AC-1)', () => {
    const c = review(newCard('p', 'word:es:tener', t0), 3, t0)
    expect(c.stability).toBeCloseTo(3.173, 3)
    expect(c.difficulty).toBeCloseTo(5.28, 2)
    expect(new Date(c.due).getTime()).toBe(days(3).getTime())
    expect(c).toMatchObject({ state: 'review', reps: 1, lapses: 0 })
  })

  it('первое «Забыл» новой карточки — не провал, срок через день', () => {
    const c = review(newCard('p', 'word:es:tener', t0), 1, t0)
    expect(c.lapses).toBe(0)
    expect(new Date(c.due).getTime()).toBe(days(1).getTime())
  })

  it('цепочка «Хорошо»: интервалы растут (AC-2)', () => {
    let c = review(newCard('p', 'word:es:tener', t0), 3, t0)
    let prev = 0
    for (let i = 0; i < 5; i++) {
      const at = new Date(c.due)
      c = review(c, 3, at)
      const interval = Math.round((new Date(c.due).getTime() - at.getTime()) / DAY_MS)
      expect(interval).toBeGreaterThan(prev)
      prev = interval
    }
  })

  it('«Забыл» на зрелой карточке: стабильность ниже, провал засчитан, срок близко (AC-2)', () => {
    let c = review(newCard('p', 'word:es:tener', t0), 3, t0)
    c = review(c, 3, new Date(c.due))
    const at = new Date(c.due)
    const lapsed = review(c, 1, at)
    expect(lapsed.stability).toBeLessThan(c.stability)
    expect(lapsed.lapses).toBe(1)
    expect(new Date(lapsed.due).getTime() - at.getTime()).toBeLessThanOrEqual(3 * DAY_MS)
  })

  it('просрочка даёт больший прирост, чем ответ в срок', () => {
    const base = review(newCard('p', 'word:es:tener', t0), 3, t0)
    const onTime = review(base, 3, days(3))
    const late = review(base, 3, days(12))
    expect(late.stability).toBeGreaterThan(onTime.stability)
  })

  it('известное слово: 21–40 дней, разные ключи — разные сроки, существующий ключ стабилен (AC-4)', () => {
    const keys = ['be', 'time', 'good', 'so', 'have', 'man', 'little', 'just'].map(
      (id) => `word:en:${id}`,
    )
    const spans = keys.map((k) => {
      const c = knownCard('p', k, t0)
      const span = Math.round((new Date(c.due).getTime() - t0.getTime()) / DAY_MS)
      expect(span).toBeGreaterThanOrEqual(21)
      expect(span).toBeLessThanOrEqual(40)
      expect(c.stability).toBe(span)
      return span
    })
    expect(new Set(spans).size).toBeGreaterThan(3)
    expect(knownCard('p', keys[0]!, days(5)).due).toBe(
      new Date(days(5).getTime() + spans[0]! * DAY_MS).toISOString(),
    )
  })

  it('«к повторению»: срок до конца локальных суток (D-3)', () => {
    const now = new Date('2026-10-02T10:00:00')
    const c = newCard('p', 'word:es:a', new Date('2026-10-01T22:00:00')) // срок 2 окт, 22:00
    expect(isDue(c, now)).toBe(true)
    expect(isDue({ ...c, due: new Date('2026-10-03T00:30:00').toISOString() }, now)).toBe(false)
  })
})
