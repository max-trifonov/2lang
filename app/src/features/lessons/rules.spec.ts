import { describe, expect, it } from 'vitest'

import { rulesFor, rulesIndex } from './rules'
import type { Lesson } from './domain/types'

const rule = (id: string) => ({ id, title: { ru: id }, text: { ru: id }, examples: [{ es: 'x' }] })
const sound = (lang: string, ids: string[], code = 'ES-P3'): Lesson =>
  ({
    format: '2lang/lesson',
    version: 1,
    id: `${lang}-s`,
    lang,
    kind: 'sound',
    code,
    order: 1,
    title: { ru: 't' },
    rules: ids.map(rule),
  }) as Lesson

describe('подсказки правил чтения', () => {
  const lessons = [sound('es', ['es-h-silent', 'es-qu']), sound('en', ['es-h-silent'], 'EN-P1')]

  it('правила статьи по id, только уроки звучания её языка, с темой программы', () => {
    const hints = rulesFor(['es-qu', 'es-h-silent'], rulesIndex(lessons, 'es'))
    expect(hints.map((h) => [h.id, h.lang, h.code])).toEqual([
      ['es-qu', 'es', 'ES-P3'],
      ['es-h-silent', 'es', 'ES-P3'],
    ])
  })

  it('неизвестное правило и пустой список — без ошибки', () => {
    expect(rulesFor(['es-nope'], rulesIndex(lessons, 'es'))).toEqual([])
    expect(rulesFor(undefined, rulesIndex(lessons, 'es'))).toEqual([])
  })
})
