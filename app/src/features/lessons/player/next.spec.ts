import { describe, expect, it } from 'vitest'

import type { Lesson, WordsLesson } from '../domain/types'
import { nextLesson } from './next'

const words = (id: string, topic: string, order: number, requires?: string[]): WordsLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang: id.slice(0, 2),
  kind: 'words',
  topic,
  order,
  title: { ru: id },
  words: [],
  phrase: {},
  ...(requires && { requires }),
})

const lessons: Lesson[] = [
  words('es-it-01', 'it', 1),
  words('es-travel-02', 'travel', 2, ['es-travel-01']),
  words('es-travel-01', 'travel', 1),
  words('en-travel-01', 'travel', 1),
  { ...words('es-sound-01', 'x', 1), kind: 'sound', rules: [] } as unknown as Lesson,
]

describe('следующий урок (D-6)', () => {
  it('сначала travel по порядку, затем it', () => {
    expect(nextLesson(lessons, 'es', new Set()).next?.id).toBe('es-travel-01')
    expect(nextLesson(lessons, 'es', new Set(['es-travel-01'])).next?.id).toBe('es-travel-02')
    expect(nextLesson(lessons, 'es', new Set(['es-travel-01', 'es-travel-02'])).next?.id).toBe(
      'es-it-01',
    )
  })

  it('урок с невыполненными requires пропускается', () => {
    const only = [words('es-travel-02', 'travel', 2, ['es-travel-01']), words('es-it-01', 'it', 1)]
    expect(nextLesson(only, 'es', new Set()).next?.id).toBe('es-it-01')
  })

  it('все пройдены — next null, total — число уроков слов языка', () => {
    const done = new Set(['es-travel-01', 'es-travel-02', 'es-it-01'])
    expect(nextLesson(lessons, 'es', done)).toEqual({ next: null, total: 3 })
  })

  it('урок, все слова которого известны, пропускается (LNG-S1-021, D-4)', () => {
    const withWords = [
      { ...words('es-travel-01', 'travel', 1), words: ['tener', 'aquí'] },
      { ...words('es-travel-02', 'travel', 2), words: ['hotel', 'libre'] },
    ]
    const known = new Set(['word:es:tener', 'word:es:aquí', 'word:es:hotel'])
    expect(nextLesson(withWords, 'es', new Set(), known).next?.id).toBe('es-travel-02')
    expect(
      nextLesson(withWords, 'es', new Set(), new Set([...known, 'word:es:libre'])).next,
    ).toBeNull()
  })

  it('уроков языка нет — total 0', () => {
    expect(nextLesson(lessons, 'fr', new Set())).toEqual({ next: null, total: 0 })
  })
})
