import { scramble, shuffle, splitBlocks, type Task } from '@/features/lessons'

import { expandStanzas, translationOf, type ReadStanza } from './read'
import { textIn, type TextDoc } from './types'

// Урок по песне (LNG-S1-035, D-42): разбор строф (строка, перевод, фразы с пояснениями,
// правила) → практика по фразам → фразы в повторение. Урок строится из самого текста,
// поэтому есть у любой песни библиотеки — и из поставки, и загруженной своей (D-5).

type Rng = () => number

/** id прохождения в сторе lesson_progress: `song:<id текста>` — не пересекается с уроками курса. */
export const songLessonId = (textId: string): string => `song:${textId}`

/** Строфы для разбора: каждая — один раз, повторы по `ref` пропускаются. */
export const songStanzas = (doc: TextDoc): ReadStanza[] =>
  expandStanzas(doc).filter((s) => !s.repeat && s.lines.length > 0)

interface SongPhrase {
  text: string
  translation: string
  line: string
  lineTranslation?: string
}

/** Фразы текста по порядку, без повторов; у каждой — перевод и строка, где она стоит. */
export function songPhrases(doc: TextDoc, locale: string): SongPhrase[] {
  const seen = new Set<string>()
  const out: SongPhrase[] = []
  for (const stanza of songStanzas(doc)) {
    for (const line of stanza.lines) {
      const lineText = textIn(line, doc.lang)
      if (!lineText) continue
      const lineTr = translationOf(line, doc.lang, locale)?.text
      for (const phrase of line.phrases ?? []) {
        const text = textIn(phrase, doc.lang)
        const tr = translationOf(phrase, doc.lang, locale)?.text
        const key = text?.toLowerCase()
        if (!text || !tr || !key || seen.has(key)) continue
        seen.add(key)
        out.push({
          text,
          translation: tr,
          line: lineText,
          ...(lineTr && { lineTranslation: lineTr }),
        })
      }
    }
  }
  return out
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Строка с пропуском на месте фразы (фраза входит в строку дословно без учёта регистра — D-6). */
export function gapLine(line: string, phrase: string): string | null {
  const re = new RegExp(escape(phrase), 'iu')
  return re.test(line) ? line.replace(re, '___') : null
}

/** Сколько фраз берёт практика: урок — несколько минут, остальное — в повторении. */
export const SONG_PRACTICE_PHRASES = 8

/**
 * Практика урока по песне: на фразу — «вставь фразу в строку» (варианты — другие фразы песни)
 * и, если в фразе больше одного слова, «собери фразу по переводу».
 */
export function buildSongPractice(
  doc: TextDoc,
  { locale, rng, max = SONG_PRACTICE_PHRASES }: { locale: string; rng: Rng; max?: number },
): Task[] {
  const all = songPhrases(doc, locale)
  const picked = all.slice(0, max)
  const tasks: Task[] = []
  for (const p of picked) {
    const sentence = gapLine(p.line, p.text)
    const others = shuffle(
      all.filter((o) => o.text.toLowerCase() !== p.text.toLowerCase()).map((o) => o.text),
      rng,
    ).slice(0, 2)
    if (sentence && others.length) {
      tasks.push({
        kind: 'choose',
        sentence,
        options: shuffle([p.text, ...others], rng),
        answer: p.text,
        ...(p.lineTranslation && { translation: p.lineTranslation }),
      })
    }
    const blocks = splitBlocks(p.text)
    if (blocks.length > 1) {
      tasks.push({
        kind: 'build',
        sentence: p.text,
        translation: p.translation,
        blocks: scramble(blocks, rng),
      })
    }
  }
  // Сначала все «вставь», потом «собери»: фраза встречается дважды не подряд.
  return [...tasks.filter((t) => t.kind === 'choose'), ...tasks.filter((t) => t.kind !== 'choose')]
}

/** Песни, где встречается тема грамматики (поле `see`). */
export const songsForRule = (docs: readonly TextDoc[], ruleId: string): TextDoc[] =>
  docs.filter((d) => d.see?.includes(ruleId))

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const levelRank = (d: TextDoc) => (d.level ? LEVEL_ORDER.indexOf(d.level) : LEVEL_ORDER.length)

/** Песни языка по порядку разбора: проще — раньше, внутри уровня — по названию. */
export function songsOf(docs: readonly TextDoc[], lang: string): TextDoc[] {
  return docs
    .filter((d) => d.lang === lang && d.kind === 'song')
    .sort(
      (a, b) =>
        levelRank(a) - levelRank(b) || (a.title[a.lang] ?? '').localeCompare(b.title[b.lang] ?? ''),
    )
}

/**
 * Песня для разбора (D-42): из непройденных — с наибольшим перевесом пройденных правил
 * (`see`) над непройденными; при равенстве — проще и раньше по названию. Новичку достаются
 * простые песни без правил, а дальше — песни, которые закрепляют пройденную грамматику.
 */
export function nextSong(
  docs: readonly TextDoc[],
  lang: string,
  done: ReadonlySet<string>,
): TextDoc | null {
  const open = songsOf(docs, lang).filter((d) => !done.has(songLessonId(d.id)))
  const fit = (d: TextDoc) => (d.see ?? []).reduce((sum, id) => sum + (done.has(id) ? 1 : -1), 0)
  return [...open].sort((a, b) => fit(b) - fit(a))[0] ?? null
}
