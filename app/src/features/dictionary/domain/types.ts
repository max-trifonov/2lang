// Формат словаря v1 — .flow/dictionary-format.md, LNG-S1-007.

export const DICT_LICENSES = ['own', 'public-domain', 'cc0', 'cc-by', 'cc-by-sa'] as const
export type DictLicense = (typeof DICT_LICENSES)[number]

export const DICT_POS = [
  'verb',
  'noun',
  'adj',
  'adv',
  'pron',
  'prep',
  'conj',
  'det',
  'num',
  'intj',
  'phrase',
] as const
export type DictPos = (typeof DICT_POS)[number]

export const TOPICS = ['travel', 'it', 'daily'] as const
export type Topic = (typeof TOPICS)[number]

export const GENDERS = ['m', 'f', 'mf'] as const
export type Gender = (typeof GENDERS)[number]

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

/** ES: yo, tú, él/usted, nosotros, vosotros, ellos/ustedes. */
export const ES_PERSONS = 6
/** ES imperative: tú, usted, nosotros, vosotros, ustedes. */
export const ES_IMPERATIVE_PERSONS = 5

type FormSpec = { strings: readonly string[]; persons?: readonly string[]; imperative?: boolean }

/** Закрытый набор ключей форм на язык × часть речи (D-4). */
export const FORM_KEYS: Record<string, Partial<Record<DictPos, FormSpec>>> = {
  en: {
    verb: { strings: ['s', 'past', 'participle', 'ing'] },
    noun: { strings: ['plural'] },
    adj: { strings: ['comparative', 'superlative'] },
  },
  es: {
    verb: {
      strings: ['gerund', 'participle'],
      persons: ['present', 'preterite', 'imperfect', 'future', 'conditional', 'subjunctive'],
      imperative: true,
    },
    noun: { strings: ['plural'] },
    adj: { strings: ['f', 'pl', 'fpl'] },
  },
}

export type Localized = Record<string, string>

export type Example = { [lang: string]: string | undefined } & { topic: Topic }

export interface Entry {
  id: string
  lemma: string
  pos: DictPos
  rank: number
  irregular?: boolean
  gender?: Gender
  ipa?: string
  rules?: string[]
  translations: Localized
  pair?: string
  forms?: Record<string, string | string[]>
  topics?: Topic[]
  level?: (typeof LEVELS)[number]
  examples?: Example[]
  note?: Localized
  ext?: Record<string, unknown>
}

export interface DictionaryFile {
  format: '2lang/dictionary'
  version: 1
  lang: string
  license: DictLicense
  source?: string
  entries: Entry[]
  ext?: Record<string, unknown>
}

/** Ключ прогресса слова (D-1): id статьи не меняется никогда. */
export const wordKey = (lang: string, id: string) => `word:${lang}:${id}`
