// Резервная копия профиля `2lang/backup` (LNG-S1-006): профиль + данные ученика по сторам.
// Файл — внешний ввод: всё из него проходит те же правила, что и форма профиля.

import {
  INTERFACE_LOCALES,
  NAME_MAX,
  PROFILE_COLORS,
  STUDY_LANGUAGES,
  hasErrors,
  validateProfileDraft,
  type Profile,
} from '../domain/profile'

export const BACKUP_FORMAT = '2lang/backup'
export const BACKUP_VERSION = 1

/** Записи ученика по именам сторов; у каждой записи `profileId` профиля копии. */
export type BackupData = Record<string, Record<string, unknown>[]>

export interface Backup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  appVersion: string
  profile: Profile
  data: BackupData
}

export type BackupErrorCode =
  'not_json' | 'not_backup' | 'newer_version' | 'bad_profile' | 'bad_data'

export type ParsedBackup =
  | { ok: true; profile: Profile; data: BackupData; exportedAt: string }
  | { ok: false; error: BackupErrorCode }

export function buildBackup(
  profile: Profile,
  data: BackupData,
  exportedAt: Date,
  appVersion: string,
): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    appVersion,
    profile: { ...profile, languages: [...profile.languages] },
    data,
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const PROFILE_KEYS = [
  'id',
  'name',
  'color',
  'interfaceLocale',
  'languages',
  'dailyGoal',
  'createdAt',
]

/** `knownStores` — сторы ученика этой версии приложения; чужой стор — ошибка, а не потеря. */
export function parseBackup(source: string, knownStores: readonly string[]): ParsedBackup {
  let raw: unknown
  try {
    raw = JSON.parse(source)
  } catch {
    return { ok: false, error: 'not_json' }
  }
  if (!isObj(raw) || raw.format !== BACKUP_FORMAT || !Number.isInteger(raw.version)) {
    return { ok: false, error: 'not_backup' }
  }
  // Копия из будущей версии может нести данные, которые эта версия молча потеряет (D-5).
  if ((raw.version as number) > BACKUP_VERSION) return { ok: false, error: 'newer_version' }
  if ((raw.version as number) < 1 || typeof raw.exportedAt !== 'string') {
    return { ok: false, error: 'not_backup' }
  }

  const profile = toProfile(raw.profile)
  if (!profile) return { ok: false, error: 'bad_profile' }

  const data = toData(raw.data, profile.id, knownStores)
  if (!data) return { ok: false, error: 'bad_data' }
  return { ok: true, profile, data, exportedAt: raw.exportedAt }
}

function toProfile(value: unknown): Profile | null {
  if (!isObj(value) || Object.keys(value).some((k) => !PROFILE_KEYS.includes(k))) return null
  const { id, name, color, interfaceLocale, languages, dailyGoal, createdAt } = value
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return null
  if (typeof name !== 'string' || typeof createdAt !== 'string') return null
  if (Number.isNaN(Date.parse(createdAt))) return null
  if (!(PROFILE_COLORS as readonly unknown[]).includes(color)) return null
  if (!(INTERFACE_LOCALES as readonly unknown[]).includes(interfaceLocale)) return null
  if (
    !Array.isArray(languages) ||
    new Set(languages).size !== languages.length ||
    languages.some((l) => !(STUDY_LANGUAGES as readonly unknown[]).includes(l))
  ) {
    return null
  }
  if (typeof dailyGoal !== 'number') return null
  const profile = { id, name, color, interfaceLocale, languages, dailyGoal, createdAt } as Profile
  return hasErrors(validateProfileDraft(profile, [])) ? null : profile
}

function toData(value: unknown, profileId: string, known: readonly string[]): BackupData | null {
  if (!isObj(value)) return null
  const data: BackupData = {}
  for (const [store, records] of Object.entries(value)) {
    if (!known.includes(store) || !Array.isArray(records)) return null
    // Запись чужого профиля в копии — признак подделки или ошибки сборки; не берём.
    if (records.some((r) => !isObj(r) || r.profileId !== profileId)) return null
    data[store] = records as Record<string, unknown>[]
  }
  return data
}

/** «Анна» занята другим профилем → «Анна 2», «Анна 3»…; длина имени не выходит за предел. */
export function freeName(name: string, taken: readonly string[]): string {
  const busy = new Set(taken.map((n) => n.trim().toLocaleLowerCase()))
  if (!busy.has(name.trim().toLocaleLowerCase())) return name
  for (let n = 2; ; n++) {
    const suffix = ` ${n}`
    const candidate = name.slice(0, NAME_MAX - suffix.length).trimEnd() + suffix
    if (!busy.has(candidate.toLocaleLowerCase())) return candidate
  }
}

/** `2lang-анна-2026-10-01.json`: имя — без символов, запрещённых в именах файлов. */
export function backupFileName(profile: Profile, at: Date): string {
  const name = profile.name
    .trim()
    .toLocaleLowerCase()
    .replace(/[\\/:*?"<>|\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `2lang-${name || 'profile'}-${at.toISOString().slice(0, 10)}.json`
}
