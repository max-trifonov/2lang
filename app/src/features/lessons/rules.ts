import type { Lesson, ReadingRule } from './domain/types'

// Правила чтения из уроков звучания (LNG-S1-016, D-21): подсказка в карточке слова.

export interface RuleHint extends ReadingRule {
  lang: string
  /** Тема программы курса урока, где правило вводится (ES-P3). */
  code?: string | undefined
}

/** id правила → правило; только уроки звучания своего языка. */
export function rulesIndex(lessons: readonly Lesson[], lang: string): Map<string, RuleHint> {
  const index = new Map<string, RuleHint>()
  for (const l of lessons) {
    if (l.kind !== 'sound' || l.lang !== lang) continue
    for (const r of l.rules ?? []) index.set(r.id, { ...r, lang: l.lang, code: l.code })
  }
  return index
}

/** Правила статьи в её порядке; неизвестные id пропускаются (AC-2). */
export function rulesFor(
  ids: readonly string[] | undefined,
  index: Map<string, RuleHint>,
): RuleHint[] {
  return (ids ?? []).flatMap((id) => {
    const rule = index.get(id)
    return rule ? [rule] : []
  })
}
