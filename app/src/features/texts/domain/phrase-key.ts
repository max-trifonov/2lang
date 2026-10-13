// Ключ прогресса фразы — «id текста + нормализованный оригинал» (content-format.md,
// «Обновление и прогресс»). Правка перевода ключ не трогает, правка оригинала даёт новую
// фразу. Меняется нормализация — меняются ключи у всех: прогресс пользователей теряется.

const EDGE_JUNK = /^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu

export function normalizePhrase(original: string): string {
  // NFC после toLowerCase тоже: строчная форма отдельных букв (İ) — не NFC.
  return original
    .normalize('NFC')
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(EDGE_JUNK, '')
}

export function phraseKey(textId: string, original: string): string {
  // id текста — slug без «:», так что разделитель однозначен.
  return `${textId}:${normalizePhrase(original)}`
}
