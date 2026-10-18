import { describe, expect, it } from 'vitest'

import { expandStanzas, findEntry, lineWords, translationOf } from './read'
import type { Line, TextDoc } from './types'

const doc = (stanzas: TextDoc['stanzas']): TextDoc => ({
  format: '2lang/text',
  version: 1,
  id: 't',
  kind: 'song',
  lang: 'es',
  license: 'own',
  title: { es: 'T' },
  stanzas,
})

describe('expandStanzas', () => {
  it('подставляет строки объявленной строфы вместо ref', () => {
    const chorus = [{ es: 'a' }]
    const out = expandStanzas(
      doc([{ lines: [{ es: 'x' }] }, { id: 'c', type: 'chorus', lines: chorus }, { ref: 'c' }]),
    )
    expect(out.map((s) => [s.type, s.repeat, s.lines.length])).toEqual([
      ['verse', false, 1],
      ['chorus', false, 1],
      ['verse', true, 1],
    ])
    expect(out[2]!.lines).toBe(chorus)
  })

  it('передаёт, кто произносит строфу', () => {
    const out = expandStanzas(
      doc([{ speaker: 'Romeo', lines: [{ es: 'x' }] }, { lines: [{ es: 'y' }] }]),
    )
    expect(out.map((s) => s.speaker)).toEqual(['Romeo', undefined])
  })
})

describe('translationOf', () => {
  const line: Line = { es: 'hola', en: 'hi', ru: 'привет' }
  it('язык интерфейса, иначе первый перевод', () => {
    expect(translationOf(line, 'es', 'ru')).toEqual({ lang: 'ru', text: 'привет' })
    expect(translationOf({ es: 'hola', en: 'hi' }, 'es', 'ru')).toEqual({ lang: 'en', text: 'hi' })
  })
  it('на языке оригинала перевода интерфейса нет — берёт другой', () => {
    expect(translationOf(line, 'es', 'es')?.lang).toBe('en')
  })
  it('нет переводов — undefined', () => {
    expect(translationOf({ es: 'hola' }, 'es', 'ru')).toBeUndefined()
  })
  it('работает и с локализованной заметкой', () => {
    expect(translationOf({ ru: 'про' }, 'es', 'ru')).toEqual({ lang: 'ru', text: 'про' })
  })
})

describe('lineWords', () => {
  it('ручной разбор приоритетнее', () => {
    const w = { es: 'quiero', lemma: 'querer' }
    expect(lineWords({ es: 'me quiero casar', words: [w] }, 'es')).toEqual([w])
  })
  it('без разбора — слова строки без знаков препинания', () => {
    expect(lineWords({ es: '¡Hola, mundo!' }, 'es').map((w) => w.es)).toEqual(['Hola', 'mundo'])
  })
})

describe('findEntry', () => {
  const entries = [
    { id: 'querer', lemma: 'querer', forms: { present: ['quiero', 'quieres'] } },
    { id: 'ano', lemma: 'año' },
  ]
  it('по лемме, форме и без ударений', () => {
    expect(findEntry(entries, { form: 'x', lemma: 'Querer' })?.id).toBe('querer')
    expect(findEntry(entries, { form: 'Quiero' })?.id).toBe('querer')
    expect(findEntry(entries, { form: 'ano' })?.id).toBe('ano')
  })
  it('нет в словаре — undefined', () => {
    expect(findEntry(entries, { form: 'casar' })).toBeUndefined()
  })
})
