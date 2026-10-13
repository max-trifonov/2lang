import { defineStore } from 'pinia'
import { ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

import { lessonKey } from './domain/types'

// Прохождения уроков (LNG-S1-017, D-5): стор ученика lesson_progress, ключ [profileId, key].
// Пишется только на итоге урока; в резервной копии и каскаде через PROFILE_DATA_STORES (D-18).

export interface LessonProgress {
  profileId: string
  /** lesson:<id> */
  key: string
  firstCompletedAt: string
  completedAt: string
  runs: number
  /** Лучшая доля верных с первого раза, 0…1. */
  bestScore: number
}

export interface LessonProgressRepository {
  list(profileId: string): Promise<LessonProgress[]>
  put(record: LessonProgress): Promise<void>
}

export function idbLessonProgressRepository(
  db: () => Promise<IDBDatabase>,
): LessonProgressRepository {
  const store = [STORES.lessonProgress]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx
          .objectStore(STORES.lessonProgress)
          .index('profileId')
          .getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as LessonProgress[]
    },
    async put(record) {
      await transact(await db(), store, 'readwrite', (tx) => {
        tx.objectStore(STORES.lessonProgress).put({ ...record })
      })
    },
  }
}

/** Новое прохождение поверх прежнего: первое не теряется, лучшая оценка — максимум. */
export function completeRun(
  prev: LessonProgress | undefined,
  base: { profileId: string; key: string },
  score: number,
  at: string,
): LessonProgress {
  return {
    ...base,
    firstCompletedAt: prev?.firstCompletedAt ?? at,
    completedAt: at,
    runs: (prev?.runs ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
  }
}

export const useLessonProgressStore = defineStore('lessonProgress', () => {
  let repository: LessonProgressRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbLessonProgressRepository(appDb))

  const profileId = ref<string | null>(null)
  const records = ref(new Map<string, LessonProgress>())

  function configure(deps: { repository?: LessonProgressRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    records.value = new Map()
    if (!id) return
    const list = await repo().list(id)
    // Профиль могли сменить, пока шло чтение — устаревший ответ не применяем.
    if (profileId.value === id) records.value = new Map(list.map((r) => [r.key, r]))
  }

  const get = (lessonId: string) => records.value.get(lessonKey(lessonId))

  /** id пройденных уроков активного профиля. */
  const doneIds = () => new Set([...records.value.keys()].map((k) => k.slice(lessonKey('').length)))

  async function complete(lessonId: string, score: number): Promise<LessonProgress | null> {
    const id = profileId.value
    if (!id) return null
    const key = lessonKey(lessonId)
    const record = completeRun(
      records.value.get(key),
      { profileId: id, key },
      score,
      now().toISOString(),
    )
    await repo().put(record)
    records.value = new Map(records.value).set(key, record)
    return record
  }

  return { profileId, records, configure, forProfile, get, doneIds, complete }
})
