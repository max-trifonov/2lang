import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/features/dictionary'
import { seeded } from '@/features/lessons'
import type { Card } from '@/features/review'

import type { PlannedWord } from './plan'
import { answerRound, buildRound, startRound, trainKind, type RoundStep } from './round'

const entry = (id: string, rank: number): CatalogEntry => ({
  id,
  lemma: id,
  pos: 'verb',
  rank,
  lang: 'es',
  translations: { ru: `${id}-ru` },
})
const entries = Array.from({ length: 10 }, (_, i) => entry(`v${i + 1}`, i + 1))
const card = (id: string, stability: number): Card => ({
  profileId: 'p',
  key: `word:es:${id}`,
  lang: 'es',
  state: 'review',
  due: '2026-10-01T00:00:00.000Z',
  stability,
  difficulty: 5,
  lastReview: '2026-09-20T00:00:00.000Z',
  reps: 3,
  lapses: 0,
})
const opts = (seed = 1, canHear = true) => ({ locale: 'ru', canHear, rng: seeded(seed) })
const shape = (steps: RoundStep[]) =>
  steps.map((s) => (s.kind === 'intro' ? `intro:${s.word.id}` : `${s.task.kind}:${s.word.id}`))

describe('задание по зрелости (AC-4)', () => {
  it('новое слово и карточка без повторений — «узнай перевод»', () => {
    expect(trainKind(undefined, true, seeded(1))).toBe('recognize')
    expect(trainKind({ ...card('v1', 0), state: 'new' }, true, seeded(1))).toBe('recognize')
  })

  it('в основном «слово → перевод», «выбери слово» — заметная доля; без голоса — без «услышь»', () => {
    for (const s of [1, 8, 40]) {
      const rng = seeded(s)
      const kinds = Array.from({ length: 1000 }, () => trainKind(card('v1', s), false, rng))
      const share = (k: string) => kinds.filter((x) => x === k).length / kinds.length
      expect(share('recognize')).toBeGreaterThan(share('pick'))
      expect(share('pick')).toBeGreaterThan(0.1)
      expect(share('hear')).toBe(0)
    }
  })

  it('«напиши слово» — только у зрелых', () => {
    const rng = seeded(3)
    const young = Array.from({ length: 500 }, () => trainKind(card('v1', 10), true, rng))
    expect(young).not.toContain('recall')
    const mature = Array.from({ length: 500 }, () => trainKind(card('v1', 30), true, rng))
    expect(mature).toContain('recall')
    expect(mature).toContain('hear')
  })
})

describe('шаги раунда (AC-3)', () => {
  it('новое: карточка → «узнай», «выбери слово» — в конце; новые — между повторениями', () => {
    const words: PlannedWord[] = [
      { word: entries[0]!, card: card('v1', 1) },
      { word: entries[1]!, card: card('v2', 1) },
      { word: entries[2]! },
      { word: entries[3]! },
    ]
    const steps = shape(buildRound(words, entries, opts()))
    expect(steps.filter((s) => s.startsWith('intro'))).toEqual(['intro:v3', 'intro:v4'])
    expect(steps.indexOf('intro:v3') + 1).toBe(steps.indexOf('recognize:v3'))
    expect(steps.slice(-2)).toEqual(['pick:v3', 'pick:v4'])
    expect(steps[0]).not.toMatch(/^intro/)
    expect(steps.indexOf('intro:v4')).toBeGreaterThan(steps.indexOf('intro:v3') + 2)
  })

  it('раунд без новых всё равно содержит «выбери слово»', () => {
    for (let seed = 0; seed < 30; seed++) {
      const words = entries.slice(0, 3).map((word) => ({ word, card: card(word.id, 1) }))
      const steps = buildRound(words, entries, opts(seed))
      expect(steps.some((s) => s.kind === 'task' && s.task.kind === 'pick')).toBe(true)
    }
  })
})

describe('оценка слова за раунд (AC-5)', () => {
  const play = (answers: [boolean, boolean?][]) => {
    let round = startRound(buildRound([{ word: entries[0]! }], entries, opts()))
    const graded = []
    answerRound(round, true) // проверка: ответ на знакомство не оценивает
    round = answerRound(round, true).round
    for (const [correct, accent] of answers) {
      const next = answerRound(round, correct, accent)
      round = next.round
      if (next.graded) graded.push(next.graded)
    }
    return { graded, round }
  }

  it('новое слово: верно + верно — одна оценка «Хорошо» после последнего задания', () => {
    expect(play([[true], [true]]).graded).toEqual([{ key: 'word:es:v1', grade: 3 }])
    expect(play([[true]]).graded).toEqual([])
  })

  it('ошибка в любом задании — «Забыл»; подсказка написания — «Трудно»', () => {
    expect(play([[true], [false]]).graded).toEqual([{ key: 'word:es:v1', grade: 1 }])
    expect(play([[false], [true]]).graded).toEqual([{ key: 'word:es:v1', grade: 1 }])
    expect(play([[true, true], [true]]).graded).toEqual([{ key: 'word:es:v1', grade: 2 }])
  })

  it('ошибка возвращает задание в конец; повтор не оценивает слово заново', () => {
    const { graded, round } = play([[false], [true], [true]])
    expect(graded).toHaveLength(1)
    expect(round.practice.queue.at(-1)?.retry).toBe(true)
    expect(round.practice.pos).toBe(round.practice.queue.length)
  })
})
