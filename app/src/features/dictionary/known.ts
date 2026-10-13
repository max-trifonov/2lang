import { defineStore } from 'pinia'
import { ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

// Знание слов ученика (LNG-S1-021, D-3): стор word_status, ключ [profileId, key = word:<lang>:<id>].
// Сейчас пишет быстрая проверка; BL-5 превратит статусы в карточки FSRS. Данные ученика (D-18).

export type WordStatus = 'known' | 'unknown'
export type WordStatusSource = 'placement'

export interface WordStatusRecord {
  profileId: string
  key: string
  status: WordStatus
  source: WordStatusSource
  at: string
}

export interface WordStatusRepository {
  list(profileId: string): Promise<WordStatusRecord[]>
  putMany(records: readonly WordStatusRecord[]): Promise<void>
}

export function idbWordStatusRepository(db: () => Promise<IDBDatabase>): WordStatusRepository {
  const store = [STORES.wordStatus]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx.objectStore(STORES.wordStatus).index('profileId').getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as WordStatusRecord[]
    },
    async putMany(records) {
      // Порция — одной транзакцией: либо вся, либо никакая (продолжение считается по сохранённому).
      await transact(await db(), store, 'readwrite', (tx) => {
        for (const r of records) tx.objectStore(STORES.wordStatus).put({ ...r })
      })
    },
  }
}

export const useWordStatusStore = defineStore('wordStatus', () => {
  let repository: WordStatusRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbWordStatusRepository(appDb))

  const profileId = ref<string | null>(null)
  const statuses = ref(new Map<string, WordStatus>())

  function configure(deps: { repository?: WordStatusRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    statuses.value = new Map()
    if (!id) return
    const list = await repo().list(id)
    // Профиль могли сменить, пока шло чтение — устаревший ответ не применяем.
    if (profileId.value === id) statuses.value = new Map(list.map((r) => [r.key, r.status]))
  }

  const status = (key: string) => statuses.value.get(key)
  const isKnown = (key: string) => statuses.value.get(key) === 'known'
  const knownKeys = () =>
    new Set([...statuses.value].flatMap(([k, s]) => (s === 'known' ? [k] : [])))
  /** Есть ли отметки по языку — проверка начата. */
  const hasAny = (lang: string) =>
    [...statuses.value.keys()].some((k) => k.startsWith(`word:${lang}:`))

  async function setMany(
    items: readonly { key: string; status: WordStatus }[],
    source: WordStatusSource,
  ): Promise<void> {
    const id = profileId.value
    if (!id || !items.length) return
    const at = now().toISOString()
    await repo().putMany(
      items.map((i) => ({ profileId: id, key: i.key, status: i.status, source, at })),
    )
    const next = new Map(statuses.value)
    for (const i of items) next.set(i.key, i.status)
    statuses.value = next
  }

  return { profileId, statuses, configure, forProfile, status, isKnown, knownKeys, hasAny, setMany }
})
