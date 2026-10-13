import { describe, expect, it } from 'vitest'

import {
  forgetStability,
  initialDifficulty,
  initialStability,
  nextDifficulty,
  nextInterval,
  recallStability,
  retrievability,
  type Grade,
} from './fsrs'

const GRADES: Grade[] = [1, 2, 3, 4]

describe('FSRS-5: эталоны и свойства (К1)', () => {
  it('начальная стабильность — параметры w0…w3 (AC-1)', () => {
    expect(GRADES.map(initialStability)).toEqual([0.40255, 1.18385, 3.173, 15.69105])
  })

  it('начальная сложность: Хорошо ≈ 5,28, растёт к «Забыл», убывает к «Легко» (AC-1)', () => {
    expect(initialDifficulty(3)).toBeCloseTo(5.2829, 3)
    const d = GRADES.map(initialDifficulty)
    expect(d[0]).toBeCloseTo(7.1949, 3)
    for (let i = 1; i < d.length; i++) expect(d[i]!).toBeLessThan(d[i - 1]!)
  })

  it('запоминаемость: 1 в момент повторения, 0,9 при t = S, убывает (AC-2)', () => {
    expect(retrievability(0, 5)).toBe(1)
    expect(retrievability(5, 5)).toBeCloseTo(0.9, 10)
    expect(retrievability(10, 5)).toBeLessThan(retrievability(5, 5))
  })

  it('интервал при запоминаемости 0,9 равен стабильности; не меньше 1 дня', () => {
    expect(nextInterval(3.173)).toBe(3)
    expect(nextInterval(15.69105)).toBe(16)
    expect(nextInterval(0.1)).toBe(1)
    expect(nextInterval(1e9)).toBe(36500)
  })

  it('чем ниже желаемая запоминаемость, тем длиннее интервал', () => {
    expect(nextInterval(10, 0.8)).toBeGreaterThan(nextInterval(10, 0.9))
  })

  it('сложность всегда в [1, 10]', () => {
    for (let d = 1; d <= 10; d += 0.5)
      for (const g of GRADES) {
        const n = nextDifficulty(d, g)
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(10)
      }
  })

  it('«Забыл» поднимает сложность, «Легко» снижает', () => {
    expect(nextDifficulty(5, 1)).toBeGreaterThan(5)
    expect(nextDifficulty(5, 4)).toBeLessThan(5)
  })

  it('успех увеличивает стабильность: легко > хорошо > трудно > 1·S (AC-2)', () => {
    const s = 10
    const r = 0.9
    const [hard, good, easy] = ([2, 3, 4] as Grade[]).map((g) => recallStability(5, s, r, g))
    expect(hard!).toBeGreaterThan(s)
    expect(good!).toBeGreaterThan(hard!)
    expect(easy!).toBeGreaterThan(good!)
  })

  it('чем ниже запоминаемость к моменту ответа, тем больше прирост (эффект интервала)', () => {
    expect(recallStability(5, 10, 0.7, 3)).toBeGreaterThan(recallStability(5, 10, 0.95, 3))
  })

  it('провал уменьшает стабильность, но не ниже минимума', () => {
    for (const s of [0.5, 3, 30, 300]) {
      const next = forgetStability(6, s, 0.8)
      expect(next).toBeLessThanOrEqual(s)
      expect(next).toBeGreaterThanOrEqual(0.1)
    }
    expect(forgetStability(6, 30, 0.8)).toBeLessThan(30)
  })
})
