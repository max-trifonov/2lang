import { describe, expect, it } from 'vitest'

import { phraseCardKey, songPhraseOfDay, textPhrases } from './phrases'
import type { TextDoc } from './types'

const doc: TextDoc = {
  format: '2lang/text',
  version: 1,
  id: 'song',
  kind: 'song',
  lang: 'es',
  license: 'own',
  title: { es: 'S' },
  stanzas: [
    {
      id: 'c',
      lines: [
        {
          es: 'Me quiero casar',
          phrases: [
            { es: 'Me quiero casar', en: 'I want to marry', ru: 'я хочу жениться' },
            { es: 'me quiero casar', ru: 'дубль' },
          ],
        },
        { es: 'sin frases' },
      ],
    },
    { ref: 'c' },
  ],
}

describe('phraseCardKey', () => {
  it('язык — вторым сегментом, регистр и знаки по краям не важны', () => {
    expect(phraseCardKey(doc, 'Me quiero casar!')).toBe('phrase:es:song:me quiero casar')
  })
})

describe('textPhrases', () => {
  it('перевод на язык интерфейса, повторы строфы и ключа не дублируются', () => {
    const list = textPhrases([doc], 'en')
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ translation: 'I want to marry', lang: 'es' })
  })
  it('запасной перевод — первый имеющийся', () => {
    expect(textPhrases([doc], 'ru')[0]!.translation).toBe('я хочу жениться')
  })
})

describe('songPhraseOfDay', () => {
  it('детерминирована, учитывает языки профиля', () => {
    const a = songPhraseOfDay([doc], ['es'], 'ru', 'p:2026-10-07')
    expect(a).toEqual(songPhraseOfDay([doc], ['es'], 'ru', 'p:2026-10-07'))
    expect(songPhraseOfDay([doc], ['en'], 'ru', 'p:2026-10-07')).toBeNull()
  })
})
