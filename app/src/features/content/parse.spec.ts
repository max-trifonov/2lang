import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { locateSyntaxError, parseJson } from './parse'

describe('parseJson', () => {
  it('разбирает корректный JSON и терпит BOM в начале файла', () => {
    expect(parseJson('﻿{"a": [1, "x"]}')).toEqual({ ok: true, value: { a: [1, 'x'] } })
  })

  it.each([
    ['пропущено двоеточие', '{\n  "id": "x",\n  "kind" "song"\n}', 3, 10],
    ['лишняя запятая', '{\n  "a": 1,\n}', 3, 1],
    ['одинарные кавычки', "{\n  'a': 1\n}", 2, 3],
    ['незакрытая строка', '{"a": "abc', 1, 11],
    ['пустой файл', '', 1, 1],
    ['мусор после значения', '{"a": 1} x', 1, 10],
    ['перевод строки внутри строки', '{"a": "ab\ncd"}', 1, 10],
    ['неизвестный литерал', '{"a": tru}', 1, 10],
  ])('%s → строка и столбец', (_name, source, line, column) => {
    const result = parseJson(source)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issue.params).toMatchObject({ line, column })
  })
})

describe('locateSyntaxError', () => {
  it('сканер согласен с JSON.parse: на корректном JSON не находит ошибки внутри', () => {
    fc.assert(
      fc.property(fc.json(), (source) => {
        // Корректный текст сканер проходит до конца без исключения → возвращает 0.
        expect(locateSyntaxError(source)).toBe(0)
      }),
    )
  })
})
