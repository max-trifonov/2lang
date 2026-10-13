import { describe, expect, it } from 'vitest'

import { filterLibrary, mergeLibrary } from './catalog'
import type { TextDoc } from './domain/types'
import type { TextRecord } from './storage'

const doc = (id: string, lang: string, kind: TextDoc['kind'] = 'song'): TextDoc => ({
  format: '2lang/text',
  version: 1,
  id,
  kind,
  lang,
  license: 'own',
  title: { [lang]: id },
  stanzas: [{ lines: [{ [lang]: 'x' }] }],
})
const rec = (d: TextDoc): TextRecord => ({
  id: d.id,
  doc: d,
  addedAt: '',
  updatedAt: '',
  addedBy: null,
})

describe('mergeLibrary', () => {
  it('загруженный текст перекрывает поставку с тем же id', () => {
    const mine = doc('a', 'es')
    const items = mergeLibrary([doc('a', 'en'), doc('b', 'en')], [rec(mine)])
    expect(items.map((i) => [i.doc.id, i.source])).toEqual([
      ['a', 'uploaded'],
      ['b', 'bundled'],
    ])
    expect(items[0]!.doc).toBe(mine)
  })
})

describe('filterLibrary', () => {
  const items = mergeLibrary([doc('a', 'en'), doc('b', 'es', 'poem'), doc('c', 'es')], [])
  it('по языку и типу', () => {
    expect(filterLibrary(items, {}).length).toBe(3)
    expect(filterLibrary(items, { lang: 'es' }).map((i) => i.doc.id)).toEqual(['b', 'c'])
    expect(filterLibrary(items, { lang: 'es', kind: 'song' }).map((i) => i.doc.id)).toEqual(['c'])
  })
})
