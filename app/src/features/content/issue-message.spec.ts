import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'

import { messages } from '@/shared/i18n'

import { ERROR_CODES, WARNING_CODES, type Issue } from './issues'
import { issueMessage } from './issue-message'

const CODES = [...ERROR_CODES, ...WARNING_CODES]
const TYPES = ['string', 'integer', 'number', 'object', 'array', 'boolean']

describe('сообщения проблем текста', () => {
  it.each(Object.keys(messages))('%s: у каждого кода и типа есть сообщение', (locale) => {
    const texts = (messages as Record<string, { content: { issue: object; type: object } }>)[
      locale
    ]!.content
    expect(Object.keys(texts.issue).sort()).toEqual([...CODES].sort())
    expect(Object.keys(texts.type).sort()).toEqual([...TYPES].sort())
  })

  it('подставляет параметры и переводит ожидаемый тип', () => {
    const i18n = createI18n({ legacy: false, locale: 'ru', messages })
    const t = i18n.global.t as (key: string, params?: Record<string, unknown>) => string
    const phrase: Issue = {
      severity: 'error',
      code: 'phrase_not_in_line',
      path: 'stanzas[0].lines[0].phrases[0]',
      params: { fragment: 'me quiero ir', line: 'Arroz con leche' },
    }
    expect(issueMessage(phrase, t)).toBe(
      'Фраза «me quiero ir» не найдена в строке «Arroz con leche»',
    )
    const type: Issue = {
      severity: 'error',
      code: 'wrong_type',
      path: 'year',
      params: { expected: 'integer' },
    }
    expect(issueMessage(type, t)).toBe('Неверный тип значения: ожидается целое число')
  })
})
