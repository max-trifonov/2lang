import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

import { localDay, streak } from './domain'

// Журнал активности (LNG-S1-025): стор activity, запись на профиль и локальный день.

export interface ActivityDay {
  profileId: string
  /** YYYY-MM-DD, локальный. */
  day: string
  lessons: number
  reviews: number
}

export interface ActivityRepository {
  list(profileId: string): Promise<ActivityDay[]>
  put(record: ActivityDay): Promise<void>
}

export function idbActivityRepository(db: () => Promise<IDBDatabase>): ActivityRepository {
  const store = [STORES.activity]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx.objectStore(STORES.activity).index('profileId').getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as ActivityDay[]
    },
    async put(record) {
      await transact(await db(), store, 'readwrite', (tx) => {
        tx.objectStore(STORES.activity).put({ ...record })
      })
    },
  }
}

export const useActivityStore = defineStore('activity', () => {
  let repository: ActivityRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbActivityRepository(appDb))

  const profileId = ref<string | null>(null)
  const days = ref(new Map<string, ActivityDay>())

  function configure(deps: { repository?: ActivityRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    days.value = new Map()
    if (!id) return
    const list = await repo().list(id)
    // Профиль могли сменить, пока шло чтение — устаревший ответ не применяем.
    if (profileId.value === id) days.value = new Map(list.map((d) => [d.day, d]))
  }

  /** Записи за день идут последовательно: две подряд не должны затереть счётчик друг друга. */
  let chain: Promise<void> = Promise.resolve()

  function record(kind: 'lesson' | 'review'): Promise<void> {
    const run = chain.then(async () => {
      const id = profileId.value
      if (!id) return
      const day = localDay(now())
      const prev = days.value.get(day) ?? { profileId: id, day, lessons: 0, reviews: 0 }
      const next: ActivityDay = {
        ...prev,
        lessons: prev.lessons + (kind === 'lesson' ? 1 : 0),
        reviews: prev.reviews + (kind === 'review' ? 1 : 0),
      }
      await repo().put(next)
      days.value = new Map(days.value).set(day, next)
    })
    chain = run.catch(() => undefined)
    return run
  }

  /** Сегодняшние счётчики. */
  const today = computed(() => days.value.get(localDay(now())) ?? { lessons: 0, reviews: 0 })
  const streakInfo = computed(() => {
    const active = new Set(
      [...days.value.values()].filter((d) => d.lessons + d.reviews > 0).map((d) => d.day),
    )
    return streak(active, localDay(now()))
  })

  return { profileId, days, configure, forProfile, record, today, streakInfo }
})
