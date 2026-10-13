import { describe, expect, it } from 'vitest'

import type { Lesson, WordsLesson } from './domain/types'
import { lessonPath } from './path'

const w = (id: string, topic: string, order: number, words: string[] = []): WordsLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang: 'es',
  kind: 'words',
  topic,
  order,
  title: { ru: id },
  words,
  phrase: {},
})

const lessons: Lesson[] = [
  w('it-1', 'it', 1),
  w('t-2', 'travel', 2, ['b']),
  w('t-1', 'travel', 1, ['a']),
  w('t-3', 'travel', 3),
]
const statuses = (done: string[], known: string[] = []) =>
  lessonPath(lessons, 'es', new Set(done), new Set(known)).items.map(
    (i) => `${i.lesson.id}:${i.status}`,
  )

describe('путь уроков (AC-2, AC-5)', () => {
  it('порядок: темы по TOPICS, внутри — order; первый непройденный — «следующий»', () => {
    expect(statuses([])).toEqual(['t-1:next', 't-2:open', 't-3:open', 'it-1:open'])
  })

  it('пройден > знакомые > следующий > открыт; следующий ровно один', () => {
    const s = statuses(['t-1'], ['word:es:a', 'word:es:b'])
    expect(s).toEqual(['t-1:done', 't-2:known', 't-3:next', 'it-1:open'])
    expect(s.filter((x) => x.endsWith(':next'))).toHaveLength(1)
  })

  it('пройденный урок со всеми известными словами остаётся «пройден»', () => {
    expect(statuses(['t-1'], ['word:es:a'])[0]).toBe('t-1:done')
  })

  it('всё пройдено — следующего нет; языка нет — путь пуст', () => {
    expect(lessonPath(lessons, 'es', new Set(['t-1', 't-2', 't-3', 'it-1'])).next).toBeNull()
    expect(lessonPath(lessons, 'fr', new Set())).toEqual({ items: [], next: null })
  })
})
