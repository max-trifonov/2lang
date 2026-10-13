import { describe, expect, it } from 'vitest'

import { onlineSpeechUrl, pickVoice } from './speech'

const v = (lang: string, name: string, localService = true) => ({ lang, name, localService })

describe('pickVoice', () => {
  it('регион по умолчанию, локальный голос выше сетевого', () => {
    const voices = [
      v('es-MX', 'Paulina'),
      v('es-ES', 'Google español', false),
      v('es-ES', 'Mónica'),
    ]
    expect(pickVoice(voices, 'es')?.name).toBe('Mónica')
  })

  it('нет региона по умолчанию — любой того же языка, локальный выше', () => {
    const voices = [v('en-GB', 'Online', false), v('en_AU', 'Karen'), v('es-ES', 'Mónica')]
    expect(pickVoice(voices, 'en')?.name).toBe('Karen')
  })

  it('нет голоса для языка — null (дальше онлайн-синтез)', () => {
    expect(pickVoice([v('ru-RU', 'Milena')], 'es')).toBeNull()
    expect(pickVoice([], 'en')).toBeNull()
  })
})

describe('onlineSpeechUrl', () => {
  it('язык и текст в параметрах, текст закодирован', () => {
    const url = new URL(onlineSpeechUrl(' ¿Qué tal? ', 'es')!)
    expect(url.searchParams.get('tl')).toBe('es')
    expect(url.searchParams.get('q')).toBe('¿Qué tal?')
  })

  it('пустой или слишком длинный текст — null', () => {
    expect(onlineSpeechUrl('  ', 'en')).toBeNull()
    expect(onlineSpeechUrl('a'.repeat(201), 'en')).toBeNull()
  })
})
