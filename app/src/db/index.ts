// Локальная БД приложения (LNG-S1-002, D-1): все данные ученика на устройстве.
// Схема меняется только здесь и только вперёд: новая версия = новая миграция в MIGRATIONS,
// старые не правятся — у пользователей они уже выполнены.

export const DB_NAME = 'twolang'

export const STORES = {
  profiles: 'profiles',
  /** Ключ-значение уровня устройства: активный профиль и т. п. */
  meta: 'meta',
  /** Библиотека текстов — общая для профилей устройства (LNG-S1-003). */
  texts: 'texts',
  /** «Мои слова» — данные ученика (LNG-S1-014): ключ [profileId, key]. */
  savedWords: 'saved_words',
  /** Прохождения уроков — данные ученика (LNG-S1-017): ключ [profileId, key]. */
  lessonProgress: 'lesson_progress',
  /** Знание слов ученика (LNG-S1-021): known / unknown, ключ [profileId, key]. */
  wordStatus: 'word_status',
  /** Быстрая проверка «знаю / не знаю» по языкам (LNG-S1-021): ключ [profileId, lang]. */
  placement: 'placement',
  /** Карточки интервального повторения (LNG-S1-023): ключ [profileId, key]. */
  cards: 'cards',
  /** Журнал активности по дням (LNG-S1-025): ключ [profileId, day]. */
  activity: 'activity',
} as const

/**
 * Сторы с данными ученика (D-16): у записи поле `profileId`, у стора — индекс `profileId`.
 * Стор из списка попадает в резервную копию профиля и удаляется вместе с профилем
 * (LNG-S1-006). Новый стор ученика = миграция с индексом + строка здесь.
 */
export const PROFILE_DATA_STORES: readonly string[] = [
  STORES.savedWords,
  STORES.lessonProgress,
  STORES.wordStatus,
  STORES.placement,
  STORES.cards,
  STORES.activity,
]
export const PROFILE_INDEX = 'profileId'

type Migration = (db: IDBDatabase) => void

const MIGRATIONS: Migration[] = [
  // v1
  (db) => {
    db.createObjectStore(STORES.profiles, { keyPath: 'id' })
    db.createObjectStore(STORES.meta)
  },
  // v2 — LNG-S1-003
  (db) => {
    db.createObjectStore(STORES.texts, { keyPath: 'id' })
  },
  // v3 — LNG-S1-014
  (db) => {
    db.createObjectStore(STORES.savedWords, { keyPath: ['profileId', 'key'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
  },
  // v4 — LNG-S1-017
  (db) => {
    db.createObjectStore(STORES.lessonProgress, { keyPath: ['profileId', 'key'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
  },
  // v5 — LNG-S1-021
  (db) => {
    db.createObjectStore(STORES.wordStatus, { keyPath: ['profileId', 'key'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
    db.createObjectStore(STORES.placement, { keyPath: ['profileId', 'lang'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
  },
  // v6 — LNG-S1-023
  (db) => {
    db.createObjectStore(STORES.cards, { keyPath: ['profileId', 'key'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
  },
  // v7 — LNG-S1-025
  (db) => {
    db.createObjectStore(STORES.activity, { keyPath: ['profileId', 'day'] }).createIndex(
      PROFILE_INDEX,
      'profileId',
    )
  },
]

export const DB_VERSION = MIGRATIONS.length

/** `version` ниже текущей — только для тестов миграций: открыть БД «прошлого выпуска». */
export function openDb(name = DB_NAME, version = DB_VERSION): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(name, version)
    open.onupgradeneeded = (event) => {
      for (let v = event.oldVersion; v < version; v++) MIGRATIONS[v]!(open.result)
    }
    open.onsuccess = () => {
      const db = open.result
      // Другая вкладка открыла новую версию — уступаем, иначе её миграция встанет.
      db.onversionchange = () => db.close()
      resolve(db)
    }
    open.onerror = () => reject(open.error)
    open.onblocked = () =>
      reject(new Error('IndexedDB: обновление схемы заблокировано другой вкладкой'))
  })
}

let shared: Promise<IDBDatabase> | null = null

/** Одно соединение на приложение. */
export function appDb(): Promise<IDBDatabase> {
  shared ??= openDb().catch((error: unknown) => {
    shared = null
    throw error
  })
  return shared
}

export function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Транзакция целиком: `work` ставит запросы синхронно, промис разрешается после commit.
 * Await внутри `work` между запросами нельзя — IndexedDB закроет транзакцию.
 */
export function transact<T>(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode)
    const result = work(tx)
    // События транзакции асинхронны — обработчики успевают и после постановки запросов.
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB: транзакция прервана'))
  })
}

/** Просим браузер не вычищать данные (PWA); отказ не ошибка — best-effort. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    /* нет Storage API — в нативной оболочке хранилище и так постоянное */
  }
}
