import {
  Checker,
  LANG_RE,
  fold,
  isObj,
  join,
  parseJson,
  type Issue,
  type Obj,
} from '@/features/content'

import {
  DICT_LICENSES,
  DICT_POS,
  ES_IMPERATIVE_PERSONS,
  ES_PERSONS,
  FORM_KEYS,
  GENDERS,
  LEVELS,
  TOPICS,
  type DictionaryFile,
} from './types'

// Проверка словаря v1 по .flow/dictionary-format.md: файл — структура и правила внутри
// файла; набор файлов — уникальность id и ранга между файлами языка и разрешение пар.

export interface DictCheckResult {
  file: DictionaryFile | null
  errors: Issue[]
  warnings: Issue[]
}

/** id статьи — ключ прогресса (D-1): строчные буквы любого алфавита, цифры, дефис. */
const WORD_ID_RE = /^[\p{Ll}\p{Lo}\p{N}]+(-[\p{Ll}\p{Lo}\p{N}]+)*$/u
const PAIR_RE = /^([a-z]{2}):(.+)$/
const RULE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const ROOT_REQUIRED = ['format', 'version', 'lang', 'license', 'entries']
const ROOT_KEYS = new Set([...ROOT_REQUIRED, 'source', 'ext'])
const ENTRY_REQUIRED = ['id', 'lemma', 'pos', 'rank', 'translations']
const ENTRY_KEYS = new Set([
  ...ENTRY_REQUIRED,
  'irregular',
  'gender',
  'ipa',
  'rules',
  'pair',
  'forms',
  'topics',
  'level',
  'examples',
  'note',
  'ext',
])
const EXAMPLE_KEYS = new Set(['topic', 'ext'])

export function checkDictionaryFile(source: string): DictCheckResult {
  const parsed = parseJson(source)
  if (!parsed.ok) return { file: null, errors: [parsed.issue], warnings: [] }
  return validateDictionary(parsed.value)
}

export function validateDictionary(raw: unknown): DictCheckResult {
  const v = new FileValidator()
  v.root(raw)
  return {
    file: v.errors.length === 0 ? (raw as DictionaryFile) : null,
    errors: v.errors,
    warnings: v.warnings,
  }
}

class FileValidator extends Checker {
  private lang = ''

  root(raw: unknown): void {
    if (!isObj(raw)) {
      this.error('not_object', '')
      return
    }
    this.keys(raw, '', ROOT_KEYS)
    this.required(raw, '', ROOT_REQUIRED)
    if ('format' in raw && raw.format !== '2lang/dictionary')
      this.error('bad_value', 'format', { allowed: '2lang/dictionary' })
    if ('version' in raw && raw.version !== 1) this.error('bad_value', 'version', { allowed: 1 })
    if ('lang' in raw && this.langCode(raw.lang, 'lang')) this.lang = raw.lang as string
    if ('license' in raw && this.oneOf(raw.license, 'license', DICT_LICENSES)) {
      // Атрибуция — условие лицензий CC BY*.
      if ((raw.license as string).startsWith('cc-by')) this.required(raw, '', ['source'])
    }
    if ('source' in raw) this.nonEmpty(raw.source, 'source')
    if ('ext' in raw) this.type(raw.ext, 'ext', 'object')
    const entries = 'entries' in raw ? this.list(raw.entries, 'entries') : null
    if (!entries) return
    if (entries.length === 0) this.error('empty', 'entries')

    const ids = new Map<string, number>()
    const ranks = new Map<string, number>()
    entries.forEach((entry, i) => {
      const path = join('entries', i)
      const e = this.entry(entry, path)
      if (!e) return
      if (typeof e.id === 'string' && WORD_ID_RE.test(e.id)) {
        const other = ids.get(e.id)
        if (other !== undefined)
          this.error('duplicate_id', join(path, 'id'), { id: e.id, other: join('entries', other) })
        else ids.set(e.id, i)
      }
      if (Number.isInteger(e.rank) && (e.rank as number) >= 1 && typeof e.pos === 'string') {
        const key = `${e.pos}:${e.rank}`
        const other = ranks.get(key)
        if (other !== undefined)
          this.error('duplicate_rank', join(path, 'rank'), {
            rank: e.rank as number,
            pos: e.pos,
            other: join('entries', other),
          })
        else ranks.set(key, i)
      }
    })
  }

