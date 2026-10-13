import 'fake-indexeddb/auto'

import { afterEach, describe, expect, it } from 'vitest'

import { openDb } from '@/db'

import type { Profile } from './domain/profile'
import { idbProfileRepository } from './storage'

const opened: IDBDatabase[] = []
let n = 0

/** Каждый тест — своя БД; `reopen` имитирует перезапуск приложения. */
function freshDb() {
  const name = `test-${++n}`
  const connect = async () => {
    const db = await openDb(name)
    opened.push(db)
    return db
  }
  let conn = connect()
  return {
    repo: () => idbProfileRepository(() => conn),
    reopen: async () => {
      ;(await conn).close()
      conn = connect()
    },
  }
}

afterEach(() => opened.splice(0).forEach((db) => db.close()))

const profile = (id: string, createdAt: string): Profile => ({
  id,
  name: id,
  color: 'blue',
  interfaceLocale: 'ru',
  languages: ['en', 'es'],
  dailyGoal: 2,
  createdAt,
})

describe('хранилище профилей на IndexedDB (К1)', () => {
  it('пустая БД — нет профилей и активного', async () => {
    expect(await freshDb().repo().load()).toEqual({ profiles: [], activeId: null })
  })

  it('профили и активный переживают перезапуск; порядок — по дате создания', async () => {
    const db = freshDb()
    await db.repo().save(profile('b', '2026-10-02T00:00:00Z'))
    await db.repo().save(profile('a', '2026-10-01T00:00:00Z'), true)
    await db.reopen()
    const { profiles, activeId } = await db.repo().load()
    expect(profiles.map((p) => p.id)).toEqual(['a', 'b'])
    expect(activeId).toBe('a')
  })

  it('save заменяет профиль с тем же id', async () => {
    const db = freshDb()
    await db.repo().save(profile('a', '2026-10-01T00:00:00Z'))
    await db.repo().save({ ...profile('a', '2026-10-01T00:00:00Z'), name: 'Анна', dailyGoal: 4 })
    const { profiles } = await db.repo().load()
    expect(profiles).toHaveLength(1)
    expect(profiles[0]).toMatchObject({ name: 'Анна', dailyGoal: 4 })
  })

  it('remove удаляет профиль и переставляет активный одной транзакцией', async () => {
    const db = freshDb()
    await db.repo().save(profile('a', '2026-10-01T00:00:00Z'), true)
    await db.repo().save(profile('b', '2026-10-02T00:00:00Z'))
    await db.repo().remove('a', 'b')
    await db.reopen()
    expect(await db.repo().load()).toMatchObject({ profiles: [{ id: 'b' }], activeId: 'b' })
    await db.repo().remove('b', null)
    expect(await db.repo().load()).toEqual({ profiles: [], activeId: null })
  })

  it('setActive запоминает выбор', async () => {
    const db = freshDb()
    await db.repo().save(profile('a', '2026-10-01T00:00:00Z'), true)
    await db.repo().save(profile('b', '2026-10-02T00:00:00Z'))
    await db.repo().setActive('b')
    await db.reopen()
    expect((await db.repo().load()).activeId).toBe('b')
  })
})

/** БД с будущим стором ученика `cards` — проверяем договорённость PROFILE_DATA_STORES. */
function dbWithCards() {
  const name = `cards-${++n}`
  const conn = new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open(name, 1)
    open.onupgradeneeded = () => {
      const db = open.result
      db.createObjectStore('profiles', { keyPath: 'id' })
      db.createObjectStore('meta')
      db.createObjectStore('cards', { keyPath: 'key' }).createIndex('profileId', 'profileId')
    }
    open.onsuccess = () => {
      opened.push(open.result)
      resolve(open.result)
    }
    open.onerror = () => reject(open.error)
  })
  return idbProfileRepository(() => conn, ['cards'])
}

const card = (profileId: string, key: string, due = 1) => ({ profileId, key, due })

describe('данные ученика: каскад, экспорт, восстановление (К1)', () => {
  async function seeded() {
    const repo = dbWithCards()
    await repo.save(profile('a', '2026-10-01T00:00:00Z'), true)
    await repo.save(profile('b', '2026-10-02T00:00:00Z'))
    await repo.restore(profile('a', '2026-10-01T00:00:00Z'), {
      cards: [card('a', 'a1'), card('a', 'a2')],
    })
    await repo.restore(profile('b', '2026-10-02T00:00:00Z'), { cards: [card('b', 'b1')] })
    return repo
  }

  it('экспорт отдаёт только записи профиля', async () => {
    const repo = await seeded()
    expect(await repo.exportData('a')).toEqual({ cards: [card('a', 'a1'), card('a', 'a2')] })
    expect(await repo.exportData('b')).toEqual({ cards: [card('b', 'b1')] })
  })

  it('восстановление заменяет данные профиля целиком и делает его активным', async () => {
    const repo = await seeded()
    await repo.restore(profile('a', '2026-10-01T00:00:00Z'), {
      cards: [card('a', 'a2', 9), card('a', 'a3')],
    })
    expect(await repo.exportData('a')).toEqual({ cards: [card('a', 'a2', 9), card('a', 'a3')] })
    expect(await repo.exportData('b')).toEqual({ cards: [card('b', 'b1')] })
    expect((await repo.load()).activeId).toBe('a')
  })

  it('удаление профиля удаляет и его данные, чужие остаются', async () => {
    const repo = await seeded()
    await repo.remove('a', 'b')
    expect(await repo.exportData('a')).toEqual({ cards: [] })
    expect(await repo.exportData('b')).toEqual({ cards: [card('b', 'b1')] })
  })
})
