import { describe, expect, it } from 'vitest'

import { formsOf, highlightParts } from './highlight'

const hits = (text: string, lemma: string, forms: string[] = []) =>
  highlightParts(text, lemma, forms)
    .filter((p) => p.hit)
    .map((p) => p.text)

describe('highlightParts', () => {
  it('находит форму из словаря', () => {
    expect(hits('Soy desarrollador y trabajo desde casa.', 'ser', ['soy', 'eres'])).toEqual(['Soy'])
  })

  it('находит производную по основе', () => {
    expect(hits('I booked a room for two nights.', 'book')).toEqual(['booked'])
    expect(hits('Reservé una mesa para dos.', 'reservar')).toEqual(['Reservé'])
  })

  it('варианты через « / » — каждый отдельно', () => {
    expect(hits('They were late.', 'be', ['was / were'])).toEqual(['were'])
  })

  it('многословная форма не подсвечивает служебное слово', () => {
    expect(hits('It is more important now.', 'important', ['more important'])).toEqual([
      'important',
    ])
  })

  it('многословная лемма — каждое её слово', () => {
    expect(hits('Tengo que salir.', 'tener que', ['tengo'])).toEqual(['Tengo', 'que'])
  })

  it('короткая лемма без основы: «ir» не загорается в «irregular»', () => {
    expect(hits('Es irregular, voy mañana.', 'ir', ['voy'])).toEqual(['voy'])
  })

  it('без совпадений — текст одной частью', () => {
    expect(highlightParts('Hola, ¿qué tal?', 'casa')).toEqual([
      { text: 'Hola, ¿qué tal?', hit: false },
    ])
  })

  it('части склеиваются в исходный текст', () => {
    const text = '¡Mi CASA es tu casa!'
    const parts = highlightParts(text, 'casa')
    expect(parts.map((p) => p.text).join('')).toBe(text)
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual(['CASA', 'casa'])
  })
})

describe('formsOf', () => {
  it('строки и массивы в один список', () => {
    expect(formsOf({ s: 'is', present: ['soy', 'eres'] })).toEqual(['is', 'soy', 'eres'])
    expect(formsOf(undefined)).toEqual([])
  })
})
