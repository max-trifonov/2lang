import { describe, expect, it } from 'vitest'

import type { CatalogEntry, WordStatus } from '@/features/dictionary'
import type { Card } from '@/features/review'

import { planRound, scopeStats, type PlanInput } from './plan'

const NOW = new Date('2026-10-14T12:00:00')
const DAY = 86_400_000
const ago = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString()

const entry = (id: string, pos: CatalogEntry['pos'], rank: number): CatalogEntry => ({
  id,
  lemma: id,
  pos,
  rank,
  lang: 'es',
  translations: { ru: `${id}-ru` },
})

const verbs = Array.from({ length: 12 }, (_, i) => entry(`v${i + 1}`, 'verb', i + 1))
const nouns = Array.from({ length: 12 }, (_, i) => entry(`n${i + 1}`, 'noun', i + 1))
const entries = [...verbs, ...nouns]

/** Карточка «в повторении»: последний раз `last` дней назад со стабильностью `s`. */
const card = (id: string, over: Partial<Card> & { last?: number; s?: number } = {}): Card => {
  const { last = 5, s = 5, ...rest } = over
  return {
    profileId: 'p',
    key: `word:es:${id}`,
    lang: 'es',
    state: 'review',
    due: ago(last - s),
    stability: s,
    difficulty: 5,
    lastReview: ago(last),
    reps: 2,
    lapses: 0,
    ...rest,
  }
}

const input = (over: Partial<PlanInput> & { list?: Card[] } = {}): PlanInput => {
  const { list = [], ...rest } = over
  return {
    entries,
    cards: new Map(list.map((c) => [c.key, c])),
    scope: 'all',
    saved: new Set(),
    statuses: new Map(),
    now: NOW,
    ...rest,
  }
}
const ids = (input: PlanInput) => planRound(input).map((w) => w.word.id)

describe('подбор раунда (AC-2)', () => {
  it('сначала к повторению — самые забытые первыми, затем до 5 новых по частоте', () => {
    const list = [
      card('v1', { last: 6, s: 5 }), // R выше — просрочено на день
      card('v2', { last: 30, s: 5 }), // забыто сильнее всего
      card('n1', { last: 10, s: 5 }),
    ]
    // Новые — по рангу, при равном ранге части речи по порядку списков (глагол, сущ.).
    expect(ids(input({ list }))).toEqual(['v2', 'n1', 'v1', 'n2', 'v3', 'n3', 'v4', 'n4'])
  })

  it('при равной запоминаемости первой идёт более сложная карточка', () => {
    const list = [card('v1', { difficulty: 3 }), card('v2', { difficulty: 8 })]
    expect(ids(input({ list })).slice(0, 2)).toEqual(['v2', 'v1'])
  })

  it('новые: сначала отмеченные «не знаю», известные по проверке не предлагаются', () => {
    const statuses = new Map<string, WordStatus>([
      ['word:es:v1', 'known'],
      ['word:es:n2', 'known'],
      ['word:es:v12', 'unknown'],
    ])
    expect(ids(input({ statuses }))).toEqual(['v12', 'n1', 'v2', 'v3', 'n3'])
  })

  it('слово с карточкой (из урока, срок завтра) новым не считается и не повторяется досрочно', () => {
    const lesson = card('v1', { state: 'new', due: ago(-1), stability: 0 })
    delete lesson.lastReview
    expect(ids(input({ list: [lesson] }))).not.toContain('v1')
  })

  it('раздел: только глаголы; «мои слова» — только отмеченные', () => {
    expect(planRound(input({ scope: 'verb' })).every((w) => w.word.pos === 'verb')).toBe(true)
    const saved = new Set(['word:es:n7', 'word:es:v9'])
    expect(ids(input({ scope: 'saved', saved }))).toEqual(['n7', 'v9'])
  })

  it('завал повторений: не больше 15 слов, но 2 новых всё равно', () => {
    const list = [...verbs, ...nouns.slice(0, 8)].map((e) => card(e.id))
    const plan = planRound(input({ list }))
    expect(plan).toHaveLength(15)
    expect(plan.filter((w) => !w.card).map((w) => w.word.id)).toEqual(['n9', 'n10'])
  })

  it('мало к повторению — добор досрочными, кроме повторённых сегодня', () => {
    const list = [
      card('v1', { last: 10, s: 5 }), // к повторению
      card('v2', { last: 2, s: 30 }), // не срок — досрочно
      card('v3', { last: 0, s: 3 }), // повторено сегодня — нет
    ]
    const plan = planRound(input({ list, scope: 'verb' }))
    expect(plan.filter((w) => w.card).map((w) => w.word.id)).toEqual(['v1', 'v2'])
  })
})

describe('раздел «с ошибками» (AC-6)', () => {
  const list = [
    card('v1', { lapses: 1, last: 1, s: 20 }), // провал, срок не подошёл
    card('v2', { difficulty: 7.2, last: 0, s: 0.4 }), // «Забыл» на первом ответе, сегодня
    card('v3', { difficulty: 5 }), // обычная
    card('n1', { lapses: 2, last: 9, s: 2 }), // провал и просрочена
  ]

  it('берёт провалы и высокую сложность независимо от срока, без новых', () => {
    expect(ids(input({ list, scope: 'hard' }))).toEqual(['n1', 'v2', 'v1'])
  })

  it('счётчики: к повторению и новых — в разделе, трудных — во всём языке', () => {
    // К повторению среди глаголов: v2 (срок сегодня вечером) и v3.
    expect(scopeStats(input({ list, scope: 'verb' }))).toEqual({ due: 2, fresh: 9, hard: 3 })
  })
})
