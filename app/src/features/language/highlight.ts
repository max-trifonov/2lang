// Подсветка изучаемого слова в примере (LNG-S1-029): внимание на форме в контексте.

export interface Part {
  text: string
  hit: boolean
}

const key = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const WORD = /[\p{L}\p{M}'’-]+/gu
/** Короче — основа совпадает со слишком многим (ir, ser, be). */
const MIN_STEM = 4

/** Основа для неправильно образованных форм: booked ← book, reservé ← reservar. */
function stemOf(lemma: string): string | null {
  const k = key(lemma)
  if (k.includes(' ')) return null
  const stem =
    /(ar|er|ir|e)$/.test(k) && k.length > MIN_STEM + 1 ? k.replace(/(ar|er|ir|e)$/, '') : k
  return stem.length >= MIN_STEM ? stem : null
}

/**
 * Разбивает текст на части: слова, совпавшие с леммой, её формами (точно) или основой
 * (по началу слова), помечены `hit`. Части склеиваются в исходный текст без потерь.
 */
export function highlightParts(text: string, lemma: string, forms: readonly string[] = []): Part[] {
  // Формы из нескольких слов (more beautiful) пропускаем: иначе загорится каждое «more».
  const single = forms.flatMap((f) => f.split('/')).map((f) => f.trim())
  const exact = new Set(
    [...lemma.split(/\s+/), ...single.filter((f) => f && !/\s/.test(f))].map(key),
  )
  const stem = stemOf(lemma)
  const parts: Part[] = []
  let last = 0
  for (const m of text.matchAll(WORD)) {
    const word = key(m[0])
    const hit = exact.has(word) || (stem !== null && word.startsWith(stem))
    if (!hit) continue
    if (m.index > last) parts.push({ text: text.slice(last, m.index), hit: false })
    parts.push({ text: m[0], hit: true })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false })
  return parts
}

/** Плоский список форм статьи словаря: строки и массивы, варианты через « / ». */
export function formsOf(forms: Record<string, string | string[]> | undefined): string[] {
  return Object.values(forms ?? {}).flat()
}
