import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv2020 from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'

import { checkDictionaryFile } from '@/features/dictionary'

import { checkLessonFile, validateLesson, validateLessonSet } from './domain/validate'

// Уроки репозитория проверяются вместе со словарями тем же валидатором, что и приложение.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../content')
const read = (sub: string) => {
  const dir = resolve(root, sub)
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => n.endsWith('.json'))
        .map((name) => ({ name, source: readFileSync(resolve(dir, name), 'utf8') }))
    : []
}
const lessons = read('lessons')
const dictionaries = read('dictionary').map(({ source }) => checkDictionaryFile(source).file!)

const schema = JSON.parse(readFileSync(resolve(root, 'schema/lesson.schema.json'), 'utf8'))
const schemaCheck = new Ajv2020({ allErrors: true }).compile(schema)

describe('уроки репозитория', () => {
  it('есть хотя бы один урок', () => {
    expect(lessons.length).toBeGreaterThan(0)
  })

  it.each(lessons)('$name — валиден и проходит JSON Schema', ({ source }) => {
    const result = checkLessonFile(source)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(schemaCheck(JSON.parse(source))).toBe(true)
  })

  it('аудио, на которое ссылаются уроки, лежит в content/ (AC-3)', () => {
    const paths = lessons.flatMap(({ source }) =>
      [...source.matchAll(/"audio":\s*"([^"]+)"/g)].map((m) => m[1]!),
    )
    expect(paths.filter((p) => !existsSync(resolve(root, p)))).toEqual([])
  })

  it('набор со словарями: id, путь, правила чтения, предпосылки, слова', () => {
    const set = lessons.map(({ name, source }) => ({
      name,
      lesson: checkLessonFile(source).lesson!,
    }))
    expect(validateLessonSet(set, dictionaries)).toEqual({ errors: [], warnings: [] })
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
type Edit = (d: any) => void

describe('JSON Schema и валидатор урока не расходятся', () => {
  const byKind = (kind: string) =>
    JSON.parse(lessons.find(({ source }) => JSON.parse(source).kind === kind)!.source)
  const words: [string, Edit][] = [
    ['нет topic', (d) => delete d.topic],
    ['незнакомый вид', (d) => (d.kind = 'video')],
    ['нет фразы', (d) => delete d.phrase],
    ['опечатка', (d) => (d.excercises = [])],
    ['тип упражнения', (d) => (d.exercises[0].type = 'match')],
    ['fill без ответа', (d) => delete d.exercises[0].answer],
    ['место 0', (d) => (d.order = 0)],
    ['слова без topic', (d) => delete d.topic],
  ]
  const sound: [string, Edit][] = [
    ['topic у звучания', (d) => (d.topic = 'travel')],
    ['нет ни букв, ни правил', (d) => (delete d.letters, delete d.rules)],
    ['фраза у звучания', (d) => (d.phrase = { es: 'x', ru: 'y' })],
    ['пара из трёх слов', (d) => (d.exercises[1].items[0] = ['a', 'b', 'c'])],
    ['упражнение слов', (d) => (d.exercises[0] = { type: 'fill', answer: 'x' })],
    ['кривой путь аудио', (d) => (d.rules[0].audio = 'n.wav')],
    ['правило без примеров', (d) => (d.rules[0].examples = [])],
  ]
  const grammar: [string, Edit][] = [
    ['topic у грамматики', (d) => (d.topic = 'it')],
    ['нет паттерна', (d) => delete d.pattern],
    ['нет правила', (d) => delete d.rule],
    ['трансформер без into', (d) => delete d.exercises[0].into],
    ['незнакомая форма', (d) => (d.exercises[0].into[0].form = 'conditional')],
    ['choose без вариантов', (d) => delete d.exercises[1].options],
    ['compose без образца', (d) => delete d.exercises[4].sample],
    ['линия времени', (d) => (d.rule.timeline[0].from = 'yesterday')],
    ['фраза у грамматики', (d) => (d.phrase = { es: 'x', ru: 'y' })],
  ]
  const broken = [
    ...words.map(([n, e]) => ['words', n, e] as const),
    ...sound.map(([n, e]) => ['sound', n, e] as const),
    ...grammar.map(([n, e]) => ['grammar', n, e] as const),
  ]

  it.each(broken)('%s: %s — отвергают оба', (kind, _name, edit) => {
    const doc = structuredClone(byKind(kind))
    edit(doc)
    expect(validateLesson(doc).errors).not.toEqual([])
    expect(schemaCheck(doc)).toBe(false)
  })
})
