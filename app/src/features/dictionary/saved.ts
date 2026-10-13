import { defineStore } from 'pinia'
import { ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

// «Мои слова» (LNG-S1-014, D-2): стор ученика saved_words, ключ [profileId, key].
// Попадает в резервную копию и удаляется с профилем через PROFILE_DATA_STORES (D-18).

export interface SavedWord {
  profileId: string
  key: string
  savedAt: string
}

export interface SavedWordsRepository {
  list(profileId: string): Promise<SavedWord[]>
  add(record: SavedWord): Promise<void>
  remove(profileId: string, key: string): Promise<void>
}

export function idbSavedWordsRepository(db: () => Promise<IDBDatabase>): SavedWordsRepository {
  const store = [STORES.savedWords]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx.objectStore(STORES.savedWords).index('profileId').getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as SavedWord[]
    },
    async add(record) {
      await transact(await db(), store, 'readwrite', (tx) => {
        tx.objectStore(STORES.savedWords).put({ ...record })
      })
    },
    async remove(profileId, key) {
      await transact(await db(), store, 'readwrite', (tx) => {
        tx.objectStore(STORES.savedWords).delete([profileId, key])
      })
    },
  }
}

export const useSavedWordsStore = defineStore('savedWords', () => {
  let repository: SavedWordsRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbSavedWordsRepository(appDb))

  const profileId = ref<string | null>(null)
  const keys = ref(new Set<string>())

  function configure(deps: { repository?: SavedWordsRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  /** Список активного профиля; при смене профиля — перечитать (звёздочки не переносятся). */
  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    keys.value = new Set()
    if (!id) return
    const list = await repo().list(id)
    // Профиль могли сменить, пока шло чтение — устаревший ответ не применяем.
    if (profileId.value === id) keys.value = new Set(list.map((r) => r.key))
  }

  const has = (key: string) => keys.value.has(key)

  async function toggle(key: string): Promise<void> {
    const id = profileId.value
    if (!id) return
    const next = new Set(keys.value)
    if (next.has(key)) {
      await repo().remove(id, key)
      next.delete(key)
    } else {
      await repo().add({ profileId: id, key, savedAt: now().toISOString() })
      next.add(key)
    }
    keys.value = next
  }

  return { profileId, keys, configure, forProfile, has, toggle }
})
