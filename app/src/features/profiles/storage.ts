import { PROFILE_DATA_STORES, PROFILE_INDEX, STORES, transact } from '@/db'

import type { BackupData } from './backup/format'
import type { Profile } from './domain/profile'

/** Порт хранилища профилей: стор не знает про IndexedDB. */
export interface ProfileRepository {
  load(): Promise<{ profiles: Profile[]; activeId: string | null }>
  /** Создаёт или заменяет профиль; `activate` — сделать его активным в той же транзакции. */
  save(profile: Profile, activate?: boolean): Promise<void>
  /**
   * Удаление профиля вместе с его данными и смена активного — одной транзакцией:
   * иначе активный укажет в пустоту, а данные ученика останутся сиротами.
   */
  remove(id: string, nextActiveId: string | null): Promise<void>
  setActive(id: string): Promise<void>
  /** Данные ученика по сторам — для резервной копии. */
  exportData(profileId: string): Promise<BackupData>
  /** Восстановление из копии: прежние данные профиля заменяются целиком, одной транзакцией. */
  restore(profile: Profile, data: BackupData): Promise<void>
}

const ACTIVE_KEY = 'activeProfileId'

/** `dataStores` подменяется только в тестах — сторы ученика появятся с BL-5. */
export function idbProfileRepository(
  db: () => Promise<IDBDatabase>,
  dataStores: readonly string[] = PROFILE_DATA_STORES,
): ProfileRepository {
  const both = [STORES.profiles, STORES.meta]
  const all = [...both, ...dataStores]

  /**
   * Удалить записи профиля во всех сторах ученика, затем (`then`) — записать новые.
   * Запись строго после удаления: курсор, идущий параллельно с put, снёс бы и новые записи.
   */
  function purge(
    tx: IDBTransaction,
    profileId: string,
    then: (store: IDBObjectStore) => void = () => {},
  ): void {
    for (const name of dataStores) {
      const store = tx.objectStore(name)
      store.index(PROFILE_INDEX).getAllKeys(IDBKeyRange.only(profileId)).onsuccess = (event) => {
        for (const key of (event.target as IDBRequest<IDBValidKey[]>).result) store.delete(key)
        then(store)
      }
    }
  }

  return {
    async load() {
      const { profiles, active } = await transact(await db(), both, 'readonly', (tx) => ({
        profiles: tx.objectStore(STORES.profiles).getAll() as IDBRequest<Profile[]>,
        active: tx.objectStore(STORES.meta).get(ACTIVE_KEY) as IDBRequest<string | undefined>,
      }))
      // После commit результаты запросов уже на месте.
      const list = [...profiles.result].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      return { profiles: list, activeId: active.result ?? null }
    },
    async save(profile, activate = false) {
      await transact(await db(), both, 'readwrite', (tx) => {
        tx.objectStore(STORES.profiles).put(plain(profile))
        if (activate) tx.objectStore(STORES.meta).put(profile.id, ACTIVE_KEY)
      })
    },
    async remove(id, nextActiveId) {
      await transact(await db(), all, 'readwrite', (tx) => {
        purge(tx, id)
        tx.objectStore(STORES.profiles).delete(id)
        const meta = tx.objectStore(STORES.meta)
        if (nextActiveId) meta.put(nextActiveId, ACTIVE_KEY)
        else meta.delete(ACTIVE_KEY)
      })
    },
    async setActive(id) {
      await transact(await db(), [STORES.meta], 'readwrite', (tx) => {
        tx.objectStore(STORES.meta).put(id, ACTIVE_KEY)
      })
    },
    async exportData(profileId) {
      if (dataStores.length === 0) return {}
      const reqs = await transact(await db(), [...dataStores], 'readonly', (tx) =>
        dataStores.map((name) => {
          const index = tx.objectStore(name).index(PROFILE_INDEX)
          return [name, index.getAll(IDBKeyRange.only(profileId))] as const
        }),
      )
      return Object.fromEntries(reqs.map(([name, req]) => [name, req.result]))
    },
    async restore(profile, data) {
      await transact(await db(), all, 'readwrite', (tx) => {
        tx.objectStore(STORES.profiles).put(plain(profile))
        tx.objectStore(STORES.meta).put(profile.id, ACTIVE_KEY)
        purge(tx, profile.id, (store) => {
          for (const record of data[store.name] ?? []) store.put(record)
        })
      })
    },
  }
}

/** Из реактивного стора приходит Proxy — structured clone в IndexedDB его не берёт. */
function plain(profile: Profile): Profile {
  return { ...profile, languages: [...profile.languages] }
}
