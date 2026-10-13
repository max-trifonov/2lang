import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { audioKey, wordAudioUrl } from './audio'

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../content/dictionary')
const dictionaries = readdirSync(dir)
  .filter((n) => n.endsWith('.json'))
  .map(
    (n) =>
      JSON.parse(readFileSync(resolve(dir, n), 'utf8')) as {
        lang: string
        entries: { lemma: string }[]
      },
  )

describe('audioKey', () => {
  it('совпадает с ключом content/audio/words/build.py', () => {
    expect(audioKey('casa')).toBe('9f253efd')
    expect(audioKey('beautiful')).toBe('1f951fd4')
  })

  it('регистр, краевые пробелы и форма Unicode не меняют ключ', () => {
    expect(audioKey('  Casa ')).toBe(audioKey('casa'))
    expect(audioKey('nin\u0303o')).toBe(audioKey('niño'))
  })
})

describe('записи слов', () => {
  it('у каждой леммы словаря есть запись (иначе — перезапустить build.py)', () => {
    const missing = dictionaries.flatMap((d) =>
      d.entries.filter((e) => !wordAudioUrl(e.lemma, d.lang)).map((e) => `${d.lang}:${e.lemma}`),
    )
    expect(missing).toEqual([])
  })

  it('нет записи — undefined', () => {
    expect(wordAudioUrl('zzzz-nonexistent', 'es')).toBeUndefined()
    expect(wordAudioUrl('casa', 'fr')).toBeUndefined()
  })
})
