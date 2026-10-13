import { describe, expect, it } from 'vitest'

import type { Letter, SoundLesson } from '../domain/types'
import { seeded } from './blocks'
import { alphabetOf, buildSoundPractice, soundLessons, spellNames } from './sound'

const letters: Letter[] = [
  { letter: 'a', name: 'a' },
  { letter: 'e', name: 'e' },
  { letter: 'p', name: 'pe' },
  { letter: 'n', name: 'ene' },
  { letter: 'ñ', name: 'eñe' },
  { letter: 'g', name: 'ge' },
  { letter: 'i', name: 'i' },
  { letter: 'c', name: 'ce' },
  { letter: 'r', name: 'erre' },
  { letter: 'm', name: 'eme' },
  { letter: 'l', name: 'ele' },
]
const lesson = (over: Partial<SoundLesson>): SoundLesson =>
  ({ id: 's', lang: 'es', kind: 'sound', order: 1, ...over }) as SoundLesson

describe('spellNames', () => {
  it('ñ — своя буква, í — базовая i, регистр не важен', () => {
    expect(spellNames('Ñañ', letters, 'es')).toEqual(['eñe', 'a', 'eñe'])
    expect(spellNames('García', letters, 'es')).toEqual(['ge', 'a', 'erre', 'ce', 'i', 'a'])
  })
  it('знаки email называются, пробел пропущен, неизвестное остаётся', () => {
    expect(spellNames('a@m.c', letters, 'es')).toEqual(['a', 'arroba', 'eme', 'punto', 'ce'])
    expect(spellNames('a_b-1 c', letters, 'en')).toEqual([
      'a',
      'underscore',
      'b',
      'dash',
      '1',
      'ce',
    ])
  })
})

describe('buildSoundPractice', () => {
  const ex = lesson({
    exercises: [
      {
        type: 'pairs',
        items: [
          ['pero', 'perro'],
          ['mono', 'moño'],
        ],
      },
      { type: 'read', items: ['cena'] },
      { type: 'dictation', items: ['año'] },
      { type: 'spell', items: ['Peña'] },
    ],
  })
  it('по заданию на элемент, в порядке упражнений', () => {
    const tasks = buildSoundPractice(ex, letters, seeded(1))
    expect(tasks.map((t) => t.kind)).toEqual(['pairs', 'pairs', 'read', 'dictation', 'spell'])
  })
  it('pairs: слышимое слово — из пары, среди вариантов оба слова, ответ — слышимое', () => {
    for (const seed of [1, 2, 3, 4]) {
      const [p] = buildSoundPractice(ex, letters, seeded(seed))
      if (p?.kind !== 'pairs') throw new Error('pairs')
      expect([...p.options].sort()).toEqual(['pero', 'perro'])
      expect(p.options).toContain(p.heard)
      expect(p.answer).toBe(p.heard)
    }
  })
  it('spell берёт алфавит языка, если в уроке своих букв нет; свои буквы приоритетнее', () => {
    const own = lesson({
      letters: [{ letter: 'p', name: 'PE' }],
      exercises: [{ type: 'spell', items: ['p'] }],
    })
    const [s] = buildSoundPractice(ex, letters, seeded(1)).slice(-1)
    expect(s).toMatchObject({ kind: 'spell', names: ['pe', 'e', 'eñe', 'a'] })
    expect(buildSoundPractice(own, letters, seeded(1))[0]).toMatchObject({ names: ['PE'] })
  })
  it('без упражнений заданий нет', () => {
    expect(buildSoundPractice(lesson({}), [], seeded(1))).toEqual([])
  })
})

describe('soundLessons / alphabetOf', () => {
  const all = [
    lesson({ id: 'b', order: 3 }),
    lesson({ id: 'a', order: 1, letters }),
    { id: 'w', kind: 'words', lang: 'es', order: 1 },
    lesson({ id: 'en', lang: 'en', order: 1 }),
  ] as never[]
  it('по языку и порядку, только звучание', () => {
    expect(soundLessons(all, 'es').map((l: { id: string }) => l.id)).toEqual(['a', 'b'])
  })
  it('алфавит — из первого урока с буквами', () => {
    expect(alphabetOf(all, 'es')).toBe(letters)
    expect(alphabetOf(all, 'en')).toEqual([])
  })
})
