import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { i18n, messages } from './index'
import { pluralIndex } from './plural'

function keys(node: unknown, prefix = ''): string[] {
  if (typeof node !== 'object' || node === null) return [prefix]
  return Object.entries(node).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

describe('словари', () => {
  const [base, ...rest] = Object.entries(messages)

  it.each(rest)('%s содержит те же ключи, что и основной словарь', (_locale, dict) => {
    expect(keys(dict).sort()).toEqual(keys(base![1]).sort())
  })

  it.each(Object.entries(messages))('%s: нет пустых строк', (_locale, dict) => {
    const empty = keys(dict).filter((k) => {
      const value = k
        .split('.')
        .reduce<unknown>((n, part) => (n as Record<string, unknown>)[part], dict)
      return typeof value !== 'string' || value.trim() === ''
    })
    expect(empty).toEqual([])
  })
})

describe('множественное число', () => {
  it.each([
    [1, 0],
    [2, 1],
    [4, 1],
    [5, 2],
    [11, 2],
    [12, 2],
    [21, 0],
    [22, 1],
    [111, 2],
    [1.5, 1],
  ])('ru: %s → форма %s', (n, form) => {
    expect(pluralIndex('ru', n, 3)).toBe(form)
  })

  it.each([
    ['en', 1, 0],
    ['en', 2, 1],
    ['es', 1, 0],
    ['es', 5, 1],
    ['es', 1_000_000, 1],
  ])('%s: %s → форма %s', (locale, n, form) => {
    expect(pluralIndex(locale, n, 2)).toBe(form)
  })

  it('сообщения подставляют форму по числу', () => {
    const t = i18n.global.t as (key: string, named: object, plural: number) => string
    i18n.global.locale.value = 'ru'
    expect([1, 3, 5].map((n) => t('profiles.goalValue', { n }, n))).toEqual([
      'Цель дня: 1 урок',
      'Цель дня: 3 урока',
      'Цель дня: 5 уроков',
    ])
    i18n.global.locale.value = 'es'
    expect(t('profiles.goalValue', { n: 2 }, 2)).toBe('Meta diaria: 2 lecciones')
  })
})

describe('lang документа', () => {
  it('следует за языком интерфейса', async () => {
    i18n.global.locale.value = 'en'
    await nextTick()
    expect(document.documentElement.lang).toBe('en')
    i18n.global.locale.value = 'ru'
    await nextTick()
    expect(document.documentElement.lang).toBe('ru')
  })
})
