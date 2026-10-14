import { describe, expect, it } from 'vitest'

import { seeded } from '@/features/lessons'

import {
  buildSongPractice,
  gapLine,
  nextSong,
  songLessonId,
  songPhrases,
  songStanzas,
  songsForRule,
  songsOf,
} from './lesson'
import type { TextDoc } from './types'

const song = (id: string, over: Partial<TextDoc> = {}): TextDoc => ({
  format: '2lang/text',
  version: 1,
  id,
  kind: 'song',
  lang: 'en',
  license: 'personal',
  title: { en: id },
  stanzas: [
    {
      id: 'chorus',
      type: 'chorus',
      lines: [
        {
          en: 'I want to be forgiven',
          ru: 'Я хочу, чтобы меня простили',
          phrases: [{ en: 'to be forgiven', ru: 'быть прощённым' }],
        },
        {
          en: 'Hold you in my arms again',
          ru: 'Снова обнять тебя',
          phrases: [
            { en: 'in my arms', ru: 'в объятиях' },
            { en: 'again', ru: 'снова' },
          ],
        },
      ],
    },
    { ref: 'chorus' },
    {
      lines: [
        {
          en: 'Can you ease the pain',
          ru: 'Облегчишь ли ты боль',
          phrases: [
            { en: 'ease the pain', ru: 'облегчить боль' },
            { en: 'In my arms', ru: 'дубль другой строки' },
          ],
        },
      ],
    },
  ],
  ...over,
})

describe('урок по песне (D-42)', () => {
  it('разбор — строфы без повторов по ref', () => {
    expect(songStanzas(song('a')).map((s) => s.lines.length)).toEqual([2, 1])
  })

  it('фразы — по порядку, без повторов без учёта регистра, со строкой и её переводом', () => {
    const ps = songPhrases(song('a'), 'ru')
    expect(ps.map((p) => p.text)).toEqual([
      'to be forgiven',
      'in my arms',
      'again',
      'ease the pain',
    ])
    expect(ps[1]).toMatchObject({
      line: 'Hold you in my arms again',
      lineTranslation: 'Снова обнять тебя',
      translation: 'в объятиях',
    })
  })

  it('пропуск — на месте фразы без учёта регистра; фразы нет в строке — null', () => {
    expect(gapLine('Hold you In My Arms again', 'in my arms')).toBe('Hold you ___ again')
    expect(gapLine('Hold (you) [here]', '(you)')).toBe('Hold ___ [here]')
    expect(gapLine('Hold you', 'arms')).toBeNull()
  })

  it('практика: «вставь» на каждую фразу, «собери» — только для фраз из нескольких слов', () => {
    const tasks = buildSongPractice(song('a'), { locale: 'ru', rng: seeded(1) })
    expect(tasks.filter((t) => t.kind === 'choose')).toHaveLength(4)
    expect(
      tasks.filter((t) => t.kind === 'build').map((t) => t.kind === 'build' && t.sentence),
    ).toEqual(['to be forgiven', 'in my arms', 'ease the pain'])
    const first = tasks[0]
    expect(first?.kind).toBe('choose')
    if (first?.kind === 'choose') {
      expect(first.sentence).toBe('I want ___')
      expect(first.options).toContain('to be forgiven')
      expect(first.options).toHaveLength(3)
    }
  })

  it('практика берёт не больше max фраз', () => {
    const tasks = buildSongPractice(song('a'), { locale: 'ru', rng: seeded(2), max: 1 })
    expect(tasks.map((t) => t.kind)).toEqual(['choose', 'build'])
  })

  it('песни правила — по полю see', () => {
    const docs = [song('a', { see: ['en-grammar-07'] }), song('b')]
    expect(songsForRule(docs, 'en-grammar-07').map((d) => d.id)).toEqual(['a'])
  })

  it('песни языка: только песни, проще — раньше, затем по названию', () => {
    const docs = [
      song('c', { level: 'B2' }),
      song('b', { level: 'A2' }),
      song('a'),
      song('p', { kind: 'poem', level: 'A1' }),
      song('es', { lang: 'es', title: { es: 'es' } }),
    ]
    expect(songsOf(docs, 'en').map((d) => d.id)).toEqual(['b', 'c', 'a'])
  })

  it('следующая песня — непройденная, где пройденных правил больше, чем непройденных', () => {
    const docs = [
      song('hard', { level: 'A1', see: ['g-1', 'g-2', 'g-3'] }),
      song('fit', { level: 'B2', see: ['g-1', 'g-2'] }),
      song('none', { level: 'A2' }),
    ]
    // Новичку — простая песня без правил, а не песня с непройденной грамматикой.
    expect(nextSong(docs, 'en', new Set())?.id).toBe('none')
    const done = new Set(['g-1', 'g-2'])
    expect(nextSong(docs, 'en', done)?.id).toBe('fit')
    expect(nextSong(docs, 'en', new Set([...done, songLessonId('fit')]))?.id).toBe('hard')
    const all = new Set(docs.map((d) => songLessonId(d.id)))
    expect(nextSong(docs, 'en', all)).toBeNull()
  })
})
