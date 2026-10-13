import { pickIndex } from '@/features/activity'

import { phraseKey } from './phrase-key'
import { expandStanzas, translationOf } from './read'
import { textIn, type TextDoc } from './types'

// Фразы текстов для повторения и «фразы дня» (LNG-S1-027). Карточка фразы живёт в сторе
// cards под ключом `phrase:<lang>:<id текста>:<нормализованный оригинал>` — язык вторым
// сегментом, как у слов, поэтому `langOfKey` работает без изменений.

export const phraseCardKey = (doc: Pick<TextDoc, 'id' | 'lang'>, original: string): string =>
  `phrase:${doc.lang}:${phraseKey(doc.id, original)}`

export interface TextPhrase {
  key: string
  lang: string
  textId: string
  text: string
  translation: string
}

/** Все фразы текстов с переводом на язык интерфейса (запасной — первый имеющийся); без повторов по ключу. */
export function textPhrases(docs: readonly TextDoc[], locale: string): TextPhrase[] {
  const seen = new Set<string>()
  const out: TextPhrase[] = []
  for (const doc of docs) {
    for (const stanza of expandStanzas(doc)) {
      if (stanza.repeat) continue
      for (const line of stanza.lines) {
        for (const phrase of line.phrases ?? []) {
          const text = textIn(phrase, doc.lang)
          const tr = translationOf(phrase, doc.lang, locale)
          if (!text || !tr) continue
          const key = phraseCardKey(doc, text)
          if (seen.has(key)) continue
          seen.add(key)
          out.push({ key, lang: doc.lang, textId: doc.id, text, translation: tr.text })
        }
      }
    }
  }
  return out
}

/** Фраза дня из песен и стихов: одна и та же в течение суток; только языки профиля. */
export function songPhraseOfDay(
  docs: readonly TextDoc[],
  langs: readonly string[],
  locale: string,
  seed: string,
): TextPhrase | null {
  const pool = textPhrases(
    docs.filter((d) => langs.includes(d.lang)),
    locale,
  ).sort((a, b) => a.key.localeCompare(b.key))
  return pool.length ? (pool[pickIndex(seed, pool.length)] ?? null) : null
}
