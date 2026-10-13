import { describe, expect, it } from 'vitest'

import { checkAnswer } from './answer'

describe('сверка ответа (AC-4)', () => {
  it.each([
    ['  Tengo. ', 'Tengo'],
    ['¿Tienes   reserva?', 'tienes reserva'],
    ['NO TENGO RESERVA', 'No tengo reserva.'],
  ])('«%s» = «%s»', (input, answer) => {
    expect(checkAnswer(input, answer).verdict).toBe('exact')
  })

  it('без ударения и тильды — засчитано с подсказкой написания', () => {
    expect(checkAnswer('aqui', 'aquí')).toEqual({ verdict: 'accent', expected: 'aquí' })
    expect(checkAnswer('ano', ['año'])).toEqual({ verdict: 'accent', expected: 'año' })
  })

  it('совпадение с любым из вариантов; подсказка — совпавший', () => {
    expect(
      checkAnswer('no tengo una reserva', ['No tengo reserva.', 'No tengo una reserva.']),
    ).toEqual({ verdict: 'exact', expected: 'No tengo una reserva.' })
  })

  it('неверный и пустой ответ — wrong с первым вариантом', () => {
    expect(checkAnswer('tienes', ['Tengo', 'tengo'])).toEqual({
      verdict: 'wrong',
      expected: 'Tengo',
    })
    expect(checkAnswer('  ', 'Tengo').verdict).toBe('wrong')
  })

  it('лишняя буква с ударением не засчитывается', () => {
    expect(checkAnswer('aquíí', 'aquí').verdict).toBe('wrong')
  })
})
