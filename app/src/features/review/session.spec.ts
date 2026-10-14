import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/features/dictionary'
import { seeded, type GrammarLesson } from '@/features/lessons'

import type { Card } from './cards'
import { buildReview, gradeFor, grammarKey, grammarTask, kindFor, phraseTask } from './session'

const entry = (id: string, pos: CatalogEntry['pos'], rank: number, ru: string): CatalogEntry => ({
  id,
  lemma: id,
  pos,
  rank,
  lang: 'es',
  translations: { ru },
})
const dict = [
  entry('tener', 'verb', 3, 'иметь'),
  entry('hacer', 'verb', 4, 'делать'),
  entry('ir', 'verb', 5, 'идти'),
  entry('dar', 'verb', 6, 'давать'),
  entry('ver', 'verb', 7, 'видеть'),
]
const card = (id: string, over: Partial<Card> = {}): Card => ({
  profileId: 'p',
  key: `word:es:${id}`,
  lang: 'es',
  state: 'review',
  due: '2026-10-01T00:00:00.000Z',
  stability: 5,
  difficulty: 5,
  reps: 2,
  lapses: 0,
  ...over,
})
const opts = { locale: 'ru', canHear: true, rng: seeded(1) }

describe('сессия повторения (AC-2)', () => {
  it('задание по зрелости: новая / S<3 — узнать, S<10 — услышать, иначе вспомнить', () => {
    expect(kindFor(card('a', { state: 'new', stability: 0 }), true)).toBe('recognize')
    expect(kindFor(card('a', { stability: 2.9 }), true)).toBe('recognize')
    expect(kindFor(card('a', { stability: 3 }), true)).toBe('hear')
    expect(kindFor(card('a', { stability: 9.9 }), true)).toBe('hear')
    expect(kindFor(card('a', { stability: 10 }), true)).toBe('recall')
  })

  it('без голоса «услышать» заменяется «узнать»', () => {
    expect(kindFor(card('a', { stability: 5 }), false)).toBe('recognize')
  })

  it('оценка: ошибка — 1, подсказка написания — 2, верно — 3 (D-1)', () => {
    expect(gradeFor(false, false)).toBe(1)
    expect(gradeFor(false, true)).toBe(1)
    expect(gradeFor(true, true)).toBe(2)
    expect(gradeFor(true, false)).toBe(3)
  })

  it('порядок карточек сохраняется, размер ограничен, неизвестные слова пропускаются', () => {
    const cards = [card('tener'), card('nope'), card('hacer'), card('ir'), card('dar')]
    const items = buildReview(cards, dict, opts, 3)
    expect(items.map((i) => i.card.key)).toEqual(['word:es:tener', 'word:es:hacer', 'word:es:ir'])
    for (const i of items) {
      expect(i.task.kind).toBe('hear')
      if (i.task.kind === 'hear') {
        expect(i.task.options).toContain(i.task.answer)
        expect(new Set(i.task.options).size).toBe(i.task.options.length)
      }
    }
  })

  it('«вспомнить» принимает слово, перевод в вопросе', () => {
    const [item] = buildReview([card('tener', { stability: 20 })], dict, opts)
    expect(item?.task).toMatchObject({ kind: 'recall', prompt: 'иметь', accepted: ['tener'] })
  })
})

describe('карточки фраз текстов (LNG-S1-027)', () => {
  const phrase = { text: 'me quiero casar', translation: 'я хочу жениться' }
  const key = 'phrase:es:song:me quiero casar'

  it('молодая — собрать из слов, зрелая — перевести целиком', () => {
    const young = phraseTask(card('x', { key, stability: 2 }), phrase, seeded(1))
    expect(young.kind).toBe('build')
    if (young.kind === 'build') expect([...young.blocks].sort()).toEqual(['casar', 'me', 'quiero'])
    const mature = phraseTask(card('x', { key, stability: 12 }), phrase, seeded(1))
    expect(mature).toEqual({
      kind: 'translate',
      prompt: phrase.translation,
      accepted: [phrase.text],
    })
  })

  it('в сессии карточки фраз стоят среди слов; без записи о фразе — пропускаются', () => {
    const cards = [card('x', { key }), card('x', { key: 'phrase:es:song:gone' }), card('tener')]
    const items = buildReview(cards, dict, { ...opts, phrases: new Map([[key, phrase]]) })
    expect(items.map((i) => i.card.key)).toEqual([key, 'word:es:tener'])
  })
})

describe('темы грамматики в повторении (D-40)', () => {
  const rule = {
    format: '2lang/lesson',
    version: 1,
    id: 'es-grammar-10',
    lang: 'es',
    kind: 'grammar',
    order: 10,
    title: { ru: 'Отрицание' },
    pattern: [],
    rule: { text: { ru: 'no перед глаголом' } },
    exercises: [
      { type: 'compose', prompt: { ru: 'Скажите, чего вы не делаете' }, sample: 'No fumo.' },
      {
        type: 'choose',
        es: 'Yo ___ trabajo.',
        ru: 'Я не работаю.',
        options: ['no', 'nada'],
        answer: 'no',
      },
      { type: 'fill', es: 'Ella ___ come carne.', ru: 'Она не ест мясо.', answer: 'no' },
    ],
  } as GrammarLesson
  const key = grammarKey(rule)

  it('ключ темы — grammar:<язык>:<id>; язык карточки читается из ключа', () => {
    expect(key).toBe('grammar:es:es-grammar-10')
  })

  it('задание — одно упражнение темы, «своё предложение» не берётся', () => {
    const kinds = new Set(
      Array.from(
        { length: 20 },
        (_, i) => grammarTask(rule, { locale: 'ru', rng: seeded(i) })?.kind,
      ),
    )
    expect([...kinds].sort()).toEqual(['choose', 'fill'])
  })

  it('в сессии темы стоят среди слов с подписью правила; без урока — пропускаются', () => {
    const cards = [card('x', { key }), card('x', { key: 'grammar:es:gone' }), card('tener')]
    const items = buildReview(cards, dict, { ...opts, grammar: new Map([[key, rule]]) })
    expect(items.map((i) => i.card.key)).toEqual([key, 'word:es:tener'])
    expect(items[0]?.rule?.id).toBe('es-grammar-10')
  })
})
