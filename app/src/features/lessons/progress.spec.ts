import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { openDb } from '@/db'
import { idbProfileRepository } from '@/features/profiles/storage'

import { idbLessonProgressRepository, useLessonProgressStore } from './progress'

const profile = (id: string) => ({
  id,
  name: id,
  color: 'blue' as const,
  interfaceLocale: 'ru' as const,
  languages: ['es' as const],
  dailyGoal: 2,
  createdAt: '2026-10-01T00:00:00Z',
})

let n = 0
function setup(at = '2026-10-01T10:00:00.000Z') {
  const conn = openDb(`lesson-progress-${++n}`)
  setActivePinia(createPinia())
  const store = useLessonProgressStore()
  let now = at
  store.configure({ repository: idbLessonProgressRepository(() => conn), now: () => new Date(now) })
  return { store, conn, setNow: (t: string) => (now = t) }
}

describe('прохождения уроков (AC-6, AC-8)', () => {
  it('прохождение своё у профиля и переживает перезапуск', async () => {
    const { store, conn } = setup()
    await store.forProfile('a')
    await store.complete('es-travel-01', 0.75)
    await store.forProfile('b')
    expect(store.doneIds().size).toBe(0)

    setActivePinia(createPinia())
    const again = useLessonProgressStore()
    again.configure({ repository: idbLessonProgressRepository(() => conn) })
    await again.forProfile('a')
    expect([...again.doneIds()]).toEqual(['es-travel-01'])
    expect(again.get('es-travel-01')).toEqual({
      profileId: 'a',
      key: 'lesson:es-travel-01',
      firstCompletedAt: '2026-10-01T10:00:00.000Z',
      completedAt: '2026-10-01T10:00:00.000Z',
      runs: 1,
      bestScore: 0.75,
    })
  })

  it('повторное прохождение: первое сохраняется, лучшая оценка — максимум', async () => {
    const { store, setNow } = setup()
    await store.forProfile('a')
    await store.complete('es-travel-01', 0.9)
    setNow('2026-10-02T10:00:00.000Z')
    const second = await store.complete('es-travel-01', 0.5)
    expect(second).toMatchObject({
      firstCompletedAt: '2026-10-01T10:00:00.000Z',
      completedAt: '2026-10-02T10:00:00.000Z',
      runs: 2,
      bestScore: 0.9,
    })
  })

  it('без активного профиля ничего не пишется', async () => {
    const { store } = setup()
    expect(await store.complete('es-travel-01', 1)).toBeNull()
  })

  it('попадают в резервную копию и удаляются вместе с профилем (D-18, К1)', async () => {
    const { store, conn } = setup()
    const profiles = idbProfileRepository(() => conn)
    await profiles.save(profile('a'), true)
    await profiles.save(profile('b'))
    await store.forProfile('a')
    await store.complete('es-travel-01', 1)
    await store.forProfile('b')
    await store.complete('es-travel-01', 0.5)

    const [mine] = (await profiles.exportData('a')).lesson_progress ?? []
    expect(mine).toMatchObject({ profileId: 'a', key: 'lesson:es-travel-01', bestScore: 1 })
    await profiles.remove('a', 'b')
    expect((await profiles.exportData('a')).lesson_progress).toEqual([])
    expect((await profiles.exportData('b')).lesson_progress).toHaveLength(1)
  })
})
