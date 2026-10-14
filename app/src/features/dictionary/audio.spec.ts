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
  it('записи лежат только у лемм словаря; без записи — голос устройства (D-36)', () => {
    // Запись — первое звено цепочки озвучки, а не обязательство: слова партии 4 (LNG-S1-032)
    // озвучивает голос устройства, пока не перезапущен content/audio/words/build.py.
    const missing = dictionaries.flatMap((d) =>
      d.entries.filter((e) => !wordAudioUrl(e.lemma, d.lang)).map((e) => `${d.lang}:${e.lemma}`),
    )
    const total = dictionaries.reduce((n, d) => n + d.entries.length, 0)
    console.info(`слов без записи: ${missing.length} из ${total}`)
    expect(missing.length).toBeLessThanOrEqual(total)
  })

  it('нет записи — undefined', () => {
    expect(wordAudioUrl('zzzz-nonexistent', 'es')).toBeUndefined()
    expect(wordAudioUrl('casa', 'fr')).toBeUndefined()
  })
})
