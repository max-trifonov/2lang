import type { TextDoc } from './domain/types'
import type { TextRecord } from './storage'

// Библиотека = тексты поставки (content/texts, D-5) + загруженные файлы (LNG-S1-026).
// Поставка — ленивыми чанками, как словарь (D-26); проверена в тестах контента.
const files = import.meta.glob<TextDoc>('../../../../content/texts/*.json', { import: 'default' })

let bundled: Promise<TextDoc[]> | null = null

export function loadBundledTexts(): Promise<TextDoc[]> {
  if (!bundled) {
    bundled = Promise.all(Object.values(files).map((load) => load()))
    bundled.catch(() => (bundled = null)) // сбой не запоминается навсегда
  }
  return bundled
}

export interface LibraryItem {
  doc: TextDoc
  source: 'bundled' | 'uploaded'
}

/** Загруженный файл с тем же id перекрывает поставку (обновление по id, D-17 LNG-S1-003). */
export function mergeLibrary(
  bundledDocs: readonly TextDoc[],
  uploaded: readonly TextRecord[],
): LibraryItem[] {
  const own = new Set(uploaded.map((r) => r.id))
  return [
    ...uploaded.map((r): LibraryItem => ({ doc: r.doc, source: 'uploaded' })),
    ...bundledDocs
      .filter((d) => !own.has(d.id))
      .map((doc): LibraryItem => ({ doc, source: 'bundled' })),
  ]
}

export interface LibraryFilter {
  lang?: string | undefined
  kind?: string | undefined
}

export function filterLibrary(items: readonly LibraryItem[], f: LibraryFilter): LibraryItem[] {
  return items.filter(
    (i) => (!f.lang || i.doc.lang === f.lang) && (!f.kind || i.doc.kind === f.kind),
  )
}
