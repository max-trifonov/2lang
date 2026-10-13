import { describe, expect, it } from 'vitest'

import { scramble, seeded, shuffle, splitBlocks } from './blocks'

describe('блоки «собери фразу»', () => {
  it('режет по пробелам, знаки остаются при словах', () => {
    expect(splitBlocks(' Tengo una  reserva aquí. ')).toEqual(['Tengo', 'una', 'reserva', 'aquí.'])
  })

  it('перемешивание сохраняет состав', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect(shuffle(items, seeded(1)).sort()).toEqual(items)
  })

  it('scramble не отдаёт исходный порядок при любом seed', () => {
    const items = ['Tengo', 'una', 'reserva']
    for (let s = 0; s < 50; s++) expect(scramble(items, seeded(s))).not.toEqual(items)
  })

  it('scramble с генератором без перестановок всё равно сдвигает', () => {
    expect(scramble(['a', 'b', 'c'], () => 0.999)).not.toEqual(['a', 'b', 'c'])
  })
})
