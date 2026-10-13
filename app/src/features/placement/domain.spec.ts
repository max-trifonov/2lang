import { describe, expect, it } from 'vitest'

import type { CatalogEntry, WordStatus } from '@/features/dictionary'

import { batchStatuses, nextBatch, placementOrder, summarize } from './domain'

const e = (id: string, pos: CatalogEntry['pos'], rank: number): CatalogEntry => ({
  id,
  lemma: id,
  pos,
  rank,
  lang: 'en',
  translations: { ru: id },
})

const entries = [
  e('time', 'noun', 1),
  e('so', 'adv', 1),
  e('be', 'verb', 1),
  e('good', 'adj', 1),
  e('have', 'verb', 2),
  e('man', 'noun', 2),
  e('little', 'adj', 2),
]

describe('быстрая проверка: порядок и порции', () => {
  it('ранги вперемешку: глагол, существительное, прилагательное, наречие (D-2)', () => {
    expect(placementOrder(entries).map((x) => x.id)).toEqual([
      'be',
      'time',
      'good',
      'so',
      'have',
      'man',
      'little',
    ])
  })

  it('следующая порция — первые слова без отметки (продолжение, AC-3)', () => {
    const order = placementOrder(entries)
    const statuses = new Map<string, WordStatus>([
      ['word:en:be', 'known'],
      ['word:en:time', 'unknown'],
    ])
    expect(nextBatch(order, (k) => statuses.get(k), 3).map((x) => x.id)).toEqual([
      'good',
      'so',
      'have',
    ])
    expect(nextBatch(order, () => 'known')).toEqual([])
  })

  it('порция: отмеченные — unknown, остальные — known', () => {
    expect(batchStatuses([entries[0]!, entries[1]!], new Set(['so']))).toEqual([
      { key: 'word:en:time', status: 'known' },
      { key: 'word:en:so', status: 'unknown' },
    ])
  })

  it('итог: проверено и известно из всего словаря', () => {
    const statuses = new Map<string, WordStatus>([
      ['word:en:be', 'known'],
      ['word:en:time', 'unknown'],
      ['word:en:good', 'known'],
    ])
    expect(summarize(placementOrder(entries), (k) => statuses.get(k))).toEqual({
      total: 7,
      checked: 3,
      known: 2,
    })
  })
})
