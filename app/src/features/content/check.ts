import type { ErrorCode, Issue, IssueParams, WarningCode } from './issues'

// Базовые проверки форматов контента: проблема пишется с путём, проверка возвращает
// false — ошибка уже записана, узел дальше межполевыми правилами не проверяется.

export type Obj = Record<string, unknown>

/** Код языка — две строчные латинские буквы (ISO 639-1). */
export const LANG_RE = /^[a-z]{2}$/
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const join = (path: string, key: string | number) =>
  typeof key === 'number' ? `${path}[${key}]` : path ? `${path}.${key}` : key

export const isObj = (value: unknown): value is Obj =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Сравнение без учёта регистра и формы записи Unicode («ñ» одним символом и составным). */
export const fold = (s: string) => s.normalize('NFC').toLowerCase().normalize('NFC')

type Expected = 'string' | 'integer' | 'number' | 'object' | 'array' | 'boolean'

export class Checker {
  readonly errors: Issue[] = []
  readonly warnings: Issue[] = []

  protected error(code: ErrorCode, path: string, params: IssueParams = {}): false {
    this.errors.push({ severity: 'error', code, path, params })
    return false
  }

  protected warn(code: WarningCode, path: string, params: IssueParams = {}): void {
    this.warnings.push({ severity: 'warning', code, path, params })
  }

  protected keys(node: Obj, path: string, known: ReadonlySet<string>): boolean {
    let ok = true
    for (const key of Object.keys(node)) {
      if (!known.has(key)) ok = this.error('unknown_key', join(path, key), { key })
    }
    return ok
  }

  protected required(node: Obj, path: string, keys: readonly string[]): boolean {
    let ok = true
    for (const key of keys) {
      if (!(key in node)) ok = this.error('required', join(path, key), { key })
    }
    return ok
  }

  /** Двухбуквенные ключи — языки со строкой, прочие — из `known`. */
  protected langKeys(node: Obj, path: string, known: ReadonlySet<string>): boolean {
    let ok = true
    for (const [key, value] of Object.entries(node)) {
      if (LANG_RE.test(key)) ok = this.nonEmpty(value, join(path, key)) && ok
      else if (!known.has(key)) ok = this.error('unknown_key', join(path, key), { key })
    }
    return ok
  }

  protected list(value: unknown, path: string): unknown[] | null {
    return this.type(value, path, 'array') ? (value as unknown[]) : null
  }

  protected type(value: unknown, path: string, expected: Expected): boolean {
    const ok =
      expected === 'object'
        ? isObj(value)
        : expected === 'array'
          ? Array.isArray(value)
          : expected === 'integer'
            ? Number.isInteger(value)
            : expected === 'number'
              ? typeof value === 'number' && Number.isFinite(value)
              : typeof value === expected
    return ok || this.error('wrong_type', path, { expected })
  }

  protected nonEmpty(value: unknown, path: string): boolean {
    if (!this.type(value, path, 'string')) return false
    return (value as string).length > 0 || this.error('empty', path)
  }

  protected oneOf(value: unknown, path: string, allowed: readonly string[]): boolean {
    if (!this.type(value, path, 'string')) return false
    return (
      allowed.includes(value as string) ||
      this.error('bad_value', path, { allowed: allowed.join(', ') })
    )
  }

  protected slug(value: unknown, path: string): boolean {
    if (!this.type(value, path, 'string')) return false
    return SLUG_RE.test(value as string) || this.error('bad_slug', path)
  }

  protected langCode(value: unknown, path: string): boolean {
    if (!this.type(value, path, 'string')) return false
    return LANG_RE.test(value as string) || this.error('bad_lang', path)
  }

  protected localized(value: unknown, path: string): boolean {
    if (!this.type(value, path, 'object')) return false
    const entries = Object.entries(value as Obj)
    if (entries.length === 0) return this.error('empty', path)
    let ok = true
    for (const [key, text] of entries) {
      if (!LANG_RE.test(key)) ok = this.error('bad_lang', join(path, key))
      else ok = this.nonEmpty(text, join(path, key)) && ok
    }
    return ok
  }
}
