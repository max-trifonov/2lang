// Формат текстов v1 (песни и стихи) — .flow/content-format.md, D-6.
// Двухбуквенный ключ в строке, фразе и слове — язык: ключ `lang` текста — оригинал,
// остальные — переводы.

export type LangCode = string

/** `{ "<язык>": "строка" }` */
export type Localized = Record<LangCode, string>

export const TEXT_KINDS = ['song', 'poem'] as const
export type TextKind = (typeof TEXT_KINDS)[number]

export const LICENSES = ['public-domain', 'own', 'personal'] as const
export type License = (typeof LICENSES)[number]

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type Level = (typeof LEVELS)[number]

export const STANZA_TYPES = ['verse', 'chorus', 'bridge', 'intro', 'outro'] as const
export type StanzaType = (typeof STANZA_TYPES)[number]

export const LINK_TYPES = ['youtube', 'audio', 'source'] as const
export type LinkType = (typeof LINK_TYPES)[number]

export const PARTS_OF_SPEECH = [
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
] as const
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number]

/** Расширения формата — единственное место, где незнакомые ключи не ошибка. */
export type Ext = Record<string, unknown>

export interface TextLink {
  type: LinkType
  url: string
}

// Двухбуквенные ключи — языки (строки), прочие поля — по формату. TypeScript не даёт
// смешать индексную сигнатуру `string` с полями-объектами, отсюда объединение в сигнатуре;
// оригинал и перевод узла читать через `textIn`.
type LangKeys<Extra> = { [lang: string]: string | Extra | undefined }

export type Phrase = LangKeys<Localized | Ext> & { note?: Localized; ext?: Ext }

export type Word = LangKeys<Ext> & { lemma?: string; pos?: PartOfSpeech; ext?: Ext }

export type Line = LangKeys<Localized | Phrase[] | Word[] | number | Ext> & {
  lit?: Localized
  phrases?: Phrase[]
  words?: Word[]
  note?: Localized
  t?: number
  ext?: Ext
}

/** Текст узла (строки, фразы, слова) на языке `lang`, если он есть. */
export function textIn(node: Line | Phrase | Word, lang: LangCode): string | undefined {
  const value = node[lang]
  return typeof value === 'string' ? value : undefined
}

interface StanzaBase {
  id?: string
  type?: StanzaType
  ext?: Ext
}

export type Stanza = (StanzaBase & { lines: Line[] }) | (StanzaBase & { ref: string })

export interface TextDoc {
  format: '2lang/text'
  version: 1
  id: string
  kind: TextKind
  lang: LangCode
  license: License
  title: Localized
  author?: string
  performer?: string
  year?: number
  level?: Level
  tags?: string[]
  links?: TextLink[]
  note?: Localized
  stanzas: Stanza[]
  ext?: Ext
}
