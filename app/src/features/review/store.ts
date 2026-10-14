import { defineStore } from 'pinia'
import { ref } from 'vue'

import { STORES, appDb, transact } from '@/db'

import { isDue, knownCard, newCard, type Card } from './cards'

// Стор карточек повторения (LNG-S1-023): данные ученика (D-18), ключ [profileId, key].

export interface CardRepository {
  list(profileId: string): Promise<Card[]>
  putMany(cards: readonly Card[]): Promise<void>
}

export function idbCardRepository(db: () => Promise<IDBDatabase>): CardRepository {
  const store = [STORES.cards]
  return {
    async list(profileId) {
      const req = await transact(await db(), store, 'readonly', (tx) =>
        tx.objectStore(STORES.cards).index('profileId').getAll(IDBKeyRange.only(profileId)),
      )
      return req.result as Card[]
    },
    async putMany(cards) {
      await transact(await db(), store, 'readwrite', (tx) => {
        for (const c of cards) tx.objectStore(STORES.cards).put({ ...c })
      })
    },
  }
}

export const useCardsStore = defineStore('cards', () => {
  let repository: CardRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbCardRepository(appDb))

  const profileId = ref<string | null>(null)
  const cards = ref(new Map<string, Card>())

  function configure(deps: { repository?: CardRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  async function forProfile(id: string | null): Promise<void> {
    profileId.value = id
    cards.value = new Map()
    if (!id) return
    const list = await repo().list(id)
    // Профиль могли сменить, пока шло чтение — устаревший ответ не применяем.
    if (profileId.value === id) cards.value = new Map(list.map((c) => [c.key, c]))
  }

  const get = (key: string) => cards.value.get(key)

  /** Карточки к повторению сегодня: самые просроченные первыми (D-3). */
  function due(lang?: string): Card[] {
    const at = now()
    return [...cards.value.values()]
      .filter((c) => isDue(c, at) && (!lang || c.lang === lang))
      .sort((a, b) => a.due.localeCompare(b.due))
  }

  async function putMany(list: readonly Card[]): Promise<void> {
    if (!list.length) return
    await repo().putMany(list)
    const next = new Map(cards.value)
    for (const c of list) next.set(c.key, c)
    cards.value = next
  }

  /** Слова завершённого урока: карточка «новая» на завтра; существующая не меняется (AC-3). */
  async function addLessonWords(keys: readonly string[]): Promise<void> {
    const id = profileId.value
    if (!id) return
    const at = now()
    await putMany(keys.filter((k) => !cards.value.has(k)).map((k) => newCard(id, k, at)))
  }

  /** Фраза текста в повторение (LNG-S1-027): карточка «новая» на завтра; повторное добавление не меняет её. */
  const addPhrase = (key: string) => addLessonWords([key])

  /** Пройденные темы грамматики в повторение (D-40): «новая» на завтра; существующая не меняется. */
  const addGrammar = (keys: readonly string[]) => addLessonWords(keys)

  /** Известные слова проверки: редкое повторение; существующая карточка не меняется (AC-4). */
  async function addKnownWords(keys: readonly string[]): Promise<void> {
    const id = profileId.value
    if (!id) return
    const at = now()
    await putMany(keys.filter((k) => !cards.value.has(k)).map((k) => knownCard(id, k, at)))
  }

  return {
    profileId,
    cards,
    configure,
    forProfile,
    get,
    due,
    putMany,
    addLessonWords,
    addPhrase,
    addGrammar,
    addKnownWords,
  }
})
