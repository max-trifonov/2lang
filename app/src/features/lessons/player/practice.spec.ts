import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/features/dictionary'

import type { Exercise, WordsLesson } from '../domain/types'
import { seeded } from './blocks'
import {
  buildPractice,
  introSteps,
  lessonWords,
  pickTask,
  shortTranslation,
  type Task,
} from './practice'

const entry = (
  id: string,
  pos: CatalogEntry['pos'],
  rank: number,
  ru: string,
  extra: Partial<CatalogEntry> = {},
): CatalogEntry => ({ id, lemma: id, pos, rank, lang: 'es', translations: { ru }, ...extra })

const dict = [
  entry('tener', 'verb', 3, 'иметь; tener que — быть должным'),
  entry('reserva', 'noun', 834, 'бронь, бронирование', { gender: 'f' }),
  entry('aquí', 'adv', 3, 'здесь, сюда'),
  entry('ser', 'verb', 1, 'быть'),
  entry('estar', 'verb', 2, 'быть'),
  entry('hacer', 'verb', 4, 'делать'),
  entry('ir', 'verb', 5, 'идти'),
  entry('casa', 'noun', 830, 'дом', { gender: 'f' }),
]

const lesson: WordsLesson = {
  format: '2lang/lesson',
  version: 1,
  id: 'es-travel-01',
  lang: 'es',
  kind: 'words',
  topic: 'travel',
  order: 1,
  title: { ru: 'В отеле' },
  words: ['tener', 'reserva', 'aquí', 'nope'],
  phrase: { es: 'Tengo una reserva.', ru: 'У меня бронь.' },
  // LangText с индексом-строкой не пускает массивы в литерале — как в JSON-уроке, через unknown.
  exercises: [
    { type: 'fill', es: '___ una reserva.', answer: 'Tengo', ru: 'У меня бронь.' },
    { type: 'build', es: 'Tengo una reserva aquí.', ru: 'У меня здесь бронь.', extra: ['está'] },
    { type: 'translate', ru: 'У меня нет брони.', answer: ['No tengo reserva.'] },
  ] as unknown as Exercise[],
}

const words = lessonWords(lesson, dict)
const plan = (canHear = true, seed = 1) =>
  buildPractice(lesson, words, dict, { locale: 'ru', canHear, rng: seeded(seed) })

