export type SaveFileResult = 'shared' | 'downloaded' | 'cancelled'

/**
 * Отдать файл пользователю: «Поделиться» (Web Share API — «Сохранить в Файлы», облако,
 * мессенджер), иначе — скачивание. На телефоне `download` у ссылки в установленной PWA
 * ненадёжен, поэтому «Поделиться» — первым. Нативные сборки (Filesystem) — отдельно.
 */
export async function saveFile(
  name: string,
  content: string,
  type: string,
): Promise<SaveFileResult> {
  const file = new File([content], name, { type })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return 'shared'
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return 'cancelled'
      // Отказ платформы (нет жеста пользователя и т. п.) — пробуем скачивание.
    }
  }
  const url = URL.createObjectURL(file)
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded'
}
