import { describe, expect, it } from 'vitest'

import { MAX_FILE_BYTES, phraseKeys, planImport, tooLargePlan } from './import-plan'
import type { TextDoc } from './types'

function doc(phrases: string[], ru = 'перевод'): TextDoc {
  return {
    format: '2lang/text',
    version: 1,
    id: 'song',
    kind: 'song',
    lang: 'es',
    license: 'own',
    title: { es: 'Canción' },
    stanzas: [
      {
        id: 'c',
        lines: [
          {
            es: 'me quiero casar con una señorita de San Nicolás',
            ru,
            phrases: phrases.map((es) => ({ es, ru: 'фраза' })),
          },
        ],
      },
      { ref: 'c' },
    ],
  }
}

const none = () => undefined
const has = (text: TextDoc) => (id: string) => (id === text.id ? text : undefined)

describe('planImport', () => {
  it('новый текст', () => {
    const plan = planImport(JSON.stringify(doc(['me quiero casar'])), none)
    expect(plan.kind).toBe('new')
  })

  it('невалидный и битый JSON — invalid с проблемами', () => {
    const bad = planImport(JSON.stringify({ ...doc([]), kind: 'film' }), none)
    expect(bad).toMatchObject({ kind: 'invalid', errors: [{ code: 'bad_value', path: 'kind' }] })
    expect(planImport('{', none)).toMatchObject({
      kind: 'invalid',
      errors: [{ code: 'json_syntax' }],
    })
  })

  it('тот же текст в другом форматировании и порядке ключей — unchanged', () => {
    const text = doc(['me quiero casar'])
    const { stanzas, ...rest } = text
    const reordered = { stanzas, ...rest }
    expect(planImport(JSON.stringify(reordered, null, 4), has(text)).kind).toBe('unchanged')
  })

  it('замена: итог по фразам считается по ключу прогресса', () => {
    const before = doc(['me quiero casar', 'con una señorita', 'San Nicolás'])
    // перевод строки правлен, регистр фразы изменён (ключ тот же), одна фраза изменена, одна новая
    const after = doc(
      ['Me quiero casar', 'con una señorita de', 'San Nicolás', 'quiero'],
      'новый перевод',
    )
    const plan = planImport(JSON.stringify(after), has(before))
    expect(plan).toMatchObject({ kind: 'replace', phrases: { kept: 2, added: 2, removed: 1 } })
  })

  it('слишком большой файл', () => {
    expect(tooLargePlan(MAX_FILE_BYTES + 1)).toMatchObject({
      kind: 'invalid',
      errors: [{ code: 'file_too_large', params: { max: 1000 } }],
    })
  })
})

describe('phraseKeys', () => {
  it('строфа-повтор не удваивает фразы', () => {
    expect(phraseKeys(doc(['me quiero casar']))).toEqual(new Set(['song:me quiero casar']))
  })
})
