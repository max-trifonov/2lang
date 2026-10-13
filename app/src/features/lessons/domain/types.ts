// Формат урока v1 — .flow/lesson-format.md. Виды: `words` — LNG-S1-008, `sound` — LNG-S1-009,
// `grammar` — LNG-S1-010.

export const LESSON_KINDS = ['words', 'sound', 'grammar'] as const
export type LessonKind = (typeof LESSON_KINDS)[number]

/** Упражнения своего вида урока: у слов — «применить», у звучания — четыре механики. */
export const EXERCISE_TYPES = {
  words: ['fill', 'build', 'translate'],
  sound: ['pairs', 'read', 'dictation', 'spell'],
  grammar: ['transform', 'choose', 'fill', 'build', 'compose'],
} as const satisfies Record<LessonKind, readonly string[]>
export type ExerciseType = (typeof EXERCISE_TYPES)[LessonKind][number]

/** Формы «трансформера предложения» — виды предложений и времена (curriculum, D-1 LNG-S1-010). */
export const TRANSFORM_FORMS = [
  'negative',
  'question',
  'wh-question',
  'imperative',
  'polite',
  'past',
  'future',
] as const
export type TransformForm = (typeof TRANSFORM_FORMS)[number]

/** Отрезок линии времени (D-2 LNG-S1-010): рисует плеер. */
export const TIME_POINTS = ['past', 'now', 'future'] as const

/** Записанное аудио — путь от content/ (D-4 LNG-S1-009). */
export const AUDIO_RE = /^audio\/[a-z]{2}\/[a-z0-9_\-/]+\.(mp3|ogg|m4a)$/

/** Трек пути (D-1 LNG-S1-009): тема для урока слов, вид для прочих. */
export const trackOf = (lesson: { kind: LessonKind; topic?: string }) =>
  lesson.kind === 'words' ? (lesson.topic ?? '') : lesson.kind

/** Пропуск в упражнении `fill`. */
export const GAP = '___'

export const WORDS_MIN = 3
export const WORDS_MAX = 5

type LangText = { [lang: string]: string | undefined }

export type Phrase = LangText & { note?: Record<string, string> }

export interface Rule {
  text: Record<string, string>
  examples?: LangText[]
}

export type Exercise =
  | (LangText & { type: 'fill'; answer: string | string[] })
  | (LangText & { type: 'build'; extra?: string[] })
  | (LangText & { type: 'translate'; answer: string | string[] })

export interface LessonBase {
  format: '2lang/lesson'
  version: 1
  id: string
  lang: string
  kind: LessonKind
  topic?: string
  order: number
  code?: string
  title: Record<string, string>
  requires?: string[]
  level?: string
  ext?: Record<string, unknown>
}

export interface WordsLesson extends LessonBase {
  kind: 'words'
  topic: string
  words: string[]
  phrase: Phrase
  rule?: Rule
  exercises?: Exercise[]
}

export interface Letter {
  letter: string
  name: string
  ipa?: string
  audio?: string
}

export interface ReadingRule {
  id: string
  title: Record<string, string>
  text: Record<string, string>
  ipa?: string
  audio?: string
  examples: LangText[]
}

export type SoundExercise =
  | { type: 'pairs'; items: [string, string][] }
  | { type: 'read' | 'dictation' | 'spell'; items: string[] }

export interface SoundLesson extends LessonBase {
  kind: 'sound'
  letters?: Letter[]
  rules?: ReadingRule[]
  exercises?: SoundExercise[]
}

export interface GrammarRule {
  text: Record<string, string>
  formula?: string
  table?: { head: string[]; rows: string[][] }
  timeline?: {
    from: (typeof TIME_POINTS)[number]
    until?: (typeof TIME_POINTS)[number]
    label?: Record<string, string>
  }[]
}

export interface Bridge {
  lang: string
  formula?: string
  examples?: LangText[]
  note?: Record<string, string>
}

export type GrammarExercise =
  | (LangText & { type: 'transform'; into: { form: TransformForm; answer: string | string[] }[] })
  | (LangText & { type: 'choose'; options: string[]; answer: string })
  | (LangText & { type: 'fill'; answer: string | string[] })
  | (LangText & { type: 'build'; extra?: string[] })
  | {
      type: 'compose'
      prompt: Record<string, string>
      template?: string
      sample: string | string[]
    }

export interface GrammarLesson extends LessonBase {
  kind: 'grammar'
  /** Условие открытия темы — слова словаря (D-4 LNG-S1-010). */
  words?: string[]
  pattern: LangText[]
  rule: GrammarRule
  bridge?: Bridge[]
  exercises?: GrammarExercise[]
}

export type Lesson = WordsLesson | SoundLesson | GrammarLesson

/** Ключ прогресса урока (D-4): id урока не меняется. */
export const lessonKey = (id: string) => `lesson:${id}`
