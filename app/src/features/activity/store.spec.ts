import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { openDb } from '@/db'
import { idbProfileRepository } from '@/features/profiles/storage'

import { idbActivityRepository, useActivityStore } from './store'

let n = 0
function setup(at = new Date(2026, 9, 2, 10)) {
  const conn = openDb(`activity-${++n}`)
  setActivePinia(createPinia())
  const store = useActivityStore()
  let now = at
  store.configure({ repository: idbActivityRepository(() => conn), now: () => now })
  return { store, conn, setNow: (d: Date) => (now = d) }
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

describe('журнал активности (AC-1, AC-6)', () => {
  it('записи за день суммируются; параллельные записи не затирают друг друга', async () => {
    const { store } = setup()
    await store.forProfile('a')
    await Promise.all([store.record('review'), store.record('review'), store.record('lesson')])
    expect(store.today).toEqual({ profileId: 'a', day: '2026-10-02', lessons: 1, reviews: 2 })
  })

  it('новый день — новая запись, серия считается по журналу', async () => {
    const { store, setNow } = setup()
    await store.forProfile('a')
    await store.record('lesson')
    setNow(new Date(2026, 9, 3, 9))
    expect(store.streakInfo).toEqual({ days: 1, freezes: 0, todayDone: false })
    await store.record('review')
    expect(store.streakInfo).toEqual({ days: 2, freezes: 0, todayDone: true })
  })

  it('свой у профиля и переживает перезапуск', async () => {
    const { store, conn } = setup()
    await store.forProfile('a')
    await store.record('lesson')
    await store.forProfile('b')
    expect(store.today).toEqual({ lessons: 0, reviews: 0 })

    setActivePinia(createPinia())
    const again = useActivityStore()
    again.configure({
      repository: idbActivityRepository(() => conn),
      now: () => new Date(2026, 9, 2, 12),
    })
    await again.forProfile('a')
    expect(again.today).toMatchObject({ lessons: 1 })
  })

  it('без профиля ничего не пишется', async () => {
    const { store } = setup()
    await store.record('lesson')
    expect(store.days.size).toBe(0)
  })

  it('попадает в резервную копию и удаляется вместе с профилем (D-18, К1)', async () => {
    const { store, conn } = setup()
    const profiles = idbProfileRepository(() => conn)
    await profiles.save(profile('a'), true)
    await profiles.save(profile('b'))
    await store.forProfile('a')
    await store.record('lesson')
    expect((await profiles.exportData('a')).activity).toEqual([
      { profileId: 'a', day: '2026-10-02', lessons: 1, reviews: 0 },
    ])
    await profiles.remove('a', 'b')
    expect((await profiles.exportData('a')).activity).toEqual([])
  })
})
