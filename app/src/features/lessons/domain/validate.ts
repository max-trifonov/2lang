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
import { TOPICS, type DictionaryFile, type Entry } from '@/features/dictionary'

import {
  AUDIO_RE,
  EXERCISE_TYPES,
  GAP,
  GRAMMAR_SECTIONS,
  LESSON_KINDS,
  TIME_POINTS,
  TRANSFORM_FORMS,
  WORDS_MAX,
  WORDS_MIN,
  trackOf,
  type Lesson,
  type LessonKind,
} from './types'

// Проверка урока v1 по .flow/lesson-format.md: файл — структура и правила внутри урока;
// набор — уникальность id, места в треке и id правил чтения, предпосылки, слова в словаре,
// состав урока, ссылки словаря на правила чтения.

export interface LessonCheckResult {
  lesson: Lesson | null
  errors: Issue[]
  warnings: Issue[]
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
/** Тема программы курса: ES-P3, EN-7. */
const CODE_RE = /^[A-Z]{2}-[A-Z]?\d+$/
const HEAD_REQUIRED = ['format', 'version', 'id', 'lang', 'kind', 'order', 'title']
const HEAD_KEYS = [...HEAD_REQUIRED, 'topic', 'code', 'requires', 'level', 'see', 'ext']
const WORDS_REQUIRED = ['words', 'phrase']
const BODY_KEYS: Record<LessonKind, readonly string[]> = {
  words: [...WORDS_REQUIRED, 'rule', 'exercises'],
  sound: ['letters', 'rules', 'exercises'],
  grammar: ['section', 'words', 'pattern', 'rule', 'bridge', 'exercises'],
}
const PHRASE_KEYS = new Set(['note', 'ext'])
const RULE_KEYS = new Set(['text', 'examples', 'ext'])
const EXAMPLE_KEYS = new Set(['ext'])
/** Поля упражнения по типу; незнакомый тип — все поля, чтобы не было каскада. */
const EXERCISE_FIELDS: Record<string, readonly string[]> = {
  fill: ['answer'],
  build: ['extra'],
  translate: ['answer'],
  transform: ['into'],
  choose: ['options', 'answer'],
  compose: ['prompt', 'template', 'sample'],
}
const TRANSFORM_KEYS = new Set(['form', 'answer'])
const GRAMMAR_RULE_KEYS = new Set(['text', 'formula', 'table', 'timeline', 'ext'])
const TABLE_KEYS = new Set(['head', 'rows'])
const TIMELINE_KEYS = new Set(['from', 'until', 'label'])
const BRIDGE_KEYS = new Set(['lang', 'lesson', 'formula', 'examples', 'note', 'ext'])
const PATTERN_MIN = 3
const PATTERN_MAX = 4
const SOUND_EXERCISE_KEYS = new Set(['type', 'items', 'ext'])
const LETTER_KEYS = new Set(['letter', 'name', 'ipa', 'audio', 'ext'])
const READING_RULE_KEYS = new Set(['id', 'title', 'text', 'ipa', 'audio', 'examples', 'ext'])

export function checkLessonFile(source: string): LessonCheckResult {
  const parsed = parseJson(source)
  if (!parsed.ok) return { lesson: null, errors: [parsed.issue], warnings: [] }
  return validateLesson(parsed.value)
}

export function validateLesson(raw: unknown): LessonCheckResult {
  const v = new LessonValidator()
  v.root(raw)
  return {
    lesson: v.errors.length === 0 ? (raw as Lesson) : null,
    errors: v.errors,
    warnings: v.warnings,
  }
}

class LessonValidator extends Checker {
  private lang = ''

