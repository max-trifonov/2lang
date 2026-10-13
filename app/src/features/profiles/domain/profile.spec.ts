import { describe, expect, it } from 'vitest'

import {
  PROFILE_COLORS,
  defaultDraft,
  normalizeDraft,
  pickColor,
  validateProfileDraft,
  type Profile,
  type ProfileDraft,
} from './profile'

function profile(id: string, name: string, color: Profile['color'] = 'blue'): Profile {
  return {
    id,
    name,
    color,
    interfaceLocale: 'ru',
    languages: ['en', 'es'],
    dailyGoal: 2,
    createdAt: '2026-10-01T00:00:00.000Z',
  }
}

const draft = (patch: Partial<ProfileDraft> = {}): ProfileDraft => ({
  ...defaultDraft([], 'ru'),
  name: 'Мария',
  ...patch,
})

describe('validateProfileDraft', () => {
  const anna = profile('a', 'Анна')

  it('корректный черновик — без ошибок', () => {
    expect(validateProfileDraft(draft(), [anna])).toEqual({})
  })

  it.each([
    ['пустое имя', { name: '   ' }, { name: 'name_empty' }],
    ['длинное имя', { name: 'я'.repeat(25) }, { name: 'name_too_long' }],
    ['имя занято без учёта регистра и пробелов', { name: ' анна ' }, { name: 'name_taken' }],
    ['нет языков', { languages: [] }, { languages: 'languages_empty' }],
    ['цель 0', { dailyGoal: 0 }, { dailyGoal: 'goal_range' }],
    ['цель 6', { dailyGoal: 6 }, { dailyGoal: 'goal_range' }],
    ['цель дробная', { dailyGoal: 1.5 }, { dailyGoal: 'goal_range' }],
  ] as const)('%s', (_name, patch, expected) => {
    expect(validateProfileDraft(draft(patch as Partial<ProfileDraft>), [anna])).toEqual(expected)
  })

  it('24 символа — ещё можно', () => {
    expect(validateProfileDraft(draft({ name: 'я'.repeat(24) }), [])).toEqual({})
  })

  it('правка профиля: своё имя не считается занятым', () => {
    expect(validateProfileDraft(draft({ name: 'АННА' }), [anna], 'a')).toEqual({})
  })
})

describe('pickColor', () => {
  it('первый свободный цвет', () => {
    expect(pickColor([profile('a', 'A', 'blue'), profile('b', 'B', 'green')])).toBe('amber')
  })

  it('все заняты — по кругу', () => {
    const all = PROFILE_COLORS.map((c, i) => profile(String(i), `P${i}`, c))
    expect(pickColor(all)).toBe(PROFILE_COLORS[0])
  })
})

describe('normalizeDraft', () => {
  it('обрезает имя и упорядочивает языки (EN ведущий)', () => {
    expect(normalizeDraft(draft({ name: '  Мария ', languages: ['es', 'en'] }))).toMatchObject({
      name: 'Мария',
      languages: ['en', 'es'],
    })
  })
})
