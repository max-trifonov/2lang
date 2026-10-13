import type { Lesson } from './domain/types'

// Уроки — в сборке приложения, как словари (D-26): общий чанк на файл, офлайн через оболочку.
const files = import.meta.glob<Lesson>('../../../../content/lessons/*.json', { import: 'default' })

let loading: Promise<Lesson[]> | null = null

export function loadLessons(): Promise<Lesson[]> {
  loading ??= Promise.all(Object.values(files).map((load) => load())).catch((error: unknown) => {
    loading = null
    throw error
  })
  return loading
}