  root(raw: unknown): void {
    if (!isObj(raw)) {
      this.error('not_object', '')
      return
    }
    const kind =
      'kind' in raw && this.oneOf(raw.kind, 'kind', LESSON_KINDS) ? (raw.kind as LessonKind) : null
    // Незнакомый вид — ключи всех видов, чтобы не было каскада unknown_key по телу.
    const body = kind ? BODY_KEYS[kind] : Object.values(BODY_KEYS).flat()
    this.keys(raw, '', new Set([...HEAD_KEYS, ...body]))
    this.required(raw, '', HEAD_REQUIRED)
    if ('format' in raw && raw.format !== '2lang/lesson')
      this.error('bad_value', 'format', { allowed: '2lang/lesson' })
    if ('version' in raw && raw.version !== 1) this.error('bad_value', 'version', { allowed: 1 })
    if ('id' in raw) this.slug(raw.id, 'id')
    if ('lang' in raw && this.langCode(raw.lang, 'lang')) this.lang = raw.lang as string
    // Тема — только у урока слов: у звучания и грамматики трек пути = вид (D-1 LNG-S1-009).
    if (kind === 'words') this.required(raw, '', ['topic'])
    if ('topic' in raw) {
      if (kind && kind !== 'words') this.error('topic_not_allowed', 'topic', { kind })
      else this.oneOf(raw.topic, 'topic', TOPICS)
    }
    if ('code' in raw && this.type(raw.code, 'code', 'string') && !CODE_RE.test(raw.code as string))
      this.error('bad_value', 'code', { allowed: 'ES-P3, EN-7' })
    if ('order' in raw && this.type(raw.order, 'order', 'integer') && (raw.order as number) < 1)
      this.error('bad_value', 'order', { allowed: '≥ 1' })
    if ('title' in raw) this.localized(raw.title, 'title')
    if ('level' in raw) this.oneOf(raw.level, 'level', LEVELS)
    if ('ext' in raw) this.type(raw.ext, 'ext', 'object')
    if ('requires' in raw) this.requires(raw.requires, raw.id)
    if ('see' in raw) this.see(raw.see, raw.id)
    if (kind === 'words') this.words(raw)
    if (kind === 'sound') this.sound(raw)
    if (kind === 'grammar') this.grammar(raw)
  }

  private requires(value: unknown, self: unknown): void {
    this.list(value, 'requires')?.forEach((id, i) => {
      const path = join('requires', i)
      if (this.slug(id, path) && id === self) this.error('self_require', path)
    })
  }

  /** Отсылки к правилам (D-38): slug-и без повторов и без самого урока. */
  private see(value: unknown, self: unknown): void {
    const seen = new Set<unknown>()
    this.list(value, 'see')?.forEach((id, i) => {
      const path = join('see', i)
      if (!this.slug(id, path)) return
      if (id === self) this.error('self_require', path)
      else if (seen.has(id)) this.error('duplicate_id', path, { id: id as string, other: 'see' })
      seen.add(id)
    })
  }

  private words(raw: Obj): void {
    this.required(raw, '', WORDS_REQUIRED)
    const words = 'words' in raw ? this.list(raw.words, 'words') : null
    if (words) {
      if (words.length === 0) this.error('empty', 'words')
      const seen = new Set<string>()
      words.forEach((w, i) => {
        if (!this.nonEmpty(w, join('words', i))) return
        if (seen.has(w as string))
          this.error('duplicate_word', join('words', i), { word: w as string })
        seen.add(w as string)
      })
    }
    if ('phrase' in raw) this.phrase(raw.phrase)
    if ('rule' in raw) this.rule(raw.rule)
    if ('exercises' in raw) {
      this.list(raw.exercises, 'exercises')?.forEach((ex, i) =>
        this.exercise(ex, join('exercises', i), 'words'),
      )
    }
  }

  /** Оригинал и хотя бы один перевод; false — проблема записана. */
  private pair(node: Obj, path: string): boolean {
    if (!this.lang) return false
    if (typeof node[this.lang] !== 'string')
      return this.error('missing_original', path, { lang: this.lang })
    if (!translations(node, this.lang).length) return this.error('no_translation', path)
    return true
  }

  private phrase(value: unknown): void {
    if (!this.type(value, 'phrase', 'object')) return
    const phrase = value as Obj
    let ok = this.langKeys(phrase, 'phrase', PHRASE_KEYS)
    if ('note' in phrase) ok = this.localized(phrase.note, join('phrase', 'note')) && ok
    if ('ext' in phrase) ok = this.type(phrase.ext, join('phrase', 'ext'), 'object') && ok
    if (ok && this.pair(phrase, 'phrase') && !('ru' in phrase)) this.warn('no_ru', 'phrase')
  }

