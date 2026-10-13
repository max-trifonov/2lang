import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  GOAL_MAX,
  GOAL_MIN,
  INTERFACE_LOCALES,
  PROFILE_COLORS,
  STUDY_LANGUAGES,
  type Profile,
} from '../domain/profile'
import { backupFileName, buildBackup, freeName, parseBackup } from './format'

const anna: Profile = {
  id: 'p-1',
  name: 'Анна',
  color: 'rose',
  interfaceLocale: 'es',
  languages: ['en', 'es'],
  dailyGoal: 3,
  createdAt: '2026-10-01T10:00:00.000Z',
}

const at = new Date('2026-10-05T08:00:00Z')
const file = (patch: Record<string, unknown> = {}) =>
  JSON.stringify({ ...buildBackup(anna, {}, at, '0.1.0'), ...patch })

describe('резервная копия: разбор (К1)', () => {
  it('экспорт → импорт возвращает тот же профиль', () => {
    expect(parseBackup(file(), [])).toEqual({
      ok: true,
      profile: anna,
      data: {},
      exportedAt: '2026-10-05T08:00:00.000Z',
    })
  })

  it('round-trip на случайных профилях', () => {
    const profile = fc.record({
      id: fc.uuid(),
      name: fc
        .string({ minLength: 1, maxLength: 24 })
        .filter((s) => s.trim().length > 0 && s === s.trim()),
      color: fc.constantFrom(...PROFILE_COLORS),
      interfaceLocale: fc.constantFrom(...INTERFACE_LOCALES),
      languages: fc.subarray([...STUDY_LANGUAGES], { minLength: 1 }),
      dailyGoal: fc.integer({ min: GOAL_MIN, max: GOAL_MAX }),
      createdAt: fc
        .date({ min: new Date('2020-01-01'), max: new Date('2030-01-01'), noInvalidDate: true })
        .map((d) => d.toISOString()),
    })
    fc.assert(
      fc.property(profile, (p) => {
        const parsed = parseBackup(JSON.stringify(buildBackup(p, {}, at, '0.1.0')), [])
        expect(parsed).toMatchObject({ ok: true, profile: p })
      }),
    )
  })

  it.each([
    ['не JSON', 'not json', 'not_json'],
    ['чужой формат', file({ format: '2lang/text' }), 'not_backup'],
    [
      'текст песни вместо копии',
      JSON.stringify({ format: '2lang/text', version: 1 }),
      'not_backup',
    ],
    ['версия из будущего', file({ version: 2 }), 'newer_version'],
    ['нет профиля', file({ profile: null }), 'bad_profile'],
    ['пустое имя', file({ profile: { ...anna, name: '  ' } }), 'bad_profile'],
    ['цель 9', file({ profile: { ...anna, dailyGoal: 9 } }), 'bad_profile'],
    ['чужой цвет', file({ profile: { ...anna, color: 'pink' } }), 'bad_profile'],
    ['повтор языка', file({ profile: { ...anna, languages: ['en', 'en'] } }), 'bad_profile'],
    ['лишнее поле профиля', file({ profile: { ...anna, pin: '1234' } }), 'bad_profile'],
    ['кривая дата', file({ profile: { ...anna, createdAt: 'вчера' } }), 'bad_profile'],
    ['незнакомый стор', file({ data: { cards: [] } }), 'bad_data'],
  ])('%s → %s', (_name, source, error) => {
    expect(parseBackup(source, [])).toEqual({ ok: false, error })
  })

  it('записи стора принимаются только своего профиля', () => {
    const own = file({ data: { cards: [{ profileId: 'p-1', key: 'a' }] } })
    expect(parseBackup(own, ['cards'])).toMatchObject({ ok: true, data: { cards: [{ key: 'a' }] } })
    const foreign = file({ data: { cards: [{ profileId: 'p-2', key: 'a' }] } })
    expect(parseBackup(foreign, ['cards'])).toEqual({ ok: false, error: 'bad_data' })
  })
})

describe('freeName', () => {
  it('свободное имя не меняется', () => {
    expect(freeName('Анна', ['Борис'])).toBe('Анна')
  })

  it('занятое — с номером, без учёта регистра', () => {
    expect(freeName('Анна', ['анна'])).toBe('Анна 2')
    expect(freeName('Анна', ['Анна', 'анна 2'])).toBe('Анна 3')
  })

  it('номер не выводит имя за 24 символа', () => {
    const long = 'я'.repeat(24)
    expect(freeName(long, [long])).toBe(`${'я'.repeat(22)} 2`)
  })
})

describe('backupFileName', () => {
  it('имя и дата, без запрещённых символов', () => {
    expect(backupFileName({ ...anna, name: 'Анна / Мама' }, at)).toBe(
      '2lang-анна-мама-2026-10-05.json',
    )
  })
})
