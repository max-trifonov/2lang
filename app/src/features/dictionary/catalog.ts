import type { DictPos, Entry } from './domain/types'

// Каталог словаря для экрана (LNG-S1-014): списки по частям речи, поиск, артикль.

export const LISTS = ['verb', 'noun', 'adj', 'adv'] as const satisfies readonly DictPos[]
export type ListId = (typeof LISTS)[number]

export interface CatalogEntry extends Entry {
  lang: string
}

/** Ключ для поиска: без регистра, ударений и тильды (D-4: «ano» находит «año»). */
export function searchKey(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export function byList(entries: readonly CatalogEntry[], list: ListId): CatalogEntry[] {
  return entries.filter((e) => e.pos === list).sort((a, b) => a.rank - b.rank)
}

function forms(e: Entry): string[] {
  return Object.values(e.forms ?? {}).flatMap((v) =>
    (Array.isArray(v) ? v : [v]).flatMap((f) => f.split(' / ')),
  )
}

/**
 * Поиск по лемме, форме и переводу. Порядок: лемма совпала → лемма начинается с запроса →
 * форма совпала → перевод содержит; внутри — по рангу.
 */
export function search(entries: readonly CatalogEntry[], query: string): CatalogEntry[] {
  const q = searchKey(query)
  if (!q) return []
  const scored: { e: CatalogEntry; score: number }[] = []
  for (const e of entries) {
    const lemma = searchKey(e.lemma)
    let score = -1
    if (lemma === q) score = 0
    else if (lemma.startsWith(q)) score = 1
    else if (forms(e).some((f) => searchKey(f) === q)) score = 2
    else if (Object.values(e.translations).some((t) => searchKey(t).includes(q))) score = 3
    if (score >= 0) scored.push({ e, score })
  }
  return scored.sort((a, b) => a.score - b.score || a.e.rank - b.e.rank).map(({ e }) => e)
}

/** Женские на ударное a-/ha- берут el в ед. ч.: el agua, el arma (но las aguas). */
const EL_FEMININE = new Set([
  'agua',
  'arma',
  'alma',
  'área',
  'hambre',
  'aula',
  'águila',
  'hacha',
  'ala',
  'ama',
  'arpa',
  'habla',
])

/** Только множественное число: las gracias, las vacaciones, las gafas. */
const PLURAL_ONLY = new Set(['gracias', 'vacaciones', 'gafas', 'tijeras', 'afueras', 'esposas'])

/** Артикль испанского существительного для списка: el, la, el/la, los/las. */
export function article(e: Pick<Entry, 'lemma' | 'gender'>): string {
  if (PLURAL_ONLY.has(e.lemma) && e.gender) return e.gender === 'f' ? 'las' : 'los'
  if (e.gender === 'mf') return 'el/la'
  if (e.gender === 'f') return EL_FEMININE.has(e.lemma) ? 'el' : 'la'
  return e.gender === 'm' ? 'el' : ''
}

/** Ключ прогресса и «моих слов» (D-19). */
export const keyOf = (e: CatalogEntry) => `word:${e.lang}:${e.id}`
