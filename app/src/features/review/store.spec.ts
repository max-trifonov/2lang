import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { openDb } from '@/db'
import { idbProfileRepository } from '@/features/profiles/storage'

import { review } from './cards'
import { idbCardRepository, useCardsStore } from './store'

let n = 0
const now = new Date('2026-10-02T10:00:00')
function setup() {
  const conn = openDb(`cards-store-${++n}`)
  setActivePinia(createPinia())
  const store = useCardsStore()
  store.configure({ repository: idbCardRepository(() => conn), now: () => now })
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

describe('карточки повторения (AC-3…5)', () => {
  it('слова урока: новые карточки на завтра, повтор не перезаписывает (AC-3)', async () => {
    const { store } = setup()
    await store.forProfile('a')
    await store.addLessonWords(['word:es:tener', 'word:es:reserva'])
    const first = store.get('word:es:tener')!
    const reviewed = review(first, 3, now)
    await store.putMany([reviewed])
    await store.addLessonWords(['word:es:tener', 'word:es:aquí'])
    expect(store.get('word:es:tener')).toEqual(reviewed)
    expect(store.get('word:es:aquí')?.state).toBe('new')
    expect(store.cards.size).toBe(3)
  })

  it('известные слова: редкие карточки, существующая не меняется (AC-4)', async () => {
    const { store } = setup()
    await store.forProfile('a')
    await store.addLessonWords(['word:en:be'])
    const own = store.get('word:en:be')!
    await store.addKnownWords(['word:en:be', 'word:en:time'])
    expect(store.get('word:en:be')).toEqual(own)
    expect(store.get('word:en:time')).toMatchObject({ state: 'review', difficulty: 3 })
  })

  it('«к повторению»: сегодняшние, по языку, просроченные первыми', async () => {
    const { store } = setup()
    await store.forProfile('a')
    await store.addLessonWords(['word:es:a']) // завтра — не сегодня
    expect(store.due()).toEqual([])
    const base = store.get('word:es:a')!
    await store.putMany([
      { ...base, key: 'word:es:old', due: '2026-09-28T10:00:00.000Z' },
      { ...base, key: 'word:es:today', due: '2026-10-02T09:00:00.000Z' },
      { ...base, key: 'word:en:x', lang: 'en', due: '2026-10-01T10:00:00.000Z' },
    ])
    expect(store.due().map((c) => c.key)).toEqual(['word:es:old', 'word:en:x', 'word:es:today'])
    expect(store.due('es').map((c) => c.key)).toEqual(['word:es:old', 'word:es:today'])
  })

  it('свои у профиля и переживают перезапуск', async () => {
    const { store, conn } = setup()
    await store.forProfile('a')
    await store.addLessonWords(['word:es:tener'])
    await store.forProfile('b')
    expect(store.cards.size).toBe(0)

    setActivePinia(createPinia())
    const again = useCardsStore()
    again.configure({ repository: idbCardRepository(() => conn) })
    await again.forProfile('a')
    expect([...again.cards.keys()]).toEqual(['word:es:tener'])
  })

  it('попадают в резервную копию и удаляются вместе с профилем (D-18, К1)', async () => {
    const { store, conn } = setup()
    const profiles = idbProfileRepository(() => conn)
    await profiles.save(profile('a'), true)
    await profiles.save(profile('b'))
    await store.forProfile('a')
    await store.addLessonWords(['word:es:tener'])
    await store.forProfile('b')
    await store.addLessonWords(['word:es:casa'])

    expect(((await profiles.exportData('a')).cards ?? []).map((c) => c.key)).toEqual([
      'word:es:tener',
    ])
    await profiles.remove('a', 'b')
    expect((await profiles.exportData('a')).cards).toEqual([])
    expect((await profiles.exportData('b')).cards).toHaveLength(1)
  })
})
