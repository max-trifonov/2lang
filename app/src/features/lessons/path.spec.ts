import { describe, expect, it } from 'vitest'

import type { GrammarLesson, Lesson, WordsLesson } from './domain/types'
import { courseRoute, lessonPath } from './path'

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
    expect(lessonPath(lessons, 'fr', new Set())).toEqual({ items: [], grammar: [], next: null })
  })
})

const g = (id: string, order: number, words?: string[]): GrammarLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang: 'es',
  kind: 'grammar',
  order,
  title: { ru: id },
  pattern: [],
  rule: { text: { ru: id } },
  ...(words && { words }),
})

describe('грамматика в пути (D-14, D-38)', () => {
  const course: Lesson[] = [
    w('t-1', 'travel', 1, ['a']),
    w('t-2', 'travel', 2, ['b']),
    w('t-3', 'travel', 3, ['c']),
    w('t-4', 'travel', 4, ['d']),
    w('t-5', 'travel', 5, ['e']),
    g('g-2', 2, ['c']),
    g('g-1', 1),
  ]
  const next = (done: string[], known: string[] = []) =>
    lessonPath(course, 'es', new Set(done), new Set(known)).next?.id

  it('после каждых двух уроков слов — следующая тема грамматики по порядку', () => {
    expect(next([])).toBe('t-1')
    expect(next(['t-1'])).toBe('t-2')
    expect(next(['t-1', 't-2'])).toBe('g-1')
    expect(next(['t-1', 't-2', 'g-1'])).toBe('t-3')
  })

  it('тема ждёт, пока не выучены её слова: слова пройденных уроков или известные', () => {
    // g-2 требует слово c (урок t-3): после t-1, t-2, g-1, t-4, t-5 — c не выучено.
    const before = ['t-1', 't-2', 'g-1', 't-4', 't-5']
    expect(next(before)).toBe('t-3')
    expect(next([...before, 't-3'])).toBe('g-2')
    expect(next(before, ['word:es:c'])).toBe('g-2')
  })

  it('уроки слов кончились — грамматика без ожидания ритма', () => {
    expect(next(['t-1', 't-2', 't-3', 't-4', 't-5', 'g-1'])).toBe('g-2')
  })

  it('статусы тем: пройдена / следующая / открыта', () => {
    const { grammar } = lessonPath(course, 'es', new Set(['t-1', 't-2']))
    expect(grammar.map((i) => `${i.lesson.id}:${i.status}`)).toEqual(['g-1:next', 'g-2:open'])
  })
})

describe('единый маршрут: темы между уроками слов (D-40)', () => {
  const course: Lesson[] = [
    w('t-1', 'travel', 1, ['a']),
    w('t-2', 'travel', 2, ['b']),
    w('t-3', 'travel', 3, ['c']),
    w('t-4', 'travel', 4, ['d']),
    w('it-1', 'it', 1, ['e']),
    g('g-1', 1),
    g('g-2', 2),
    g('g-3', 3, ['zzz']),
  ]
  const route = (done: string[]) =>
    courseRoute(course, 'es', new Set(done)).map((n) => `${n.item.lesson.id}:${n.item.status}`)

  it('с нуля: тема — после каждых двух уроков слов; недостижимая — в конце', () => {
    expect(route([])).toEqual([
      't-1:next',
      't-2:open',
      'g-1:open',
      't-3:open',
      't-4:open',
      'g-2:open',
      'it-1:open',
      'g-3:open',
    ])
  })

  it('следующая тема стоит перед следующим уроком слов, пройденная — после двух пройденных', () => {
    expect(route(['t-1', 't-2'])).toEqual([
      't-1:done',
      't-2:done',
      'g-1:next',
      't-3:open',
      't-4:open',
      'g-2:open',
      'it-1:open',
      'g-3:open',
    ])
    expect(route(['t-1', 't-2', 'g-1']).slice(0, 4)).toEqual([
      't-1:done',
      't-2:done',
      'g-1:done',
      't-3:next',
    ])
  })

  it('каждая тема в маршруте ровно один раз', () => {
    for (const done of [[], ['g-1'], ['t-1', 'g-2'], ['t-1', 't-2', 't-3', 't-4', 'it-1']]) {
      const ids = route(done).map((x) => x.split(':')[0])
      expect(new Set(ids).size).toBe(course.length)
    }
  })
})
