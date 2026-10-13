// Профиль ученика — корень его данных на устройстве (LNG-S1-002). Любые данные ученика
// (прогресс, уроки, тексты) ключуются `profileId` и удаляются вместе с профилем.

export const STUDY_LANGUAGES = ['en', 'es'] as const
export type StudyLanguage = (typeof STUDY_LANGUAGES)[number]

export const INTERFACE_LOCALES = ['ru', 'en', 'es'] as const
export type InterfaceLocale = (typeof INTERFACE_LOCALES)[number]

/** Палитра различения профилей (D-5); значения — токены темы, не hex. */
export const PROFILE_COLORS = [
  'blue',
  'amber',
  'green',
  'rose',
  'violet',
  'teal',
  'orange',
  'slate',
] as const
export type ProfileColor = (typeof PROFILE_COLORS)[number]

export const NAME_MAX = 24
export const GOAL_MIN = 1
export const GOAL_MAX = 5
export const GOAL_DEFAULT = 2

export interface Profile {
  id: string
  name: string
  color: ProfileColor
  interfaceLocale: InterfaceLocale
  /** Непустое подмножество, порядок как в STUDY_LANGUAGES (EN ведущий, D-1). */
  languages: StudyLanguage[]
  /** Уроков в день (D-2). */
  dailyGoal: number
  createdAt: string
}

export type ProfileDraft = Pick<
  Profile,
  'name' | 'color' | 'interfaceLocale' | 'languages' | 'dailyGoal'
>

export type ProfileField = 'name' | 'languages' | 'dailyGoal'
export type ProfileErrorCode =
  'name_empty' | 'name_too_long' | 'name_taken' | 'languages_empty' | 'goal_range'

export type ProfileErrors = Partial<Record<ProfileField, ProfileErrorCode>>

const sameName = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

/** `selfId` — id правимого профиля: совпадение имени с самим собой не ошибка. */
export function validateProfileDraft(
  draft: ProfileDraft,
  existing: readonly Profile[],
  selfId?: string,
): ProfileErrors {
  const errors: ProfileErrors = {}
  const name = draft.name.trim()
  if (name.length === 0) errors.name = 'name_empty'
  else if (name.length > NAME_MAX) errors.name = 'name_too_long'
  else if (existing.some((p) => p.id !== selfId && sameName(p.name, name)))
    errors.name = 'name_taken'
  if (draft.languages.length === 0) errors.languages = 'languages_empty'
  if (
    !Number.isInteger(draft.dailyGoal) ||
    draft.dailyGoal < GOAL_MIN ||
    draft.dailyGoal > GOAL_MAX
  )
    errors.dailyGoal = 'goal_range'
  return errors
}

export const hasErrors = (errors: ProfileErrors) => Object.keys(errors).length > 0

/** Первый незанятый цвет; все заняты — по кругу. */
export function pickColor(existing: readonly Profile[]): ProfileColor {
  const used = new Set(existing.map((p) => p.color))
  return (
    PROFILE_COLORS.find((c) => !used.has(c)) ??
    PROFILE_COLORS[existing.length % PROFILE_COLORS.length]!
  )
}

export function defaultDraft(
  existing: readonly Profile[],
  interfaceLocale: InterfaceLocale,
): ProfileDraft {
  return {
    name: '',
    color: pickColor(existing),
    interfaceLocale,
    languages: [...STUDY_LANGUAGES],
    dailyGoal: GOAL_DEFAULT,
  }
}

/** Черновик → профиль: имя без краевых пробелов, языки в каноническом порядке. */
export function normalizeDraft(draft: ProfileDraft): ProfileDraft {
  return {
    ...draft,
    name: draft.name.trim(),
    languages: STUDY_LANGUAGES.filter((l) => draft.languages.includes(l)),
  }
}

export function isInterfaceLocale(value: unknown): value is InterfaceLocale {
  return (INTERFACE_LOCALES as readonly unknown[]).includes(value)
}
