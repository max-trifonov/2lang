import { STORES, transact } from '@/db'

import type { TextDoc } from './domain/types'

/** Текст в библиотеке устройства — общий для всех профилей (D-1 LNG-S1-003). */
export interface TextRecord {
  id: string
  doc: TextDoc
  addedAt: string
  updatedAt: string
  /** Профиль, загрузивший последнюю версию; null — неизвестно. */
  addedBy: string | null
}

export interface TextRepository {
  list(): Promise<TextRecord[]>
  /** Создаёт или заменяет текст с тем же id. */
  put(record: TextRecord): Promise<void>
}

export function idbTextRepository(db: () => Promise<IDBDatabase>): TextRepository {
  return {
    async list() {
      const req = await transact(await db(), [STORES.texts], 'readonly', (tx) =>
        tx.objectStore(STORES.texts).getAll(),
      )
      return req.result as TextRecord[]
    },
    async put(record) {
      // Текст — чистый JSON; копия снимает реактивные Proxy, которые IndexedDB не клонирует.
      const plain = JSON.parse(JSON.stringify(record)) as TextRecord
      await transact(await db(), [STORES.texts], 'readwrite', (tx) => {
        tx.objectStore(STORES.texts).put(plain)
      })
    },
  }
}
