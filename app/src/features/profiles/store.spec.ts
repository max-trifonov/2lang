import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultDraft, type Profile, type ProfileDraft } from './domain/profile'
import type { ProfileRepository } from './storage'
import { useProfilesStore } from './store'

/** Репозиторий в памяти: проверяем, что стор и «диск» не расходятся. */
function memoryRepo(initial: Profile[] = [], activeId: string | null = null) {
  const disk = { profiles: [...initial], activeId }
  const repo: ProfileRepository = {
    load: async () => ({ profiles: [...disk.profiles], activeId: disk.activeId }),
    save: async (p, activate) => {
      disk.profiles = [...disk.profiles.filter((x) => x.id !== p.id), p]
      if (activate) disk.activeId = p.id
    },
    remove: async (id, next) => {
      disk.profiles = disk.profiles.filter((x) => x.id !== id)
      disk.activeId = next
    },
    setActive: async (id) => {
      disk.activeId = id
    },
    exportData: async () => ({}),
    restore: async (p) => {
      disk.profiles = [...disk.profiles.filter((x) => x.id !== p.id), p]
      disk.activeId = p.id
    },
  }
  return { disk, repo }
}

const stored = (id: string, patch: Partial<Profile> = {}): Profile => ({
  ...defaultDraft([], 'ru'),
  id,
  name: id,
  createdAt: `2026-10-0${id.length}T00:00:00Z`,
  ...patch,
})

function setup(initial: Profile[] = [], activeId: string | null = null) {
  setActivePinia(createPinia())
  const { disk, repo } = memoryRepo(initial, activeId)
  const locales: string[] = []
  let seq = 0
  const store = useProfilesStore()
  store.configure({
    repository: repo,
    applyLocale: (l) => locales.push(l),
    newId: () => `id${++seq}`,
    now: () => new Date('2026-10-01T10:00:00Z'),
  })
  return { store, disk, locales }
}

const draft = (name: string, patch: Partial<ProfileDraft> = {}): ProfileDraft => ({
  ...defaultDraft([], 'ru'),
  name,
  ...patch,
})

describe('профили: загрузка', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('первый запуск — профилей и активного нет', async () => {
    const { store } = setup()
    await store.load()
    expect(store.loaded).toBe(true)
    expect(store.active).toBeNull()
  })

  it('активный восстанавливается и задаёт язык интерфейса', async () => {
    const { store, locales } = setup([stored('a'), stored('b', { interfaceLocale: 'es' })], 'b')
    await store.load()
    expect(store.active?.id).toBe('b')
    expect(locales).toEqual(['es'])
  })

  it('активный указывает в пустоту — берётся первый и запоминается', async () => {
    const { store, disk } = setup([stored('a')], 'ghost')
    await store.load()
    expect(store.active?.id).toBe('a')
    expect(disk.activeId).toBe('a')
  })
})

describe('профили: создание и правка', () => {
  it('создание делает профиль активным и сохраняет нормализованным', async () => {
    const { store, disk, locales } = setup()
    await store.load()
    const result = await store.create(
      draft('  Мария ', { languages: ['es'], interfaceLocale: 'en' }),
    )
    expect(result.ok).toBe(true)
    expect(disk.profiles).toEqual([
      expect.objectContaining({
        id: 'id1',
        name: 'Мария',
        languages: ['es'],
        createdAt: '2026-10-01T10:00:00.000Z',
      }),
    ])
    expect(disk.activeId).toBe('id1')
    expect(store.active?.name).toBe('Мария')
    expect(locales).toEqual(['en'])
  })

  it('невалидный черновик не сохраняется', async () => {
    const { store, disk } = setup([stored('a', { name: 'Анна' })], 'a')
    await store.load()
    expect(await store.create(draft('анна'))).toEqual({ ok: false, errors: { name: 'name_taken' } })
    expect(disk.profiles).toHaveLength(1)
  })

  it('смена языка интерфейса активного профиля применяется сразу', async () => {
    const { store, disk, locales } = setup([stored('a')], 'a')
    await store.load()
    await store.setInterfaceLocale('es')
    expect(disk.profiles[0]!.interfaceLocale).toBe('es')
    expect(locales).toEqual(['ru', 'es'])
  })

  it('правка неактивного профиля язык интерфейса не трогает', async () => {
    const { store, locales } = setup([stored('a'), stored('bb')], 'a')
    await store.load()
    await store.update('bb', { ...stored('bb'), interfaceLocale: 'en', dailyGoal: 5 })
    expect(store.profiles.find((p) => p.id === 'bb')?.dailyGoal).toBe(5)
    expect(locales).toEqual(['ru'])
  })
})

