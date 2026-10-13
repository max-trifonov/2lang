import { wordAudioUrl } from '@/features/dictionary'
import { speak, type SpeechSource } from '@/shared/native'

// Звук урока звучания (LNG-S1-028, D-13): записанный файл `audio` из content/audio/, если он
// попал в сборку, иначе запись слова словаря и дальше цепочка speak (D-36). Записи звуков и
// букв — отдельная задача BL-18. Записи слов (audio/words) — свой модуль в словаре.
const files = import.meta.glob<string>(
  ['../../../../content/audio/**/*.{mp3,ogg,m4a}', '!../../../../content/audio/words/**'],
  { query: '?url', import: 'default', eager: true },
)

/** `audio/es/sounds/theta.mp3` (путь от content/) → URL в сборке; нет файла — undefined. */
export function audioUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return files[`../../../../content/${path}`]
}

export function playSound(
  audio: string | undefined,
  text: string,
  lang: string,
): Promise<SpeechSource> {
  return speak(text, lang, audioUrl(audio) ?? wordAudioUrl(text, lang))
}