  private entry(raw: unknown, path: string): Obj | null {
    if (!this.type(raw, path, 'object')) return null
    const e = raw as Obj
    this.keys(e, path, ENTRY_KEYS)
    this.required(e, path, ENTRY_REQUIRED)
    if (
      'id' in e &&
      this.type(e.id, join(path, 'id'), 'string') &&
      !WORD_ID_RE.test(e.id as string)
    )
      this.error('bad_word_id', join(path, 'id'))
    if ('lemma' in e) this.nonEmpty(e.lemma, join(path, 'lemma'))
    const posOk = 'pos' in e && this.oneOf(e.pos, join(path, 'pos'), DICT_POS)
    if ('rank' in e && this.type(e.rank, join(path, 'rank'), 'integer') && (e.rank as number) < 1)
      this.error('bad_value', join(path, 'rank'), { allowed: '≥ 1' })
    if ('irregular' in e) this.type(e.irregular, join(path, 'irregular'), 'boolean')
    if ('ipa' in e) this.nonEmpty(e.ipa, join(path, 'ipa'))
    if ('level' in e) this.oneOf(e.level, join(path, 'level'), LEVELS)
    if ('note' in e) this.localized(e.note, join(path, 'note'))
    if ('ext' in e) this.type(e.ext, join(path, 'ext'), 'object')
    if ('rules' in e) this.ruleIds(e.rules, join(path, 'rules'))
    if ('topics' in e) this.topics(e.topics, join(path, 'topics'))
    const trOk =
      'translations' in e && this.translations(e.translations, join(path, 'translations'))
    if ('pair' in e) this.pair(e.pair, join(path, 'pair'))

    const pos = posOk ? (e.pos as string) : ''
    if (posOk) this.gender(e, path, pos)
    if (posOk) this.forms(e, path, pos)
    this.examples(e, path)
    if (trOk && !('ru' in (e.translations as Obj))) this.warn('no_ru', join(path, 'translations'))
    return e
  }

  /** Род — только у существительного ES и там обязателен (D-5). */
  private gender(e: Obj, path: string, pos: string): void {
    const needs = this.lang === 'es' && pos === 'noun'
    if ('gender' in e) {
      if (!needs) this.error('gender_not_allowed', join(path, 'gender'))
      else this.oneOf(e.gender, join(path, 'gender'), GENDERS)
    } else if (needs) this.error('gender_required', path)
  }

  private forms(e: Obj, path: string, pos: string): void {
    const formsPath = join(path, 'forms')
    // Неправильный глагол EN без past/participle учить нельзя — их и учат.
    if (this.lang === 'en' && pos === 'verb' && e.irregular === true) {
      const forms = isObj(e.forms) ? e.forms : {}
      this.required(forms, formsPath, ['past', 'participle'])
    }
    if (!('forms' in e) || !this.type(e.forms, formsPath, 'object')) return
    const spec = FORM_KEYS[this.lang]?.[pos as keyof (typeof FORM_KEYS)['en']]
    if (!spec) {
      this.error('forms_not_allowed', formsPath, { pos })
      return
    }
    for (const [key, value] of Object.entries(e.forms as Obj)) {
      const p = join(formsPath, key)
      if (spec.strings.includes(key)) this.nonEmpty(value, p)
      else if (spec.persons?.includes(key)) this.persons(value, p, ES_PERSONS)
      else if (key === 'imperative' && spec.imperative)
        this.persons(value, p, ES_IMPERATIVE_PERSONS)
      else this.error('unknown_key', p, { key })
    }
  }

  private persons(value: unknown, path: string, expected: number): void {
    const list = this.list(value, path)
    if (!list) return
    if (list.length !== expected) {
      this.error('form_persons', path, { expected })
      return
    }
    list.forEach((form, i) => this.nonEmpty(form, join(path, i)))
  }

  private translations(value: unknown, path: string): boolean {
    if (!this.localized(value, path)) return false
    const keys = Object.keys(value as Obj)
    let ok = true
    if (keys.includes(this.lang)) ok = this.error('translation_own_lang', join(path, this.lang))
    if (!keys.some((k) => k !== this.lang)) ok = this.error('no_translation', path)
    return ok
  }

