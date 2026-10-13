import type { DictionaryFile } from './domain/types'
import type { CatalogEntry } from './catalog'

// Словари — в сборке приложения (D-3 LNG-S1-014): чанк на файл, грузится при открытии
// языка; офлайн — из оболочки сервис-воркера. Проверены в тестах контента, здесь не валидируются.
const files = import.meta.glob<DictionaryFile>('../../../../content/dictionary/*.json', {
  import: 'default',
})

const cache = new Map<string, Promise<CatalogEntry[]>>()

export function loadLanguage(lang: string): Promise<CatalogEntry[]> {
  let loading = cache.get(lang)
  if (!loading) {
    const paths = Object.keys(files).filter((p) => p.split('/').pop()!.startsWith(`${lang}.`))
    loading = Promise.all(paths.map((p) => files[p]!())).then((docs) =>
      docs.flatMap((doc) => doc.entries.map((e) => ({ ...e, lang: doc.lang }))),
    )
    // Сбой загрузки чанка не должен запоминаться навсегда — повторная попытка грузит заново.
    loading.catch(() => cache.delete(lang))
    cache.set(lang, loading)
  }
  return loading
}
