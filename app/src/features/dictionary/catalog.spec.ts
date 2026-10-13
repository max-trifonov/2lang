import { describe, expect, it } from 'vitest'

import { article, byList, keyOf, search, searchKey, type CatalogEntry } from './catalog'

const e = (
  id: string,
  pos: CatalogEntry['pos'],
  rank: number,
  patch: Partial<CatalogEntry> = {},
): CatalogEntry => ({
  lang: 'es',
  id,
  lemma: id,
  pos,
  rank,
  translations: { ru: id },
  ...patch,
})

const entries = [
  e('pensar', 'verb', 20, {
    translations: { ru: 'думать' },
    forms: { present: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'] },
  }),
  e('tener', 'verb', 3, { translations: { ru: 'иметь' } }),
  e('año', 'noun', 9, { gender: 'm', translations: { ru: 'год' } }),
  e('ano', 'noun', 900, { gender: 'm', translations: { ru: 'анус' } }),
  e('anoche', 'adv', 55, { translations: { ru: 'вчера вечером' } }),
  e('hacer', 'verb', 5, { translations: { ru: 'делать' }, forms: { past: 'did / done' } }),
]

describe('searchKey', () => {
  it('без регистра, ударений и тильды', () => {
    expect(searchKey('  AÑO ')).toBe('ano')
    expect(searchKey('Pensáis')).toBe('pensais')
  })
})

describe('byList', () => {
  it('часть речи, по рангу', () => {
    expect(byList(entries, 'verb').map((x) => x.id)).toEqual(['tener', 'hacer', 'pensar'])
  })
})

describe('search', () => {
  it('«ano» — точные совпадения леммы выше, затем начало слова', () => {
    expect(search(entries, 'ano').map((x) => x.id)).toEqual(['año', 'ano', 'anoche'])
  })

  it('по форме: pienso → pensar', () => {
    expect(search(entries, 'pienso').map((x) => x.id)).toEqual(['pensar'])
  })

  it('по варианту формы через « / »', () => {
    expect(search(entries, 'done').map((x) => x.id)).toEqual(['hacer'])
  })

  it('по русскому переводу', () => {
    expect(search(entries, 'ДЕЛАТЬ').map((x) => x.id)).toEqual(['hacer'])
  })

  it('пустой запрос — пусто', () => {
    expect(search(entries, '   ')).toEqual([])
  })
})

describe('article', () => {
  it.each([
    [{ lemma: 'casa', gender: 'f' as const }, 'la'],
    [{ lemma: 'año', gender: 'm' as const }, 'el'],
    [{ lemma: 'estudiante', gender: 'mf' as const }, 'el/la'],
    [{ lemma: 'agua', gender: 'f' as const }, 'el'],
    [{ lemma: 'gracias', gender: 'f' as const }, 'las'],
    [{ lemma: 'house' }, ''],
  ])('%o → %s', (entry, expected) => {
    expect(article(entry)).toBe(expected)
  })
})

describe('keyOf', () => {
  it('ключ прогресса слова', () => {
    expect(keyOf(e('solo-adv', 'adv', 1))).toBe('word:es:solo-adv')
  })
})