  private rule(value: unknown): void {
    if (!this.type(value, 'rule', 'object')) return
    const rule = value as Obj
    this.keys(rule, 'rule', RULE_KEYS)
    this.required(rule, 'rule', ['text'])
    if ('text' in rule) this.localized(rule.text, join('rule', 'text'))
    if ('ext' in rule) this.type(rule.ext, join('rule', 'ext'), 'object')
    if (!('examples' in rule)) return
    this.list(rule.examples, join('rule', 'examples'))?.forEach((ex, i) => {
      const path = join(join('rule', 'examples'), i)
      if (this.type(ex, path, 'object') && this.langKeys(ex as Obj, path, EXAMPLE_KEYS))
        this.pair(ex as Obj, path)
    })
  }

  private exercise(value: unknown, path: string, kind: 'words' | 'grammar'): void {
    if (!this.type(value, path, 'object')) return
    const ex = value as Obj
    const allowed: readonly string[] = EXERCISE_TYPES[kind]
    const type = typeof ex.type === 'string' && allowed.includes(ex.type) ? ex.type : null
    const fields = type ? EXERCISE_FIELDS[type]! : Object.values(EXERCISE_FIELDS).flat()
    let ok = this.langKeys(ex, path, new Set(['type', 'ext', ...fields]))
    ok = this.required(ex, path, ['type']) && ok
    if ('ext' in ex) ok = this.type(ex.ext, join(path, 'ext'), 'object') && ok
    if ('type' in ex) this.oneOf(ex.type, join(path, 'type'), allowed)
    if (!type || !ok || !this.lang) return

    if (type === 'fill') {
      this.answer(ex, path)
      this.gap(ex, path)
    } else if (type === 'build') {
      if ('extra' in ex)
        this.list(ex.extra, join(path, 'extra'))?.forEach((b, i) =>
          this.nonEmpty(b, join(join(path, 'extra'), i)),
        )
      this.pair(ex, path)
    } else if (type === 'translate') {
      // Задание — перевод на другом языке, ответ — на языке урока.
      if (this.lang in ex) this.error('translation_own_lang', join(path, this.lang))
      if (!translations(ex, this.lang).length) this.error('no_translation', path)
      this.answer(ex, path)
    } else if (type === 'transform') {
      this.transform(ex, path)
    } else if (type === 'choose') {
      this.choose(ex, path)
    } else {
      this.required(ex, path, ['prompt', 'sample'])
      if ('prompt' in ex) this.localized(ex.prompt, join(path, 'prompt'))
      if ('template' in ex) this.nonEmpty(ex.template, join(path, 'template'))
      if ('sample' in ex) this.oneOrMany(ex.sample, join(path, 'sample'))
    }
  }

  /** Ровно один пропуск в оригинале упражнения. */
  private gap(ex: Obj, path: string): void {
    const original = ex[this.lang]
    if (typeof original !== 'string') {
      this.error('missing_original', path, { lang: this.lang })
      return
    }
    const gaps = original.split(GAP).length - 1
    if (gaps !== 1) this.error('gap_count', path, { count: gaps })
  }

  /** Трансформер: утверждение → каждая форма ровно один раз (D-1 LNG-S1-010). */
  private transform(ex: Obj, path: string): void {
    if (typeof ex[this.lang] !== 'string') this.error('missing_original', path, { lang: this.lang })
    if (!this.required(ex, path, ['into'])) return
    const toPath = join(path, 'into')
    const list = this.list(ex.into, toPath)
    if (!list) return
    if (list.length === 0) this.error('empty', toPath)
    const forms = new Set<string>()
    list.forEach((item, i) => {
      const p = join(toPath, i)
      if (!this.type(item, p, 'object')) return
      const t = item as Obj
      this.keys(t, p, TRANSFORM_KEYS)
      this.required(t, p, ['form', 'answer'])
      if ('answer' in t) this.oneOrMany(t.answer, join(p, 'answer'))
      if (!('form' in t) || !this.oneOf(t.form, join(p, 'form'), TRANSFORM_FORMS)) return
      if (forms.has(t.form as string))
        this.error('duplicate_form', join(p, 'form'), { form: t.form as string })
      forms.add(t.form as string)
    })
  }

