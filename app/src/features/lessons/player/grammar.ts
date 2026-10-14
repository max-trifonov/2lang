import type { GrammarLesson, TransformForm } from '../domain/types'
import { scramble, shuffle, splitBlocks, type Rng } from './blocks'
import type { Task } from './practice'

// Практика урока грамматики (LNG-S1-033, D-38): упражнения файла → задания плеера.
// Трансформер — по заданию на каждую форму, ответ собирается из блоков первого варианта
// (печатать целую фразу на телефоне долго, а блоки снимают спор о вариантах); сверка — со всеми.

export type GrammarTask = Extract<
  Task,
  { kind: 'fill' | 'build' | 'choose' | 'transform' | 'compose' }
>

const many = (a: string | string[]) => (typeof a === 'string' ? [a] : a)

/** Перевод упражнения на языке интерфейса, иначе русский; язык урока не подходит. */
function translated(item: Record<string, unknown>, lang: string, locale: string) {
  const pick = (k: string) => (k !== lang && typeof item[k] === 'string' ? item[k] : undefined)
  return pick(locale) ?? pick('ru')
}

const local = (m: Record<string, string>, locale: string) =>
  m[locale] ?? m.ru ?? Object.values(m)[0] ?? ''

export function buildGrammarPractice(
  lesson: GrammarLesson,
  { locale, rng }: { locale: string; rng: Rng },
): GrammarTask[] {
  const lang = lesson.lang
  return (lesson.exercises ?? []).flatMap((ex): GrammarTask[] => {
    if (ex.type === 'compose') {
      return [
        {
          kind: 'compose',
          prompt: local(ex.prompt, locale),
          ...(ex.template && { template: ex.template }),
          samples: many(ex.sample),
        },
      ]
    }
    const sentence = typeof ex[lang] === 'string' ? ex[lang] : undefined
    if (!sentence) return []
    const translation = translated(ex, lang, locale)
    const tr = translation ? { translation } : {}
    switch (ex.type) {
      case 'transform':
        return ex.into.map((t) => {
          const accepted = many(t.answer)
          return {
            kind: 'transform',
            source: sentence,
            form: t.form as TransformForm,
            accepted,
            blocks: scramble(splitBlocks(accepted[0] ?? ''), rng),
          }
        })
      case 'choose':
        return [
          { kind: 'choose', sentence, options: shuffle(ex.options, rng), answer: ex.answer, ...tr },
        ]
      case 'fill':
        return [{ kind: 'fill', sentence, accepted: many(ex.answer), ...tr }]
      case 'build':
        return [
          {
            kind: 'build',
            sentence,
            blocks: scramble([...splitBlocks(sentence), ...(ex.extra ?? [])], rng),
            ...tr,
          },
        ]
    }
  })
}

/** Уроки грамматики языка по порядку: раздел «Грамматика» во вкладке «Уроки». */
export function grammarLessons(
  lessons: readonly { kind: string; lang: string; order: number }[],
  lang: string,
) {
  return lessons
    .filter((l): l is GrammarLesson => l.kind === 'grammar' && l.lang === lang)
    .sort((a, b) => a.order - b.order)
}
