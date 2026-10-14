import { describe, expect, it } from 'vitest'

import type { GrammarLesson, Lesson, WordsLesson } from './domain/types'
import { backlinks, grammarForWord, grammarRefs, grammarSections, lessonRoute } from './refs'

const g = (id: string, order: number, patch: Partial<GrammarLesson> = {}): GrammarLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang: id.slice(0, 2),
  kind: 'grammar',
  order,
  title: { ru: id },
  pattern: [],
  rule: { text: { ru: id } },
  ...patch,
})
const w = (id: string, see?: string[]): WordsLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang: 'es',
  kind: 'words',
  topic: 'travel',
  order: 1,
  title: { ru: id },
  words: [],
  phrase: {},
  ...(see && { see }),
})

const lessons: Lesson[] = [
  g('es-grammar-20', 20, { section: 'modals', words: ['tener'] }),
  g('es-grammar-10', 10, { section: 'sentence' }),
  g('es-grammar-05', 5, { section: 'verbs', words: ['estar'] }),
  g('es-grammar-99', 99),
  g('en-grammar-23', 23, { section: 'modals' }),
  w('es-travel-01', ['es-grammar-20', 'es-travel-02', 'es-grammar-77']),
  w('es-travel-02', ['es-grammar-20']),
]

describe('отсылки к правилам (D-38)', () => {
  it('маршрут урока — по виду', () => {
    expect(lessonRoute({ id: 'a', kind: 'words' })).toBe('/lessons/a')
    expect(lessonRoute({ id: 'b', kind: 'sound' })).toBe('/sounds/b')
    expect(lessonRoute({ id: 'c', kind: 'grammar' })).toBe('/grammar/c')
  })

  it('отсылки — только существующие темы грамматики, в порядке записи', () => {
    const see = (lessons[5] as WordsLesson).see
    expect(grammarRefs(see, lessons).map((l) => l.id)).toEqual(['es-grammar-20'])
    expect(grammarRefs(undefined, lessons)).toEqual([])
  })

  it('обратные ссылки — уроки, где правило встречается', () => {
    expect(backlinks('es-grammar-20', lessons).map((l) => l.id)).toEqual([
      'es-travel-01',
      'es-travel-02',
    ])
  })

  it('темы слова — где оно условие открытия, своего языка', () => {
    expect(grammarForWord(lessons, 'es', 'tener').map((l) => l.id)).toEqual(['es-grammar-20'])
    expect(grammarForWord(lessons, 'en', 'tener')).toEqual([])
  })

  it('справочник: разделы в порядке GRAMMAR_SECTIONS, без раздела — в конце', () => {
    expect(
      grammarSections(lessons, 'es').map((s) => `${s.section}:${s.lessons.map((l) => l.order)}`),
    ).toEqual(['sentence:10', 'verbs:5', 'modals:20', 'other:99'])
  })
})