  /** Выбор формы: ответ обязан быть среди вариантов, иначе упражнение нерешаемо. */
  private choose(ex: Obj, path: string): void {
    this.gap(ex, path)
    this.required(ex, path, ['options', 'answer'])
    const optPath = join(path, 'options')
    const options = 'options' in ex ? this.list(ex.options, optPath) : null
    const seen = new Set<string>()
    if (options) {
      if (options.length < 2) this.error('options_count', optPath, { min: 2 })
      options.forEach((o, i) => {
        if (!this.nonEmpty(o, join(optPath, i))) return
        const key = fold(o as string)
        if (seen.has(key)) this.error('duplicate_option', join(optPath, i), { option: o as string })
        seen.add(key)
      })
    }
    if ('answer' in ex && this.nonEmpty(ex.answer, join(path, 'answer')) && options) {
      if (!seen.has(fold(ex.answer as string)))
        this.error('answer_not_in_options', join(path, 'answer'), { answer: ex.answer as string })
    }
  }

  private grammar(raw: Obj): void {
    this.required(raw, '', ['pattern', 'rule'])
    if ('section' in raw) this.oneOf(raw.section, 'section', GRAMMAR_SECTIONS)
    if ('words' in raw) {
      const seen = new Set<string>()
      this.list(raw.words, 'words')?.forEach((w, i) => {
        if (!this.nonEmpty(w, join('words', i))) return
        if (seen.has(w as string))
          this.error('duplicate_word', join('words', i), { word: w as string })
        seen.add(w as string)
      })
    }
    const pattern = 'pattern' in raw ? this.list(raw.pattern, 'pattern') : null
    if (pattern) {
      if (pattern.length === 0) this.error('empty', 'pattern')
      else if (pattern.length < PATTERN_MIN || pattern.length > PATTERN_MAX)
        this.warn('pattern_size', 'pattern', {
          count: pattern.length,
          min: PATTERN_MIN,
          max: PATTERN_MAX,
        })
      pattern.forEach((ex, i) => {
        const p = join('pattern', i)
        if (this.type(ex, p, 'object') && this.langKeys(ex as Obj, p, EXAMPLE_KEYS))
          this.pair(ex as Obj, p)
      })
    }
    if ('rule' in raw) this.grammarRule(raw.rule)
    if ('bridge' in raw)
      this.list(raw.bridge, 'bridge')?.forEach((b, i) => this.bridge(b, join('bridge', i)))
    if ('exercises' in raw) {
      this.list(raw.exercises, 'exercises')?.forEach((ex, i) =>
        this.exercise(ex, join('exercises', i), 'grammar'),
      )
    }
  }

  private grammarRule(value: unknown): void {
    if (!this.type(value, 'rule', 'object')) return
    const rule = value as Obj
    this.keys(rule, 'rule', GRAMMAR_RULE_KEYS)
    this.required(rule, 'rule', ['text'])
    if ('text' in rule) this.localized(rule.text, join('rule', 'text'))
    if ('formula' in rule) this.nonEmpty(rule.formula, join('rule', 'formula'))
    if ('ext' in rule) this.type(rule.ext, join('rule', 'ext'), 'object')
    if ('table' in rule) this.table(rule.table, join('rule', 'table'))
    if (!('timeline' in rule)) return
    this.list(rule.timeline, join('rule', 'timeline'))?.forEach((seg, i) => {
      const p = join(join('rule', 'timeline'), i)
      if (!this.type(seg, p, 'object')) return
      const s = seg as Obj
      this.keys(s, p, TIMELINE_KEYS)
      this.required(s, p, ['from'])
      if ('from' in s) this.oneOf(s.from, join(p, 'from'), TIME_POINTS)
      if ('until' in s) this.oneOf(s.until, join(p, 'until'), TIME_POINTS)
      if ('label' in s) this.localized(s.label, join(p, 'label'))
    })
  }

  /** Таблица справочника: шапка и строки одной ширины (D-5 LNG-S1-010). */
  private table(value: unknown, path: string): void {
    if (!this.type(value, path, 'object')) return
    const t = value as Obj
    this.keys(t, path, TABLE_KEYS)
    if (!this.required(t, path, ['head', 'rows'])) return
    const head = this.list(t.head, join(path, 'head'))
    if (head?.length === 0) this.error('empty', join(path, 'head'))
    head?.forEach((cell, i) => this.type(cell, join(join(path, 'head'), i), 'string'))
    this.list(t.rows, join(path, 'rows'))?.forEach((row, i) => {
      const p = join(join(path, 'rows'), i)
      const cells = this.list(row, p)
      if (!cells) return
      if (head && head.length > 0 && cells.length !== head.length)
        this.error('table_shape', p, { expected: head.length, actual: cells.length })
      cells.forEach((cell, k) => this.type(cell, join(p, k), 'string'))
    })
  }