  private pair(value: unknown, path: string): void {
    if (!this.type(value, path, 'string')) return
    const m = PAIR_RE.exec(value as string)
    if (!m || m[1] === this.lang || !WORD_ID_RE.test(m[2]!))
      this.error('bad_pair', path, { pair: value as string })
  }

  private ruleIds(value: unknown, path: string): void {
    this.list(value, path)?.forEach((id, i) => {
      if (this.type(id, join(path, i), 'string') && !RULE_ID_RE.test(id as string))
        this.error('bad_slug', join(path, i))
    })
  }

  private topics(value: unknown, path: string): void {
    this.list(value, path)?.forEach((topic, i) => this.oneOf(topic, join(path, i), TOPICS))
  }

  private examples(e: Obj, path: string): void {
    const list = 'examples' in e ? this.list(e.examples, join(path, 'examples')) : []
    if (!list) return
    if (list.length === 0) {
      this.warn('no_examples', path)
      return
    }
    const words = wordForms(e)
    list.forEach((raw, i) => {
      const p = join(join(path, 'examples'), i)
      if (!this.type(raw, p, 'object')) return
      const ex = raw as Obj
      let ok = this.langKeys(ex, p, EXAMPLE_KEYS)
      ok = this.required(ex, p, ['topic']) && ok
      if ('topic' in ex) ok = this.oneOf(ex.topic, join(p, 'topic'), TOPICS) && ok
      if ('ext' in ex) ok = this.type(ex.ext, join(p, 'ext'), 'object') && ok
      if (!ok || !this.lang) return
      const original = ex[this.lang]
      if (typeof original !== 'string') {
        this.error('missing_original', p, { lang: this.lang })
        return
      }
      if (!Object.keys(ex).some((k) => LANG_RE.test(k) && k !== this.lang))
        this.error('no_translation', p)
      if (words.length > 0 && !words.some((w) => fold(original).includes(w)))
        this.warn('example_without_word', p, { word: String(e.lemma) })
    })
  }
}

/** Лемма и все формы статьи — для проверки «пример про это слово». */
function wordForms(e: Obj): string[] {
  const out: string[] = []
  if (typeof e.lemma === 'string') out.push(e.lemma)
  if (isObj(e.forms)) {
    for (const value of Object.values(e.forms)) {
      for (const form of Array.isArray(value) ? value : [value]) {
        if (typeof form === 'string') out.push(...form.split(' / '))
      }
    }
  }
  return out.filter(Boolean).map(fold)
}

export interface NamedDictionary {
  name: string
  file: DictionaryFile
}

/**
 * Перекрёстные правила набора (AC-3): id и ранг уникальны в языке между файлами,
 * пары разрешаются. Пути — `<файл> › entries[i]…`.
 */
export function validateDictionarySet(files: NamedDictionary[]): {
  errors: Issue[]
  warnings: Issue[]
} {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const ids = new Map<string, string>()
  const ranks = new Map<string, string>()
  const all = new Set(files.flatMap(({ file }) => file.entries.map((e) => `${file.lang}:${e.id}`)))

  for (const { name, file } of files) {
    file.entries.forEach((e, i) => {
      const at = (key: string) => `${name} › ${join(join('entries', i), key)}`
      const idKey = `${file.lang}:${e.id}`
      const rankKey = `${file.lang}:${e.pos}:${e.rank}`
      const idOwner = ids.get(idKey)
      if (idOwner === undefined) ids.set(idKey, name)
      else if (idOwner !== name)
        errors.push({
          severity: 'error',
          code: 'duplicate_id',
          path: at('id'),
          params: { id: e.id, other: idOwner },
        })
      const rankOwner = ranks.get(rankKey)
      if (rankOwner === undefined) ranks.set(rankKey, name)
      else if (rankOwner !== name)
        errors.push({
          severity: 'error',
          code: 'duplicate_rank',
          path: at('rank'),
          params: { rank: e.rank, pos: e.pos, other: rankOwner },
        })
      if (e.pair && !all.has(e.pair))
        warnings.push({
          severity: 'warning',
          code: 'pair_not_found',
          path: at('pair'),
          params: { pair: e.pair },
        })
    })
  }
  return { errors, warnings }
}
