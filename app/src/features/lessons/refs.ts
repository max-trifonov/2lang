import {
  GRAMMAR_SECTIONS,
  type GrammarLesson,
  type GrammarSection,
  type Lesson,
} from './domain/types'

// Отсылки к правилам (LNG-S1-033, D-38): из урока — к темам грамматики, из темы — к связанным
// темам, к той же теме другого языка (мост) и обратно к урокам слов, где правило встречается.

/** Экран урока по виду: слова, звучание, грамматика. */
export function lessonRoute(lesson: Pick<Lesson, 'id' | 'kind'>): string {
  if (lesson.kind === 'sound') return `/sounds/${lesson.id}`
  if (lesson.kind === 'grammar') return `/grammar/${lesson.id}`
  return `/lessons/${lesson.id}`
}

/** Карточка правила в справочнике. */
export const ruleRoute = (id: string) => `/rules/${id}`

const isGrammar = (l: Lesson | undefined): l is GrammarLesson => l?.kind === 'grammar'

/** Темы грамматики по id в их порядке; неизвестные и не-грамматика пропускаются. */
export function grammarRefs(
  ids: readonly string[] | undefined,
  lessons: readonly Lesson[],
): GrammarLesson[] {
  const byId = new Map(lessons.map((l) => [l.id, l]))
  return (ids ?? []).map((id) => byId.get(id)).filter(isGrammar)
}

/** Уроки, которые ссылаются на тему (`see`) — «где встречается правило». */
export function backlinks(id: string, lessons: readonly Lesson[]): Lesson[] {
  return lessons.filter((l) => l.see?.includes(id))
}

/** Темы грамматики языка, где слово — условие открытия (карточка слова). */
export function grammarForWord(
  lessons: readonly Lesson[],
  lang: string,
  wordId: string,
): GrammarLesson[] {
  return lessons
    .filter(
      (l): l is GrammarLesson => isGrammar(l) && l.lang === lang && !!l.words?.includes(wordId),
    )
    .sort((a, b) => a.order - b.order)
}

export interface GrammarGroup {
  section: GrammarSection | 'other'
  lessons: GrammarLesson[]
}

/** Справочник: темы языка по разделам в порядке GRAMMAR_SECTIONS, внутри — по order. */
export function grammarSections(lessons: readonly Lesson[], lang: string): GrammarGroup[] {
  const all = lessons
    .filter((l): l is GrammarLesson => isGrammar(l) && l.lang === lang)
    .sort((a, b) => a.order - b.order)
  const groups: GrammarGroup[] = GRAMMAR_SECTIONS.map((section) => ({
    section,
    lessons: all.filter((l) => l.section === section),
  }))
  groups.push({ section: 'other', lessons: all.filter((l) => !l.section) })
  return groups.filter((g) => g.lessons.length > 0)
}

/** Отрезок текста: простой текст или код темы программы (EN-19, ES-P3) со ссылкой. */
export type CodeSegment = { text: string } | { text: string; id: string; route: string }

const CODE_RE = /\b(EN|ES)-(P?)(\d{1,2})\b/g

/** id урока по коду программы: EN-19 → en-grammar-19, ES-P3 → es-sound-03 (D-47). */
export function codeLessonId(code: string): string | null {
  const m = /^(EN|ES)-(P?)(\d{1,2})$/.exec(code)
  if (!m) return null
  const kind = m[2] ? 'sound' : 'grammar'
  return `${m[1]!.toLowerCase()}-${kind}-${m[3]!.padStart(2, '0')}`
}

/**
 * Пояснения в контенте ссылаются на темы кодами программы — «Past Simple (EN-19)».
 * Делит текст на куски; код известного урока становится ссылкой (D-47).
 */
export function splitCodes(text: string, known: ReadonlySet<string>): CodeSegment[] {
  const out: CodeSegment[] = []
  let last = 0
  for (const m of text.matchAll(CODE_RE)) {
    const id = codeLessonId(m[0])
    if (!id || !known.has(id)) continue
    if (m.index > last) out.push({ text: text.slice(last, m.index) })
    out.push({
      text: m[0],
      id,
      route: id.includes('-sound-') ? `/sounds/${id}` : ruleRoute(id),
    })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}
