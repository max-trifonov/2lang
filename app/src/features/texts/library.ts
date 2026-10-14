import { loadBundledTexts, mergeLibrary } from './catalog'
import type { TextDoc } from './domain/types'
import { useTextsStore } from './store'

// Все тексты ученика (D-42): поставка + загруженные на устройство; загруженный перекрывает
// поставку с тем же id. Одна точка для урока по песне, «Сегодня», вкладки «Уроки» и правил.
export async function libraryDocs(): Promise<TextDoc[]> {
  const texts = useTextsStore()
  const [, bundled] = await Promise.all([texts.ready(), loadBundledTexts()])
  return mergeLibrary(bundled, texts.texts).map((i) => i.doc)
}