  private bridge(value: unknown, path: string): void {
    if (!this.type(value, path, 'object')) return
    const b = value as Obj
    this.keys(b, path, BRIDGE_KEYS)
    this.required(b, path, ['lang'])
    if ('formula' in b) this.nonEmpty(b.formula, join(path, 'formula'))
    if ('note' in b) this.localized(b.note, join(path, 'note'))
    if ('lesson' in b) this.slug(b.lesson, join(path, 'lesson'))
    if ('ext' in b) this.type(b.ext, join(path, 'ext'), 'object')
    if (!('lang' in b) || !this.langCode(b.lang, join(path, 'lang'))) return
    const lang = b.lang as string
    if (lang === this.lang) {
      this.error('bad_value', join(path, 'lang'), { allowed: `≠ ${this.lang}` })
      return
    }
    if (!('examples' in b)) return
    this.list(b.examples, join(path, 'examples'))?.forEach((ex, i) => {
      const p = join(join(path, 'examples'), i)
      if (!this.type(ex, p, 'object') || !this.langKeys(ex as Obj, p, EXAMPLE_KEYS)) return
      const node = ex as Obj
      if (typeof node[lang] !== 'string') this.error('missing_original', p, { lang })
      else if (!translations(node, lang).length) this.error('no_translation', p)
    })
  }

  private sound(raw: Obj): void {
    const letters = 'letters' in raw ? this.list(raw.letters, 'letters') : []
    const rules = 'rules' in raw ? this.list(raw.rules, 'rules') : []
    // Урок звучания без букв и правил учит только упражнениями — значит, нечему учить.
    if (letters?.length === 0 && rules?.length === 0) this.error('sound_empty', '')
    letters?.forEach((letter, i) => this.letter(letter, join('letters', i)))
    const ids = new Map<string, number>()
    rules?.forEach((rule, i) => {
      const id = this.readingRule(rule, join('rules', i))
      if (!id) return
      const first = ids.get(id)
      if (first !== undefined)
        this.error('duplicate_rule', join(join('rules', i), 'id'), {
          id,
          other: join('rules', first),
        })
      else ids.set(id, i)
    })
    if ('exercises' in raw) {
      this.list(raw.exercises, 'exercises')?.forEach((ex, i) =>
        this.soundExercise(ex, join('exercises', i)),
      )
    }
  }

  private letter(value: unknown, path: string): void {
    if (!this.type(value, path, 'object')) return
    const l = value as Obj
    this.keys(l, path, LETTER_KEYS)
    this.required(l, path, ['letter', 'name'])
    if ('letter' in l) this.nonEmpty(l.letter, join(path, 'letter'))
    if ('name' in l) this.nonEmpty(l.name, join(path, 'name'))
    if ('ipa' in l) this.nonEmpty(l.ipa, join(path, 'ipa'))
    if ('audio' in l) this.audio(l.audio, join(path, 'audio'))
    if ('ext' in l) this.type(l.ext, join(path, 'ext'), 'object')
  }

  /** id правила, если он корректен — для проверки повторов. */
  private readingRule(value: unknown, path: string): string | null {
    if (!this.type(value, path, 'object')) return null
    const r = value as Obj
    this.keys(r, path, READING_RULE_KEYS)
    this.required(r, path, ['id', 'title', 'text', 'examples'])
    const idOk = 'id' in r && this.slug(r.id, join(path, 'id'))
    if ('title' in r) this.localized(r.title, join(path, 'title'))
    if ('text' in r) this.localized(r.text, join(path, 'text'))
    if ('ipa' in r) this.nonEmpty(r.ipa, join(path, 'ipa'))
    if ('audio' in r) this.audio(r.audio, join(path, 'audio'))
    if ('ext' in r) this.type(r.ext, join(path, 'ext'), 'object')
    const examples = 'examples' in r ? this.list(r.examples, join(path, 'examples')) : null
    if (examples?.length === 0) this.error('empty', join(path, 'examples'))
    examples?.forEach((ex, i) => {
      const p = join(join(path, 'examples'), i)
      if (!this.type(ex, p, 'object') || !this.langKeys(ex as Obj, p, EXAMPLE_KEYS) || !this.lang)
        return
      if (typeof (ex as Obj)[this.lang] !== 'string')
        this.error('missing_original', p, { lang: this.lang })
    })
    return idOk ? (r.id as string) : null
  }

