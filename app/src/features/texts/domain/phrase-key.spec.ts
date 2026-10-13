import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { normalizePhrase, phraseKey } from './phrase-key'

describe('phraseKey — ключ прогресса фразы (К1)', () => {
  it('не зависит от регистра, пробелов и пунктуации по краям', () => {
    const key = phraseKey('arroz', 'me quiero casar')
    expect(phraseKey('arroz', '  Me  quiero CASAR!  ')).toBe(key)
    expect(phraseKey('arroz', '¡me quiero casar,')).toBe(key)
    expect(phraseKey('arroz', '«me quiero casar»')).toBe(key)
  })

  it('не зависит от формы записи Unicode', () => {
    expect(phraseKey('t', 'mañana')).toBe(phraseKey('t', 'mañana'))
  })

  it('меняется от правки оригинала и от другого текста', () => {
    const key = phraseKey('arroz', 'me quiero casar')
    expect(phraseKey('arroz', 'me quiero ir')).not.toBe(key)
    expect(phraseKey('arroz', 'me quiero, casar')).not.toBe(key) // пунктуация внутри — часть фразы
    expect(phraseKey('other', 'me quiero casar')).not.toBe(key)
  })

  it('нормализация идемпотентна', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const once = normalizePhrase(s)
        expect(normalizePhrase(once)).toBe(once)
      }),
    )
  })

  it('регистр и обрамление пробелами/пунктуацией не меняют ключ', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zñáéíóú]+( [a-zñáéíóú]+)*$/),
        fc.constantFrom('', ' ', '  ', '¡', '¿', '«', '"', '...', ', '),
        fc.constantFrom('', ' ', '!', '?', '»', '.', '…', ','),
        (core, left, right) => {
          expect(phraseKey('t', left + core.toUpperCase() + right)).toBe(phraseKey('t', core))
        },
      ),
    )
  })

  it('разные по сути фразы не схлопываются', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]+( [a-z]+)*$/),
        fc.stringMatching(/^[a-z]+( [a-z]+)*$/),
        (a, b) => {
          fc.pre(a !== b)
          expect(phraseKey('t', a)).not.toBe(phraseKey('t', b))
        },
      ),
    )
  })

  it('id текста не склеивается с фразой двусмысленно', () => {
    expect(phraseKey('a-b', 'c')).not.toBe(phraseKey('a', 'b-c'))
  })
})
