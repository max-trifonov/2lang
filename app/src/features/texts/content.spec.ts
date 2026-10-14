import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv2020 from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'

import { checkTextFile, validateText } from './domain/validate'

// Контент репозитория проверяется тем же валидатором, что и загрузка в приложении:
// невалидный текст в content/ роняет `npm run test`. content/private/ (D-5, D-41)
// проверяется, когда он есть у автора локально.
// Не `new URL(…, import.meta.url)`: Vite принимает такую запись за ассет.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../content')
const contentDir = (sub: string) => resolve(root, sub)

function jsonFiles(sub: string): string[] {
  const dir = contentDir(sub)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => `${dir}/${name}`)
}

const schema = JSON.parse(readFileSync(contentDir('schema/text.schema.json'), 'utf8'))
// Формат uri проверяет валидатор приложения; ajv здесь — только сверка структуры.
const schemaCheck = new Ajv2020({ allErrors: true, validateFormats: false }).compile(schema)

const shipped = jsonFiles('texts')
const personal = jsonFiles('private')

describe('контент репозитория', () => {
  it('в поставке есть тексты', () => {
    expect(shipped.length).toBeGreaterThan(0)
  })

  it.each([...shipped, ...personal])('%s — валиден, имя файла = <id>.<lang>.json', (file) => {
    const result = checkTextFile(readFileSync(file, 'utf8'))
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    const { id, lang } = result.text!
    expect(file.endsWith(`/${id}.${lang}.json`)).toBe(true)
  })

  it.each(shipped)('%s — в поставке нет личных текстов (D-5)', (file) => {
    expect(checkTextFile(readFileSync(file, 'utf8')).text?.license).not.toBe('personal')
  })

  // Отсылки к правилам (D-42): каждая тема `see` — урок грамматики того же языка.
  const grammar = new Map(
    jsonFiles('lessons')
      .map((f) => JSON.parse(readFileSync(f, 'utf8')) as { id: string; kind: string; lang: string })
      .filter((l) => l.kind === 'grammar')
      .map((l) => [l.id, l.lang]),
  )
  it.each([...shipped, ...personal])('%s — отсылки see ведут на темы грамматики языка', (file) => {
    const text = checkTextFile(readFileSync(file, 'utf8')).text!
    for (const id of text.see ?? []) expect([id, grammar.get(id)]).toEqual([id, text.lang])
  })

  it.each([...shipped, ...personal])('%s — проходит и JSON Schema', (file) => {
    expect(schemaCheck(JSON.parse(readFileSync(file, 'utf8')))).toBe(true)
  })
})

describe('JSON Schema и валидатор не расходятся', () => {
  const valid = {
    format: '2lang/text',
    version: 1,
    id: 'x',
    kind: 'poem',
    lang: 'en',
    license: 'own',
    title: { en: 'X', ru: 'Икс' },
    author: 'a',
    performer: 'p',
    year: 2000,
    level: 'B1',
    tags: ['it'],
    links: [{ type: 'source', url: 'https://example.org' }],
    note: { ru: 'n' },
    see: ['en-grammar-01'],
    ext: { any: 1 },
    stanzas: [
      {
        id: 'c',
        type: 'chorus',
        ext: {},
        lines: [
          {
            en: 'Hello world',
            ru: 'Привет, мир',
            lit: { ru: 'Привет мир' },
            note: { ru: 'n' },
            t: 0,
            ext: {},
            phrases: [{ en: 'hello', ru: 'привет', note: { ru: 'n' }, ext: {} }],
            words: [{ en: 'world', ru: 'мир', lemma: 'world', pos: 'noun', ext: {} }],
          },
        ],
      },
      { ref: 'c' },
    ],
  }

  it('полный корректный текст принимают оба', () => {
    expect(validateText(valid).errors).toEqual([])
    expect(schemaCheck(valid)).toBe(true)
  })

  const broken: [string, (d: typeof valid & Record<string, unknown>) => void][] = [
    ['нет id', (d) => delete (d as Partial<typeof valid>).id],
    ['неизвестный ключ', (d) => (d.titel = 'x')],
    ['неизвестный kind', (d) => (d.kind = 'film')],
    ['год строкой', (d) => ((d as Record<string, unknown>).year = '2000')],
    ['id не slug', (d) => (d.id = 'X Y')],
    ['пустые строфы', (d) => (d.stanzas = [])],
    ['lines и ref сразу', (d) => d.stanzas.push({ ref: 'c', lines: d.stanzas[0]!.lines } as never)],
    ['ключ-опечатка в строке', (d) => Object.assign(d.stanzas[0]!.lines![0]!, { transl: 'x' })],
    ['неизвестная часть речи', (d) => (d.stanzas[0]!.lines![0]!.words[0]!.pos = 'nounish')],
  ]

  it.each(broken)('%s — отвергают оба', (_name, edit) => {
    const doc = structuredClone(valid) as typeof valid & Record<string, unknown>
    edit(doc)
    expect(validateText(doc).errors).not.toEqual([])
    expect(schemaCheck(doc)).toBe(false)
  })
})
