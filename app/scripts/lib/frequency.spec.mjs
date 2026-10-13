import { describe, expect, it } from 'vitest'

import { buildLists, parseCsv, toCsv } from './frequency.mjs'

const HEAD = 'lemma,pos,gender,frequency_rank,frequency_count,cefr_estimate,notes,forms'
const csv = (lines) => [HEAD, ...lines].join('\n')

const config = (patch = {}) => ({
  sizes: { verb: 3, noun: 2, adj: 2, adv: 1 },
  aliases: { es: { buen: 'bueno', 'adj:gran': 'grande' } },
  deny: { es: { 'adj:dio': 'mistagged', mierda: 'vulgar' } },
  ...patch,
})

describe('parseCsv', () => {
  it('разбирает поля в кавычках с запятыми и пустые', () => {
    const rows = parseCsv('a,b,c\n"x, y",,"he said ""hi"""\n')
    expect(rows).toEqual([{ a: 'x, y', b: '', c: 'he said "hi"' }])
  })
})

describe('buildLists', () => {
  const source = csv([
    'ser,VERB,,1,100,A1,,',
    'el,DET,,2,99,A1,,',
    'ser,AUX,,3,98,A1,,',
    'casa,NOUN,f,4,97,A1,,',
    'dio,ADJ,,5,96,A1,,',
    'buen,ADJ,,6,95,A1,,',
    'tal,NOUN,,7,94,A1,,',
    'tener,VERB,,8,93,A1,,',
    'bueno,ADJ,,9,92,A1,,',
    'gran,ADJ,,10,91,A1,,',
    'Madrid,NOUN,m,11,90,A1,,',
    'mierda,NOUN,f,12,89,A1,,',
    'tiempo,NOUN,m,13,88,A1,,',
    'aquí,ADV,,14,87,A1,,',
    'ir,VERB,,15,86,A1,,',
    'hacer,VERB,,16,85,A1,,',
  ])

  const { lists, report } = buildLists(parseCsv(source), 'es', config())

  it('VERB и AUX — один список, дубль сливается с лучшим рангом источника', () => {
    expect(lists.verb.map((e) => [e.rank, e.lemma, e.sourceRank])).toEqual([
      [1, 'ser', 1],
      [2, 'tener', 8],
      [3, 'ir', 15],
    ])
    expect(report).toContainEqual({
      lemma: 'ser',
      pos: 'verb',
      sourceRank: 3,
      action: 'merge',
      detail: 'ser',
    })
  })

  it('алиасы — до слияния: buen → bueno, gran → grande (только для прилагательных)', () => {
    expect(lists.adj.map((e) => e.lemma)).toEqual(['bueno', 'grande'])
    expect(report).toContainEqual({
      lemma: 'buen',
      pos: 'adj',
      sourceRank: 6,
      action: 'alias',
      detail: 'bueno',
    })
  })

  it('стоп-лист с причиной: по части речи и для любой части речи', () => {
    expect(report).toContainEqual({
      lemma: 'dio',
      pos: 'adj',
      sourceRank: 5,
      action: 'deny',
      detail: 'mistagged',
    })
    expect(report).toContainEqual({
      lemma: 'mierda',
      pos: 'noun',
      sourceRank: 12,
      action: 'deny',
      detail: 'vulgar',
    })
  })

  it('существительное ES без рода и лемма не по правилу id — в отчёт, не в список', () => {
    expect(lists.noun.map((e) => [e.lemma, e.gender])).toEqual([
      ['casa', 'f'],
      ['tiempo', 'm'],
    ])
    expect(report).toContainEqual({
      lemma: 'tal',
      pos: 'noun',
      sourceRank: 7,
      action: 'no-gender',
      detail: '',
    })
    expect(report).toContainEqual({
      lemma: 'Madrid',
      pos: 'noun',
      sourceRank: 11,
      action: 'bad-id',
      detail: '',
    })
  })

  it('размер списка ограничен, ранги 1…N без дыр', () => {
    expect(lists.adv).toEqual([{ rank: 1, lemma: 'aquí', gender: '', sourceRank: 14, cefr: 'A1' }])
    expect(lists.verb).toHaveLength(3)
  })

  it('поправка рода из конфига — в списке и в отчёте', () => {
    const fixed = buildLists(parseCsv(source), 'es', config({ genders: { es: { casa: 'mf' } } }))
    expect(fixed.lists.noun[0]).toMatchObject({ lemma: 'casa', gender: 'mf' })
    expect(fixed.report).toContainEqual({
      lemma: 'casa',
      pos: 'noun',
      sourceRank: 4,
      action: 'gender',
      detail: 'f → mf',
    })
  })

  it('у EN род не требуется', () => {
    const en = buildLists(
      parseCsv(csv(['house,NOUN,,1,1,A1,,', 'car,NOUN,,2,1,A1,,'])),
      'en',
      config(),
    )
    expect(en.lists.noun.map((e) => e.lemma)).toEqual(['house', 'car'])
  })

  it('детерминизм: тот же вход — тот же CSV', () => {
    const again = buildLists(parseCsv(source), 'es', config())
    expect(toCsv(again.lists.noun)).toBe(toCsv(lists.noun))
    expect(toCsv(lists.noun)).toBe(
      'rank,lemma,gender,source_rank,cefr\n1,casa,f,4,A1\n2,tiempo,m,13,A1\n',
    )
  })
})
