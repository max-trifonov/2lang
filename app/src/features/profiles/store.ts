import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { PROFILE_DATA_STORES, appDb } from '@/db'
import { setLocalePreference } from '@/shared/i18n'

import {
  backupFileName,
  buildBackup,
  freeName,
  parseBackup,
  type BackupData,
  type BackupErrorCode,
} from './backup/format'
import {
  hasErrors,
  normalizeDraft,
  validateProfileDraft,
  type InterfaceLocale,
  type Profile,
  type ProfileDraft,
  type ProfileErrors,
} from './domain/profile'
import { idbProfileRepository, type ProfileRepository } from './storage'

export interface ProfilesDeps {
  repository: ProfileRepository
  /** Язык интерфейса следует за активным профилем (D-3). */
  applyLocale: (locale: InterfaceLocale) => unknown
  newId: () => string
  now: () => Date
  appVersion: string
  /** Сторы ученика, которые эта версия знает (D-16). */
  dataStores: readonly string[]
}

const defaultDeps = (): ProfilesDeps => ({
  repository: idbProfileRepository(appDb),
  applyLocale: setLocalePreference,
  newId,
  now: () => new Date(),
  appVersion: __APP_VERSION__,
  dataStores: PROFILE_DATA_STORES,
})

export type RestorePlan =
  | { ok: false; error: BackupErrorCode }
  | {
      ok: true
      kind: 'new' | 'replace'
      /** Профиль из файла; имя — уже свободное на этом устройстве. */
      profile: Profile
      data: BackupData
      exportedAt: string
      existing: Profile | null
    }

export type SaveResult = { ok: true; profile: Profile } | { ok: false; errors: ProfileErrors }

export const useProfilesStore = defineStore('profiles', () => {
  let deps: ProfilesDeps | null = null
  const use = () => (deps ??= defaultDeps())

  const profiles = ref<Profile[]>([])
  const activeId = ref<string | null>(null)
  const loaded = ref(false)

  const active = computed(() => profiles.value.find((p) => p.id === activeId.value) ?? null)

  /** Подменить зависимости (тесты) — до первого обращения к хранилищу. */
  function configure(next: Partial<ProfilesDeps>): void {
    deps = { ...use(), ...next }
  }

  function activate(profile: Profile | null): void {
    activeId.value = profile?.id ?? null
    if (profile) void use().applyLocale(profile.interfaceLocale)
  }

  async function load(): Promise<void> {
    const state = await use().repository.load()
    profiles.value = state.profiles
    let current = state.profiles.find((p) => p.id === state.activeId) ?? null
    // Активный указывает в пустоту (или не выбран), а профили есть — берём первый.
    if (!current && state.profiles.length > 0) {
      current = state.profiles[0]!
      await use().repository.setActive(current.id)
    }
    activate(current)
    loaded.value = true
  }

  let loading: Promise<void> | null = null

  /**
   * Однократная загрузка: её ждут и main.ts, и guard роутера — первая навигация
   * стартует на `app.use(router)`, раньше, чем main успевает загрузить профили.
   * IndexedDB недоступна (приватный режим и т. п.) — пускаем на экран первого
   * запуска: сохранение там покажет ошибку, а не белый экран.
   */
  function ready(): Promise<void> {
    loading ??= load().catch((error: unknown) => {
      console.error('profiles: load failed', error)
      loaded.value = true
    })
    return loading
  }

  async function create(draft: ProfileDraft): Promise<SaveResult> {
    const errors = validateProfileDraft(draft, profiles.value)
    if (hasErrors(errors)) return { ok: false, errors }
    const profile: Profile = {
      ...normalizeDraft(draft),
      id: use().newId(),
      createdAt: use().now().toISOString(),
    }
    await use().repository.save(profile, true)
    profiles.value = [...profiles.value, profile]
    activate(profile)
    return { ok: true, profile }
  }

  async function update(id: string, draft: ProfileDraft): Promise<SaveResult> {
    const current = profiles.value.find((p) => p.id === id)
    if (!current) throw new Error(`Профиль ${id} не найден`)
    const errors = validateProfileDraft(draft, profiles.value, id)
    if (hasErrors(errors)) return { ok: false, errors }
    const profile: Profile = { ...current, ...normalizeDraft(draft) }
    await use().repository.save(profile)
    profiles.value = profiles.value.map((p) => (p.id === id ? profile : p))
    if (id === activeId.value) activate(profile)
    return { ok: true, profile }
  }

  /** Последний профиль не удаляется: без профиля приложению некуда вести ученика. */
  async function remove(id: string): Promise<boolean> {
    if (profiles.value.length <= 1 || !profiles.value.some((p) => p.id === id)) return false
    const rest = profiles.value.filter((p) => p.id !== id)
    const next = id === activeId.value ? rest[0]! : active.value
    await use().repository.remove(id, next?.id ?? null)
    profiles.value = rest
    if (next?.id !== activeId.value) activate(next)
    return true
  }

  async function switchTo(id: string): Promise<void> {
    const profile = profiles.value.find((p) => p.id === id)
    if (!profile || id === activeId.value) return
    await use().repository.setActive(id)
    activate(profile)
  }

  async function setInterfaceLocale(locale: InterfaceLocale): Promise<void> {
    const current = active.value
    if (!current || current.interfaceLocale === locale) return
    await update(current.id, { ...current, interfaceLocale: locale })
  }

  /** Резервная копия активного профиля: имя файла и содержимое. */
  async function exportActive(): Promise<{ fileName: string; content: string } | null> {
    const profile = active.value
    if (!profile) return null
    const at = use().now()
    const data = await use().repository.exportData(profile.id)
    const backup = buildBackup(profile, data, at, use().appVersion)
    return { fileName: backupFileName(profile, at), content: JSON.stringify(backup, null, 2) }
  }

  /** Что произойдёт при восстановлении из файла; ничего не пишет. */
  function planRestore(source: string): RestorePlan {
    const parsed = parseBackup(source, use().dataStores)
    if (!parsed.ok) return parsed
    const existing = profiles.value.find((p) => p.id === parsed.profile.id) ?? null
    const others = profiles.value.filter((p) => p.id !== parsed.profile.id).map((p) => p.name)
    return {
      ok: true,
      kind: existing ? 'replace' : 'new',
      profile: { ...parsed.profile, name: freeName(parsed.profile.name, others) },
      data: parsed.data,
      exportedAt: parsed.exportedAt,
      existing,
    }
  }

  async function applyRestore(plan: Extract<RestorePlan, { ok: true }>): Promise<void> {
    await use().repository.restore(plan.profile, plan.data)
    profiles.value = [...profiles.value.filter((p) => p.id !== plan.profile.id), plan.profile].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt),
    )
    activate(plan.profile)
  }

  return {
    profiles,
    activeId,
    active,
    loaded,
    configure,
    load,
    ready,
    create,
    update,
    remove,
    switchTo,
    setInterfaceLocale,
    exportActive,
    planRestore,
    applyRestore,
  }
})

function newId(): string {
  // randomUUID есть только в защищённом контексте; dev-сервер по IP в локальной сети — нет.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
