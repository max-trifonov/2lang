import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv2020 from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'

import { checkDictionaryFile, validateDictionary, validateDictionarySet } from './domain/validate'

// Словари репозитория проверяются тем же валидатором, что и приложение (AC-1, AC-3).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../content')
const dir = resolve(root, 'dictionary')
const files = existsSync(dir)
  ? readdirSync(dir)
      .filter((n) => n.endsWith('.json'))
      .map((name) => ({ name, source: readFileSync(resolve(dir, name), 'utf8') }))
  : []

const schema = JSON.parse(readFileSync(resolve(root, 'schema/dictionary.schema.json'), 'utf8'))
const schemaCheck = new Ajv2020({ allErrors: true }).compile(schema)

describe('словари репозитория', () => {
  it('есть хотя бы один словарь', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('$name — валиден, имя файла начинается с языка', ({ name, source }) => {
    const result = checkDictionaryFile(source)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(name.startsWith(`${result.file!.lang}.`)).toBe(true)
  })

  it('набор: id и ранги уникальны, пары разрешаются', () => {
    const set = files.map(({ name, source }) => ({ name, file: checkDictionaryFile(source).file! }))
    expect(validateDictionarySet(set)).toEqual({ errors: [], warnings: [] })
  })

  it.each(files)('$name — проходит и JSON Schema', ({ source }) => {
    expect(schemaCheck(JSON.parse(source))).toBe(true)
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
type Edit = (d: any) => void

// Статьи — на частотном каркасе content/frequency (LNG-S1-013, AC-2): ранг, род и id не
// расходятся с каркасом; лемма в нескольких частях речи — id `<лемма>-<часть речи>` у всех,
// кроме первой по приоритету verb → noun → adj → adv.
const LIST_POS: Record<string, string> = {
  verbs: 'verb',
  nouns: 'noun',
  adjectives: 'adj',
  adverbs: 'adv',
}
const PRIORITY = ['verb', 'noun', 'adj', 'adv']
const skeleton = (lang: string, pos: string) =>
  new Map(
    readFileSync(resolve(root, `frequency/${lang}.${pos}.csv`), 'utf8')
      .trim()
      .split('\n')
      .slice(1)
      .map((line) => {
        const [rank, lemma, gender] = line.split(',')
        return [lemma!, { rank: Number(rank), gender: gender ?? '' }] as const
      }),
  )

describe('словари на частотном каркасе', () => {
  const real = files.filter(({ name }) => LIST_POS[name.split('.')[1]!])

  it.each(real)('$name — ранг, род и id по каркасу (AC-2)', ({ name, source }) => {
    const [lang, list] = name.split('.') as [string, string]
    const pos = LIST_POS[list]!
    const owner = new Map<string, string>()
    for (const p of PRIORITY)
      for (const lemma of skeleton(lang, p).keys()) if (!owner.has(lemma)) owner.set(lemma, p)
    const sk = skeleton(lang, pos)
    const file = checkDictionaryFile(source).file!
    const mismatches = file.entries.flatMap((e) => {
      const row = sk.get(e.lemma)
      const id = owner.get(e.lemma) === pos ? e.lemma : `${e.lemma}-${pos}`
      const problems = [
        !row && 'нет в каркасе',
        row && row.rank !== e.rank && `ранг ${e.rank} ≠ ${row.rank}`,
        row &&
          lang === 'es' &&
          pos === 'noun' &&
          row.gender !== e.gender &&
          `род ${e.gender} ≠ ${row.gender}`,
        e.pos !== pos && `часть речи ${e.pos}`,
        e.id !== id && `id ${e.id} ≠ ${id}`,
      ].filter(Boolean)
      return problems.length ? [`${e.lemma}: ${problems.join(', ')}`] : []
    })
    expect(mismatches).toEqual([])
  })

  it('черновики ИИ помечены ext.draft (AC-3, D-25)', () => {
    const counts = real.map(({ name, source }) => {
      const entries = checkDictionaryFile(source).file!.entries
      return {
        name,
        total: entries.length,
        draft: entries.filter((e) => e.ext?.draft === true).length,
      }
    })
    // Число черновиков видно в выводе теста — выверка автора уменьшает его.
    console.info(counts.map((c) => `${c.name}: черновиков ${c.draft} из ${c.total}`).join('\n'))
    // Пометка — только true; выверенная статья пометку теряет, а не получает false.
    const odd = real.flatMap(({ name, source }) =>
      checkDictionaryFile(source)
        .file!.entries.filter((e) => e.ext && 'draft' in e.ext && e.ext.draft !== true)
        .map((e) => `${name}: ${e.id}`),
    )
    expect(odd).toEqual([])
  })
})

describe('JSON Schema и валидатор словаря не расходятся', () => {
  const base = JSON.parse(files.find((f) => f.name === 'es.verbs.json')!.source)

  const broken: [string, Edit][] = [
    ['нет lang', (d) => delete d.lang],
    ['незнакомый ключ', (d) => (d.entires = [])],
    ['лицензия', (d) => (d.license = 'gpl')],
    ['id с пробелом', (d) => (d.entries[0].id = 'ser x')],
    ['ранг 0', (d) => (d.entries[0].rank = 0)],
    ['часть речи', (d) => (d.entries[0].pos = 'verbo')],
    ['пустой перевод', (d) => (d.entries[0].translations = {})],
    ['тема примера', (d) => (d.entries[0].examples[0].topic = 'food')],
    ['опечатка в статье', (d) => (d.entries[0].lema = 'x')],
  ]

  it.each(broken)('%s — отвергают оба', (_name, edit) => {
    const doc = structuredClone(base)
    edit(doc)
    expect(validateDictionary(doc).errors).not.toEqual([])
    expect(schemaCheck(doc)).toBe(false)
  })
})
