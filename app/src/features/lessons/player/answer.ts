// Сверка ответа ученика (LNG-S1-017, D-3): регистр, пробелы и знаки по краям не важны;
// без ударения или тильды — засчитывается, но с подсказкой написания.

export type Verdict = 'exact' | 'accent' | 'wrong'

export interface Checked {
  verdict: Verdict
  /** Правильное написание: совпавший вариант или первый из допустимых. */
  expected: string
}

const EDGES = /^[\s\p{P}]+|[\s\p{P}]+$/gu

export function normalizeAnswer(s: string): string {
  return s.normalize('NFC').toLowerCase().replace(EDGES, '').replace(/\s+/g, ' ')
}

const bare = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC')

export function checkAnswer(input: string, accepted: string | readonly string[]): Checked {
  const variants = typeof accepted === 'string' ? [accepted] : accepted
  const given = normalizeAnswer(input)
  const exact = variants.find((v) => normalizeAnswer(v) === given)
  if (exact !== undefined && given) return { verdict: 'exact', expected: exact }
  const loose = variants.find((v) => bare(normalizeAnswer(v)) === bare(given))
  if (loose !== undefined && given) return { verdict: 'accent', expected: loose }
  return { verdict: 'wrong', expected: variants[0] ?? '' }
}
