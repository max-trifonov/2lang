import { canSpeak, speak, type SpeechSource } from '@/shared/native'

// Записи слов словаря (LNG-S1-031, D-36): content/audio/words/<lang>/<ключ>.mp3, ключ —
// FNV-1a от нормализованного текста, как в content/audio/words/build.py. Файлы отдельные
// (не инлайн в бандл), сервис-воркер кладёт их в precache — звучат и офлайн.
const files = import.meta.glob<string>('../../../../content/audio/words/*/*.mp3', {
  query: '?no-inline',
  import: 'default',
  eager: true,
})

const byLang = new Map<string, Map<string, string>>()
for (const [path, url] of Object.entries(files)) {
  const [lang, file] = path.split('/').slice(-2) as [string, string]
  if (!byLang.has(lang)) byLang.set(lang, new Map())
  byLang.get(lang)!.set(file.replace(/\.mp3$/, ''), url)
}

/** Ключ записи: FNV-1a 32 по UTF-8 от текста без краевых пробелов, NFC, в нижнем регистре. */
export function audioKey(text: string): string {
  let h = 0x811c9dc5
  for (const b of new TextEncoder().encode(text.trim().normalize('NFC').toLowerCase())) {
    h = Math.imul(h ^ b, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function wordAudioUrl(text: string, lang: string): string | undefined {
  return byLang.get(lang)?.get(audioKey(text))
}

/** Слово точно прозвучит: есть записи языка или голос устройства (онлайн не в счёт). */
export async function canHearWords(lang: string): Promise<boolean> {
  return (byLang.get(lang)?.size ?? 0) > 0 || (await canSpeak(lang))
}

/** Озвучка текста: запись слова, если есть, затем голос устройства и онлайн. */
export function say(text: string, lang: string): Promise<SpeechSource> {
  return speak(text, lang, wordAudioUrl(text, lang))
}
