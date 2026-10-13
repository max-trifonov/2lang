import { defineStore } from 'pinia'
import { ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

// Проверка «знаю / не знаю» по языкам (LNG-S1-021): стор placement, ключ [profileId, lang].
// Хранит только завершение: где продолжать, считается по отметкам слов (word_status).

export interface PlacementRecord {
  profileId: string
  lang: string
  finishedAt: string
}

export interface PlacementRepository {
  list(profileId: string): Promise<PlacementRecord[]>
  put(record: PlacementRecord): Promise<void>
}

export function idbPlacementRepository(db: () => Promise<IDBDatabase>): PlacementRepository {
  const store = [STORES.placement]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx.objectStore(STORES.placement).index('profileId').getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as PlacementRecord[]
    },
    async put(record) {
      await transact(await db(), store, 'readwrite', (tx) => {
        tx.objectStore(STORES.placement).put({ ...record })
      })
    },
  }
}

export const usePlacementStore = defineStore('placement', () => {
  let repository: PlacementRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbPlacementRepository(appDb))

  const profileId = ref<string | null>(null)
  const finished = ref(new Set<string>())

  function configure(deps: { repository?: PlacementRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    finished.value = new Set()
    if (!id) return
    const list = await repo().list(id)
    if (profileId.value === id) finished.value = new Set(list.map((r) => r.lang))
  }

  const isFinished = (lang: string) => finished.value.has(lang)

  async function finish(lang: string): Promise<void> {
    const id = profileId.value
    if (!id || finished.value.has(lang)) return
    await repo().put({ profileId: id, lang, finishedAt: now().toISOString() })
    finished.value = new Set(finished.value).add(lang)
  }

  return { profileId, finished, configure, forProfile, isFinished, finish }
})
