import type { Entry } from './domain/types'

// Раскладка форм статьи для карточки (LNG-S1-015): времена ES — по лицам, прочее — подписанные
// формы. Местоимения лиц — данные языка, названия времён и форм — i18n `dictionary.forms.*`.

const ES_PERSONS = ['yo', 'tú', 'él / ella / usted', 'nosotros', 'vosotros', 'ellos / ustedes']
const ES_IMPERATIVE = ['tú', 'usted', 'nosotros', 'vosotros', 'ustedes']
const TENSE_ORDER = [
  'present',
  'preterite',
  'imperfect',
  'future',
  'conditional',
  'subjunctive',
  'imperative',
]
const SINGLE_ORDER = [
  's',
  'past',
  'participle',
  'ing',
  'gerund',
  'plural',
  'f',
  'pl',
  'fpl',
  'comparative',
  'superlative',
]

export interface TenseTable {
  key: string
  rows: { person: string; form: string }[]
}

export interface WordForms {
  tenses: TenseTable[]
  singles: { key: string; value: string }[]
}

export function wordForms(e: Pick<Entry, 'forms'>): WordForms {
  const forms = e.forms ?? {}
  const tenses = TENSE_ORDER.filter((k) => Array.isArray(forms[k])).map((key) => {
    const persons = key === 'imperative' ? ES_IMPERATIVE : ES_PERSONS
    const list = forms[key] as string[]
    return { key, rows: list.map((form, i) => ({ person: persons[i] ?? '', form })) }
  })
  const known = new Set([...TENSE_ORDER, ...SINGLE_ORDER])
  const singles = [
    ...SINGLE_ORDER.filter((k) => typeof forms[k] === 'string'),
    // Ключ, которого нет в порядке (новый в формате), — в конце, а не теряется.
    ...Object.keys(forms).filter((k) => !known.has(k) && typeof forms[k] === 'string'),
  ].map((key) => ({ key, value: forms[key] as string }))
  return { tenses, singles }
}