describe('план урока слов', () => {
  it('слова в порядке урока, отсутствующее в словаре пропущено', () => {
    expect(words.map((w) => w.id)).toEqual(['tener', 'reserva', 'aquí'])
  })

  it('знакомство: слова → фраза; правила нет — шага нет', () => {
    expect(introSteps(lesson, words).map((s) => s.kind)).toEqual(['word', 'word', 'word', 'phrase'])
    expect(introSteps({ ...lesson, rule: { text: { ru: 'x' } } }, words).at(-1)?.kind).toBe('rule')
  })

  it('лестница по стадиям: узнать → услышать → вспомнить → применить (AC-3)', () => {
    expect(plan().map((t) => t.kind)).toEqual([
      ...Array(3).fill('recognize'),
      ...Array(3).fill('hear'),
      ...Array(3).fill('recall'),
      'fill',
      'build',
      'translate',
    ])
  })

  it('без голоса нет «услышать»', () => {
    expect(plan(false).some((t) => t.kind === 'hear')).toBe(false)
  })

  it('варианты: правильный внутри, без повторов текста, не больше четырёх', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const t of plan(true, seed)) {
        if (t.kind !== 'recognize' && t.kind !== 'hear') continue
        expect(t.options).toContain(t.answer)
        expect(new Set(t.options).size).toBe(t.options.length)
        expect(t.options.length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('варианты той же части речи: слова урока, затем словарь (TD-5, AC-1)', () => {
    const tasks = buildPractice(
      { ...lesson, words: ['tener', 'hacer', 'casa'] },
      lessonWords({ ...lesson, words: ['tener', 'hacer', 'casa'] }, dict),
      dict,
      {
        locale: 'ru',
        canHear: true,
        rng: seeded(5),
      },
    )
    const pos = (text: string) =>
      dict.find((e) => shortTranslation(e, 'ru') === text || e.lemma === text)?.pos
    for (const t of tasks) {
      if ((t.kind !== 'recognize' && t.kind !== 'hear') || t.word.pos !== 'verb') continue
      expect(t.options.map(pos)).toEqual(['verb', 'verb', 'verb', 'verb'])
      expect(t.options).toContain(
        t.kind === 'recognize' ? (t.word.id === 'tener' ? 'иметь' : 'делать') : t.word.lemma,
      )
    }
  })

  it('слов той же части речи мало — добор из прочих слов урока (AC-2)', () => {
    const recognize = plan().find((t) => t.kind === 'recognize' && t.word.id === 'aquí')
    expect(recognize?.kind === 'recognize' && recognize.options).toHaveLength(3)
    expect(recognize?.kind === 'recognize' && recognize.options).toContain('здесь, сюда')
  })

  it('перевод «быть» у ser и estar — одинаковый отвлекающий не дублируется', () => {
    const tasks = buildPractice({ ...lesson, words: ['ser'] }, [dict[3]!], dict, {
      locale: 'ru',
      canHear: false,
      rng: seeded(3),
    })
    const recognize = tasks.find((t) => t.kind === 'recognize') as Extract<
      Task,
      { kind: 'recognize' }
    >
    expect(recognize.options.filter((o) => o === 'быть')).toHaveLength(1)
  })

  it('перевод в задании — до первой «;»', () => {
    expect(shortTranslation(dict[0]!, 'ru')).toBe('иметь')
    expect(shortTranslation(dict[0]!, 'es')).toBe('иметь')
  })

  it('«вспомнить» принимает слово с артиклем', () => {
    const recall = plan().find((t) => t.kind === 'recall' && t.word.id === 'reserva')
    expect(recall).toMatchObject({
      prompt: 'бронь, бронирование',
      accepted: ['reserva', 'la reserva'],
    })
  })

  it('«выбрать слово»: перевод в вопросе, слова той же части речи в вариантах (LNG-S1-030)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const t = pickTask(dict[5]!, [], dict, { locale: 'ru', rng: seeded(seed) })
      if (t.kind !== 'pick') throw new Error('ожидалось pick')
      expect(t.prompt).toBe('делать')
      expect(t.answer).toBe('hacer')
      expect(t.options).toContain('hacer')
      expect(t.options).toHaveLength(4)
      expect(new Set(t.options).size).toBe(4)
      for (const o of t.options) expect(dict.find((e) => e.lemma === o)?.pos).toBe('verb')
    }
  })

  it('«выбрать слово»: у существительного ES — артикль; синоним перевода не в вариантах', () => {
    const noun = pickTask(dict[7]!, [], dict, { locale: 'ru', rng: seeded(2) })
    expect(noun).toMatchObject({ kind: 'pick', answer: 'la casa' })
    expect(noun.kind === 'pick' && noun.options).toContain('la reserva')
    const ser = pickTask(dict[3]!, [], dict, { locale: 'ru', rng: seeded(2) })
    expect(ser.kind === 'pick' && ser.options).not.toContain('estar')
  })

  it('упражнения файла: fill с переводом, build — блоки фразы + ловушки, translate', () => {
    const [fill, build, translate] = plan().slice(-3)
    expect(fill).toEqual({
      kind: 'fill',
      sentence: '___ una reserva.',
      translation: 'У меня бронь.',
      accepted: ['Tengo'],
    })
    expect(build?.kind === 'build' && [...build.blocks].sort()).toEqual([
      'Tengo',
      'aquí.',
      'está',
      'reserva',
      'una',
    ])
    expect(translate).toEqual({
      kind: 'translate',
      prompt: 'У меня нет брони.',
      accepted: ['No tengo reserva.'],
    })
  })
})