describe('профили: переключение и удаление', () => {
  it('переключение меняет активного и язык', async () => {
    const { store, disk, locales } = setup(
      [stored('a'), stored('bb', { interfaceLocale: 'en' })],
      'a',
    )
    await store.load()
    await store.switchTo('bb')
    expect(store.active?.id).toBe('bb')
    expect(disk.activeId).toBe('bb')
    expect(locales).toEqual(['ru', 'en'])
  })

  it('последний профиль не удаляется', async () => {
    const { store, disk } = setup([stored('a')], 'a')
    await store.load()
    expect(await store.remove('a')).toBe(false)
    expect(disk.profiles).toHaveLength(1)
  })

  it('удаление активного — активным становится оставшийся', async () => {
    const { store, disk } = setup([stored('a'), stored('bb')], 'a')
    await store.load()
    expect(await store.remove('a')).toBe(true)
    expect(store.active?.id).toBe('bb')
    expect(disk).toMatchObject({ activeId: 'bb', profiles: [{ id: 'bb' }] })
  })

  it('удаление неактивного активного не меняет', async () => {
    const { store, disk } = setup([stored('a'), stored('bb'), stored('ccc')], 'a')
    await store.load()
    await store.remove('bb')
    expect(store.active?.id).toBe('a')
    expect(disk.activeId).toBe('a')
    expect(store.profiles.map((p) => p.id)).toEqual(['a', 'ccc'])
  })
})

describe('профили: ready()', () => {
  it('грузит один раз, сколько бы его ни ждали', async () => {
    const { store } = setup([stored('a')], 'a')
    let calls = 0
    const repo = { load: async () => (calls++, { profiles: [stored('a')], activeId: 'a' }) }
    store.configure({ repository: { ...memoryRepo().repo, ...repo } })
    await Promise.all([store.ready(), store.ready()])
    await store.ready()
    expect(calls).toBe(1)
    expect(store.active?.id).toBe('a')
  })

  it('сбой хранилища не роняет запуск: профилей нет, загрузка завершена', async () => {
    const { store } = setup()
    store.configure({
      repository: { ...memoryRepo().repo, load: () => Promise.reject(new Error('no idb')) },
    })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await store.ready()
    expect(store.loaded).toBe(true)
    expect(store.profiles).toEqual([])
    spy.mockRestore()
  })
})

describe('профили: резервная копия', () => {
  it('экспорт → восстановление на другом устройстве', async () => {
    const source = setup([stored('a', { name: 'Анна', dailyGoal: 4 })], 'a')
    await source.store.load()
    const file = await source.store.exportActive()
    expect(file?.fileName).toBe('2lang-анна-2026-10-01.json')

    const target = setup()
    await target.store.load()
    const plan = target.store.planRestore(file!.content)
    expect(plan).toMatchObject({ ok: true, kind: 'new', profile: { id: 'a', dailyGoal: 4 } })
    if (!plan.ok) return
    await target.store.applyRestore(plan)
    expect(target.store.active).toMatchObject({ id: 'a', name: 'Анна' })
    expect(target.disk.activeId).toBe('a')
    expect(target.locales).toEqual(['ru'])
  })

  it('тот же профиль — замена; занятое другим имя — с номером', async () => {
    const source = setup([stored('a', { name: 'Анна' })], 'a')
    await source.store.load()
    const content = (await source.store.exportActive())!.content

    const same = setup([stored('a', { name: 'Аня' })], 'a')
    await same.store.load()
    expect(same.store.planRestore(content)).toMatchObject({
      kind: 'replace',
      profile: { name: 'Анна' },
      existing: { name: 'Аня' },
    })

    const clash = setup([stored('zz', { name: 'Анна' })], 'zz')
    await clash.store.load()
    expect(clash.store.planRestore(content)).toMatchObject({
      kind: 'new',
      profile: { name: 'Анна 2' },
    })
  })

  it('битый файл — ошибка, ничего не пишется', async () => {
    const { store, disk } = setup([stored('a')], 'a')
    await store.load()
    expect(store.planRestore('{"format":"2lang/text"}')).toEqual({ ok: false, error: 'not_backup' })
    expect(disk.profiles).toHaveLength(1)
  })
})
