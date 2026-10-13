import 'fake-indexeddb/auto'

import { describe, expect, it } from 'vitest'

import { DB_VERSION, STORES, openDb, request, transact } from './index'

// Данные учеников уже лежат в установленных PWA: миграция обязана их сохранить (К1).
describe('миграции БД', () => {
  it('v1 → текущая: профили и активный на месте, новые сторы созданы', async () => {
    const v1 = await openDb('migrate-1', 1)
    await transact(v1, [STORES.profiles, STORES.meta], 'readwrite', (tx) => {
      tx.objectStore(STORES.profiles).put({ id: 'p1', name: 'Анна' })
      tx.objectStore(STORES.meta).put('p1', 'activeProfileId')
    })
    v1.close()

    const db = await openDb('migrate-1')
    expect(db.version).toBe(DB_VERSION)
    expect([...db.objectStoreNames].sort()).toEqual([
      STORES.activity,
      STORES.cards,
      STORES.lessonProgress,
      STORES.meta,
      STORES.placement,
      STORES.profiles,
      STORES.savedWords,
      STORES.texts,
      STORES.wordStatus,
    ])
    const { profile, active } = await transact(
      db,
      [STORES.profiles, STORES.meta],
      'readonly',
      (tx) => ({
        profile: tx.objectStore(STORES.profiles).get('p1'),
        active: tx.objectStore(STORES.meta).get('activeProfileId'),
      }),
    )
    expect(profile.result).toEqual({ id: 'p1', name: 'Анна' })
    expect(active.result).toBe('p1')
    db.close()
  })

  it('v2 → текущая: тексты на месте, «мои слова» с индексом профиля', async () => {
    const v2 = await openDb('migrate-3', 2)
    await transact(v2, [STORES.texts], 'readwrite', (tx) => {
      tx.objectStore(STORES.texts).put({ id: 'song', doc: {} })
    })
    v2.close()
    const db = await openDb('migrate-3')
    const text = await transact(db, [STORES.texts], 'readonly', (tx) =>
      tx.objectStore(STORES.texts).get('song'),
    )
    expect(text.result).toEqual({ id: 'song', doc: {} })
    expect([
      ...db.transaction(STORES.savedWords).objectStore(STORES.savedWords).indexNames,
    ]).toEqual(['profileId'])
    db.close()
  })

  it('v3 → текущая: «мои слова» на месте, прохождения уроков с индексом профиля', async () => {
    const v3 = await openDb('migrate-4', 3)
    await transact(v3, [STORES.savedWords], 'readwrite', (tx) => {
      tx.objectStore(STORES.savedWords).put({ profileId: 'p1', key: 'word:es:tener' })
    })
    v3.close()
    const db = await openDb('migrate-4')
    const saved = await transact(db, [STORES.savedWords], 'readonly', (tx) =>
      tx.objectStore(STORES.savedWords).get(['p1', 'word:es:tener']),
    )
    expect(saved.result).toEqual({ profileId: 'p1', key: 'word:es:tener' })
    expect([
      ...db.transaction(STORES.lessonProgress).objectStore(STORES.lessonProgress).indexNames,
    ]).toEqual(['profileId'])
    db.close()
  })

  it('v4 → текущая: прохождения уроков на месте, статусы слов и проверка с индексом профиля', async () => {
    const v4 = await openDb('migrate-5', 4)
    await transact(v4, [STORES.lessonProgress], 'readwrite', (tx) => {
      tx.objectStore(STORES.lessonProgress).put({
        profileId: 'p1',
        key: 'lesson:es-travel-01',
        runs: 1,
      })
    })
    v4.close()
    const db = await openDb('migrate-5')
    const run = await transact(db, [STORES.lessonProgress], 'readonly', (tx) =>
      tx.objectStore(STORES.lessonProgress).get(['p1', 'lesson:es-travel-01']),
    )
    expect(run.result).toEqual({ profileId: 'p1', key: 'lesson:es-travel-01', runs: 1 })
    for (const store of [STORES.wordStatus, STORES.placement])
      expect([...db.transaction(store).objectStore(store).indexNames]).toEqual(['profileId'])
    db.close()
  })

  it('v5 → текущая: статусы слов на месте, карточки с индексом профиля', async () => {
    const v5 = await openDb('migrate-6', 5)
    await transact(v5, [STORES.wordStatus], 'readwrite', (tx) => {
      tx.objectStore(STORES.wordStatus).put({ profileId: 'p1', key: 'word:en:be', status: 'known' })
    })
    v5.close()
    const db = await openDb('migrate-6')
    const status = await transact(db, [STORES.wordStatus], 'readonly', (tx) =>
      tx.objectStore(STORES.wordStatus).get(['p1', 'word:en:be']),
    )
    expect(status.result).toMatchObject({ key: 'word:en:be', status: 'known' })
    expect([...db.transaction(STORES.cards).objectStore(STORES.cards).indexNames]).toEqual([
      'profileId',
    ])
    db.close()
  })

  it('v6 → текущая: карточки на месте, журнал активности с индексом профиля', async () => {
    const v6 = await openDb('migrate-7', 6)
    await transact(v6, [STORES.cards], 'readwrite', (tx) => {
      tx.objectStore(STORES.cards).put({ profileId: 'p1', key: 'word:es:tener', reps: 2 })
    })
    v6.close()
    const db = await openDb('migrate-7')
    const card = await transact(db, [STORES.cards], 'readonly', (tx) =>
      tx.objectStore(STORES.cards).get(['p1', 'word:es:tener']),
    )
    expect(card.result).toMatchObject({ reps: 2 })
    expect([...db.transaction(STORES.activity).objectStore(STORES.activity).indexNames]).toEqual([
      'profileId',
    ])
    db.close()
  })

  it('пустая установка получает все сторы сразу', async () => {
    const db = await openDb('migrate-2')
    expect([...db.objectStoreNames].sort()).toEqual([
      STORES.activity,
      STORES.cards,
      STORES.lessonProgress,
      STORES.meta,
      STORES.placement,
      STORES.profiles,
      STORES.savedWords,
      STORES.texts,
      STORES.wordStatus,
    ])
    expect(await request(db.transaction(STORES.texts).objectStore(STORES.texts).count())).toBe(0)
    db.close()
  })
})
