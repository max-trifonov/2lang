import { describe, expect, it } from 'vitest'

import type { Lesson, WordsLesson } from './domain/types'
import { phraseOfDay } from './phrase'

const w = (id: string, lang: string, phrase: WordsLesson['phrase']): WordsLesson => ({
  format: '2lang/lesson',
  version: 1,
  id,
  lang,
  kind: 'words',
  topic: 'travel',
  order: 1,
  title: { ru: id },
  words: [],
  phrase,
})

const lessons: Lesson[] = [
  w('es-1', 'es', { es: 'Tengo una reserva.', ru: 'У меня бронь.', en: 'I have a booking.' }),
  w('en-1', 'en', { en: 'Could you confirm?', ru: 'Подтвердите?', es: '¿Podría confirmar?' }),
  w('es-2', 'es', { es: 'Hola', ru: 'Привет' }),
]

describe('фраза дня (AC-5)', () => {
  it('только из пройденных уроков языков профиля', () => {
    expect(phraseOfDay(lessons, new Set(), ['es', 'en'], 'ru', 's')).toBeNull()
    expect(phraseOfDay(lessons, new Set(['es-1']), ['en'], 'ru', 's')).toBeNull()
    expect(phraseOfDay(lessons, new Set(['es-1']), ['es'], 'ru', 's')).toEqual({
      lang: 'es',
      text: 'Tengo una reserva.',
      translation: 'У меня бронь.',
      lessonId: 'es-1',
    })
  })

  it('перевод на языке интерфейса, иначе русский; язык фразы не годится как перевод', () => {
    expect(phraseOfDay(lessons, new Set(['es-1']), ['es'], 'en', 's')?.translation).toBe(
      'I have a booking.',
    )
    expect(phraseOfDay(lessons, new Set(['es-2']), ['es'], 'en', 's')?.translation).toBe('Привет')
    expect(phraseOfDay(lessons, new Set(['es-1']), ['es'], 'es', 's')?.translation).toBe(
      'У меня бронь.',
    )
  })

  it('одна и та же при одном seed, меняется между днями', () => {
    const done = new Set(['es-1', 'en-1', 'es-2'])
    const pick = (seed: string) => phraseOfDay(lessons, done, ['es', 'en'], 'ru', seed)?.lessonId
    expect(pick('p1:2026-10-02')).toBe(pick('p1:2026-10-02'))
    const seen = new Set(Array.from({ length: 12 }, (_, i) => pick(`p1:2026-10-${10 + i}`)))
    expect(seen.size).toBeGreaterThan(1)
  })
})
