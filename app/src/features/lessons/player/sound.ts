import type { Letter, SoundLesson } from '../domain/types'
import { shuffle, type Rng } from './blocks'

// Плеер урока звучания (LNG-S1-028): упражнения формата → задания.

export type SoundTask =
  | { kind: 'pairs'; heard: string; options: [string, string]; answer: string }
  | { kind: 'read'; word: string }
  | { kind: 'dictation'; word: string }
  | { kind: 'spell'; word: string; names: string[] }

/** Названия знаков, которые диктуют в адресах и кодах (D-1 LNG-S1-028). */
const SYMBOLS: Record<string, Record<string, string>> = {
  es: { '.': 'punto', '@': 'arroba', '-': 'guion', _: 'guion bajo' },
  en: { '.': 'dot', '@': 'at', '-': 'dash', _: 'underscore' },
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/**
 * Названия букв слова по порядку. Сначала точная буква алфавита (`ñ`), затем базовая без
 * диакритики (`í` → `i`); знаки — по таблице языка; пробел пропускается, прочее остаётся как есть.
 */
export function spellNames(word: string, letters: readonly Letter[], lang: string): string[] {
  const exact = new Map(letters.map((l) => [l.letter.normalize('NFC').toLowerCase(), l.name]))
  const base = new Map(letters.map((l) => [fold(l.letter), l.name]))
  const out: string[] = []
  for (const ch of word.normalize('NFC')) {
    if (/\s/u.test(ch)) continue
    const lower = ch.toLowerCase()
    out.push(exact.get(lower) ?? base.get(fold(ch)) ?? SYMBOLS[lang]?.[ch] ?? ch)
  }
  return out
}

/** Задания по упражнениям урока; `alphabet` — буквы языка, если в самом уроке их нет. */
export function buildSoundPractice(
  lesson: SoundLesson,
  alphabet: readonly Letter[],
  rng: Rng,
): SoundTask[] {
  const letters = lesson.letters?.length ? lesson.letters : alphabet
  return (lesson.exercises ?? []).flatMap((ex): SoundTask[] => {
    switch (ex.type) {
      case 'pairs':
        // Слышимое слово случайно из пары; варианты в случайном порядке.
        return ex.items.map(([a, b]) => {
          const [heard, other] = rng() < 0.5 ? [a, b] : [b, a]
          return {
            kind: 'pairs' as const,
            heard,
            answer: heard,
            options: shuffle([heard, other], rng) as [string, string],
          }
        })
      case 'read':
        return ex.items.map((word) => ({ kind: 'read' as const, word }))
      case 'dictation':
        return ex.items.map((word) => ({ kind: 'dictation' as const, word }))
      case 'spell':
        return ex.items.map((word) => ({
          kind: 'spell' as const,
          word,
          names: spellNames(word, letters, lesson.lang),
        }))
    }
  })
}

/** Уроки звучания языка по порядку (LNG-S1-028): раздел «Звучание» во вкладке «Уроки». */
export function soundLessons(
  lessons: readonly { kind: string; lang: string; order: number }[],
  lang: string,
) {
  return lessons
    .filter((l): l is SoundLesson => l.kind === 'sound' && l.lang === lang)
    .sort((a, b) => a.order - b.order)
}

/** Алфавит языка: буквы первого по порядку урока звучания, где они есть. */
export function alphabetOf(
  lessons: readonly { kind: string; lang: string; order: number }[],
  lang: string,
): Letter[] {
  return soundLessons(lessons, lang).find((l) => l.letters?.length)?.letters ?? []
}