  private soundExercise(value: unknown, path: string): void {
    if (!this.type(value, path, 'object')) return
    const ex = value as Obj
    let ok = this.keys(ex, path, SOUND_EXERCISE_KEYS)
    ok = this.required(ex, path, ['type', 'items']) && ok
    if ('ext' in ex) ok = this.type(ex.ext, join(path, 'ext'), 'object') && ok
    if (!('type' in ex) || !this.oneOf(ex.type, join(path, 'type'), EXERCISE_TYPES.sound) || !ok)
      return
    const itemsPath = join(path, 'items')
    const items = this.list(ex.items, itemsPath)
    if (!items) return
    if (items.length === 0) this.error('empty', itemsPath)
    items.forEach((item, i) => {
      const p = join(itemsPath, i)
      if (ex.type !== 'pairs') {
        this.nonEmpty(item, p)
        return
      }
      // «Услышь и выбери» — ровно два разных слова, иначе выбирать не из чего.
      const pair = this.list(item, p)
      if (!pair) return
      if (pair.length !== 2) {
        this.error('pair_size', p)
        return
      }
      if (
        pair.every((w, k) => this.nonEmpty(w, join(p, k))) &&
        fold(pair[0] as string) === fold(pair[1] as string)
      )
        this.error('pair_size', p)
    })
  }

  private audio(value: unknown, path: string): void {
    if (this.type(value, path, 'string') && !AUDIO_RE.test(value as string))
      this.error('bad_audio', path, { path: value as string })
  }

  private answer(ex: Obj, path: string): void {
    if (this.required(ex, path, ['answer'])) this.oneOrMany(ex.answer, join(path, 'answer'))
  }

