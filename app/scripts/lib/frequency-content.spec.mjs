import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseCsv } from './frequency.mjs'

// Инварианты частотного каркаса content/frequency/ (LNG-S1-012, AC-2, AC-3).
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../content/frequency')
const config = JSON.parse(readFileSync(resolve(dir, 'config.json'), 'utf8'))
const WORD_ID_RE = /^[\p{Ll}\p{Lo}\p{N}]+(-[\p{Ll}\p{Lo}\p{N}]+)*$/u

const lists = config.langs.flatMap((lang) =>
  Object.entries(config.sizes).map(([pos, size]) => ({ lang, pos, size })),
)

describe.each(lists)('каркас $lang.$pos', ({ lang, pos, size }) => {
  const file = resolve(dir, `${lang}.${pos}.csv`)
  const rows = existsSync(file) ? parseCsv(readFileSync(file, 'utf8')) : []
  const denied = (lemma) => config.deny[lang]?.[`${pos}:${lemma}`] ?? config.deny[lang]?.[lemma]
  const aliased = (lemma) =>
    config.aliases[lang]?.[`${pos}:${lemma}`] ?? config.aliases[lang]?.[lemma]

  it(`ровно ${size} слов, ранги 1…N без дыр`, () => {
    expect(rows.map((r) => Number(r.rank))).toEqual(Array.from({ length: size }, (_, i) => i + 1))
  })

  it('леммы уникальны, по правилу id словаря, не из стоп-листа и не формы-алиасы', () => {
    const lemmas = rows.map((r) => r.lemma)
    expect(new Set(lemmas).size).toBe(lemmas.length)
    expect(lemmas.filter((l) => !WORD_ID_RE.test(l))).toEqual([])
    expect(lemmas.filter(denied)).toEqual([])
    expect(lemmas.filter((l) => aliased(l) && aliased(l) !== l)).toEqual([])
  })

  it.runIf(lang === 'es' && pos === 'noun')('у каждого существительного ES есть род', () => {
    expect(rows.filter((r) => !['m', 'f', 'mf'].includes(r.gender)).map((r) => r.lemma)).toEqual([])
  })
})
