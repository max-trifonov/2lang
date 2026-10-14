import { describe, expect, it } from 'vitest'

import type { GrammarLesson } from '../domain/types'
import { seeded } from './blocks'
import { buildGrammarPractice } from './grammar'

// Литерал с extra / options не сужается до LangText — как и JSON урока, приводится к типу.
const lesson = {
  format: '2lang/lesson',
  version: 1,
  id: 'es-grammar-20',
  lang: 'es',
  kind: 'grammar',
  order: 20,
  title: { ru: 'tener que' },
  pattern: [],
  rule: { text: { ru: 'tener que + инфинитив' } },
  exercises: [
    {
      type: 'transform',
      es: 'Tengo que trabajar hoy.',
      into: [
        { form: 'negative', answer: 'No tengo que trabajar hoy.' },
        { form: 'question', answer: ['¿Tengo que trabajar hoy?', '¿Hoy tengo que trabajar?'] },
      ],
    },
    {
      type: 'choose',
      es: 'Nosotros ___ que salir.',
      options: ['tengo', 'tenemos', 'tienen'],
      answer: 'tenemos',
      ru: 'Нам нужно выйти.',
      en: 'We have to leave.',
    },
    { type: 'fill', es: '¿___ que pagar?', answer: ['Tengo', 'Tienes'] },
    {
      type: 'build',
      es: 'Tenemos que hacer un deploy.',
      ru: 'Нам нужно сделать деплой.',
      extra: ['tiene'],
    },
    {
      type: 'compose',
      prompt: { ru: 'Что вам нужно сделать завтра?', en: 'What do you have to do tomorrow?' },
      template: 'Mañana tengo que …',
      sample: 'Mañana tengo que ir al aeropuerto.',
    },
  ],
} as unknown as GrammarLesson

describe('практика урока грамматики (D-38)', () => {
  const tasks = buildGrammarPractice(lesson, { locale: 'ru', rng: seeded(1) })

  it('трансформер — задание на каждую форму, порядок упражнений сохраняется', () => {
    expect(tasks.map((t) => (t.kind === 'transform' ? `transform:${t.form}` : t.kind))).toEqual([
      'transform:negative',
      'transform:question',
      'choose',
      'fill',
      'build',
      'compose',
    ])
  })

  it('трансформер: блоки — слова первого варианта вперемешку, засчитываются все варианты', () => {
    const t = tasks[1]!
    if (t.kind !== 'transform') throw new Error(t.kind)
    expect([...t.blocks].sort()).toEqual(['¿Tengo', 'hoy?', 'que', 'trabajar'].sort())
    expect(t.blocks).not.toEqual(['¿Tengo', 'que', 'trabajar', 'hoy?'])
    expect(t.accepted).toEqual(['¿Tengo que trabajar hoy?', '¿Hoy tengo que trabajar?'])
  })

  it('выбор: все варианты на месте, перевод — на языке интерфейса', () => {
    const t = tasks[2]!
    if (t.kind !== 'choose') throw new Error(t.kind)
    expect([...t.options].sort()).toEqual(['tenemos', 'tengo', 'tienen'])
    expect(t.translation).toBe('Нам нужно выйти.')
    const en = buildGrammarPractice(lesson, { locale: 'en', rng: seeded(1) })[2]!
    expect(en.kind === 'choose' && en.translation).toBe('We have to leave.')
  })

  it('собрать фразу — с лишним блоком; своё предложение — задание и образцы', () => {
    const build = tasks[4]!
    expect(build.kind === 'build' && build.blocks).toContain('tiene')
    const compose = tasks[5]!
    expect(compose).toEqual({
      kind: 'compose',
      prompt: 'Что вам нужно сделать завтра?',
      template: 'Mañana tengo que …',
      samples: ['Mañana tengo que ir al aeropuerto.'],
    })
  })
})
