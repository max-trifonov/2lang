import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { openDb } from '@/db'
import { idbProfileRepository } from '@/features/profiles/storage'

import { idbSavedWordsRepository, useSavedWordsStore } from './saved'

let n = 0
function setup() {
  const conn = openDb(`saved-${++n}`)
  setActivePinia(createPinia())
  const store = useSavedWordsStore()
  store.configure({
    repository: idbSavedWordsRepository(() => conn),
    now: () => new Date('2026-10-01T00:00:00Z'),
  })
  return { store, conn }
}

const profile = (id: string) => ({
  id,
  name: id,
  color: 'blue' as const,
  interfaceLocale: 'ru' as const,
  languages: ['es' as const],
  dailyGoal: 2,
  createdAt: '2026-10-01T00:00:00Z',
})

describe('«мои слова» (AC-3)', () => {
  it('отметка своя у каждого профиля и переживает перезагрузку стора', async () => {
    const { store, conn } = setup()
    await store.forProfile('a')
    await store.toggle('word:es:tener')
    await store.forProfile('b')
    expect(store.has('word:es:tener')).toBe(false)
    await store.toggle('word:es:casa')

    setActivePinia(createPinia())
    const again = useSavedWordsStore()
    again.configure({ repository: idbSavedWordsRepository(() => conn) })
    await again.forProfile('a')
    expect([...again.keys]).toEqual(['word:es:tener'])
  })

  it('повторное нажатие снимает отметку', async () => {
    const { store } = setup()
    await store.forProfile('a')
    await store.toggle('word:es:tener')
    await store.toggle('word:es:tener')
    await store.forProfile('a')
    expect(store.keys.size).toBe(0)
  })

  it('без профиля отметить нельзя', async () => {
    const { store } = setup()
    await store.forProfile(null)
    await store.toggle('word:es:tener')
    expect(store.keys.size).toBe(0)
  })

  it('попадают в резервную копию и удаляются вместе с профилем (D-18, К1)', async () => {
    const { store, conn } = setup()
    const profiles = idbProfileRepository(() => conn)
    await profiles.save(profile('a'), true)
    await profiles.save(profile('b'))
    await store.forProfile('a')
    await store.toggle('word:es:tener')
    await store.forProfile('b')
    await store.toggle('word:es:casa')

    expect((await profiles.exportData('a')).saved_words).toEqual([
      { profileId: 'a', key: 'word:es:tener', savedAt: '2026-10-01T00:00:00.000Z' },
    ])
    await profiles.remove('a', 'b')
    expect((await profiles.exportData('a')).saved_words).toEqual([])
    expect((await profiles.exportData('b')).saved_words).toHaveLength(1)
  })
})