  /** Строка или непустой список строк: правильные варианты ответа или образца. */
  private oneOrMany(value: unknown, path: string): void {
    if (typeof value === 'string') {
      this.nonEmpty(value, path)
      return
    }
    const list = this.list(value, path)
    if (!list) return
    if (list.length === 0) this.error('empty', path)
    list.forEach((a, i) => this.nonEmpty(a, join(path, i)))
  }
}

const translations = (node: Obj, lang: string) =>
  Object.keys(node).filter((k) => LANG_RE.test(k) && k !== lang)

export interface NamedLesson {
  name: string
  lesson: Lesson
}

/**
 * Перекрёстные правила набора уроков со словарём (AC-3). Пути — `<файл> › …`.
 * Урок с повторным id дальше не проверяется: его место и связи — шум вокруг одной ошибки.
 */
export function validateLessonSet(
  lessons: NamedLesson[],
  dictionaries: DictionaryFile[],
): { errors: Issue[]; warnings: Issue[] } {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const entries = new Map<string, Entry>()
  for (const d of dictionaries) for (const e of d.entries) entries.set(`${d.lang}:${e.id}`, e)
  const ids = new Set(lessons.map((l) => l.lesson.id))
  const byId = new Map(lessons.map((l) => [l.lesson.id, l.lesson]))
  const seenIds = new Map<string, string>()
  const orders = new Map<string, string>()
  const ruleIds = new Map<string, string>()

  for (const { name, lesson } of lessons) {
    const at = (key: string) => `${name} › ${key}`
    const err = (code: Issue['code'], key: string, params: Issue['params'] = {}) =>
      errors.push({ severity: 'error', code, path: at(key), params })
    const warn = (code: Issue['code'], key: string, params: Issue['params'] = {}) =>
      warnings.push({ severity: 'warning', code, path: at(key), params })

    const owner = seenIds.get(lesson.id)
    if (owner) err('duplicate_id', 'id', { id: lesson.id, other: owner })
    else seenIds.set(lesson.id, name)
    if (name !== `${lesson.id}.json`) err('file_name', 'id', { expected: `${lesson.id}.json` })
    if (owner) continue

    const track = trackOf(lesson)
    const orderKey = `${lesson.lang}:${track}:${lesson.order}`
    const orderOwner = orders.get(orderKey)
    if (orderOwner)
      err('duplicate_order', 'order', { order: lesson.order, topic: track, other: orderOwner })
    else orders.set(orderKey, name)
    lesson.requires?.forEach((id, i) => {
      if (!ids.has(id)) err('unknown_lesson', join('requires', i), { id })
    })
    // Отсылки к правилам (D-38): урок того же языка; мост — урок грамматики языка моста.
    lesson.see?.forEach((id, i) => {
      const target = byId.get(id)
      if (!target) err('unknown_lesson', join('see', i), { id })
      else if (target.lang !== lesson.lang)
        err('bad_ref', join('see', i), { id, kind: target.kind, lang: lesson.lang })
    })
    if (lesson.kind === 'grammar')
      lesson.bridge?.forEach((b, i) => {
        if (!b.lesson) return
        const path = join(join('bridge', i), 'lesson')
        const target = byId.get(b.lesson)
        if (!target) err('unknown_lesson', path, { id: b.lesson })
        else if (target.kind !== 'grammar' || target.lang !== b.lang)
          err('bad_ref', path, { id: b.lesson, kind: 'grammar', lang: b.lang })
      })

    if (lesson.kind === 'sound') {
      lesson.rules?.forEach((rule, i) => {
        const ruleOwner = ruleIds.get(rule.id)
        if (ruleOwner)
          err('duplicate_rule', join(join('rules', i), 'id'), { id: rule.id, other: ruleOwner })
        else ruleIds.set(rule.id, name)
      })
      continue
    }

    if (lesson.kind === 'grammar') {
      // Слова-условие открытия темы (D-4 LNG-S1-010): только наличие в словаре.
      lesson.words?.forEach((word, i) => {
        if (!entries.has(`${lesson.lang}:${word}`))
          err('word_not_in_dictionary', join('words', i), { word, lang: lesson.lang })
      })
      continue
    }

    // Вид words: слова — в словаре языка урока; состав и ответы — по словарю.
    const found: Entry[] = []
    lesson.words.forEach((word, i) => {
      const entry = entries.get(`${lesson.lang}:${word}`)
      if (entry) found.push(entry)
      else err('word_not_in_dictionary', join('words', i), { word, lang: lesson.lang })
    })
    if (lesson.words.length < WORDS_MIN || lesson.words.length > WORDS_MAX)
      warn('lesson_word_count', 'words', {
        count: lesson.words.length,
        min: WORDS_MIN,
        max: WORDS_MAX,
      })
    if (found.length === lesson.words.length) {
      const pos = new Set(found.map((e) => e.pos))
      const missing = [
        pos.has('verb') ? null : 'verb',
        pos.has('noun') ? null : 'noun',
        pos.has('adj') || pos.has('adv') ? null : 'adj/adv',
      ].filter(Boolean)
      if (missing.length) warn('lesson_composition', 'words', { missing: missing.join(', ') })
    }
    const forms = new Set(found.flatMap(entryForms))
    lesson.exercises?.forEach((ex, i) => {
      if (ex.type !== 'fill') return
      const answers = Array.isArray(ex.answer) ? ex.answer : [ex.answer]
      if (!answers.some((a) => forms.has(fold(a))))
        warn('fill_answer_unknown', join(join('exercises', i), 'answer'), {
          answer: answers.join(' / '),
        })
    })
  }
  // Подсказка правила в карточке слова (D-2 LNG-S1-009): урок с правилом могут ещё не
  // написать — поэтому предупреждение, а не ошибка.
  for (const d of dictionaries) {
    for (const e of d.entries) {
      e.rules?.forEach((rule, j) => {
        if (!ruleIds.has(rule))
          warnings.push({
            severity: 'warning',
            code: 'rule_not_found',
            path: `dictionary ${d.lang} › ${e.id} › ${join('rules', j)}`,
            params: { rule },
          })
      })
    }
  }
  return { errors, warnings }
}

function entryForms(e: Entry): string[] {
  const out = [e.lemma]
  for (const value of Object.values(e.forms ?? {})) {
    for (const form of Array.isArray(value) ? value : [value]) out.push(...form.split(' / '))
  }
  return out.map(fold)
}
