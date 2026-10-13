import { describe, expect, it } from 'vitest'

import { WELCOME_PATH, profileRedirect } from './guard'

describe('profileRedirect', () => {
  it.each([
    ['/home', false, WELCOME_PATH],
    ['/profiles/new', false, WELCOME_PATH],
    [WELCOME_PATH, false, undefined],
    [WELCOME_PATH, true, '/'],
    ['/home', true, undefined],
    ['/profiles/new', true, undefined],
  ])('%s, профили есть: %s → %s', (path, has, expected) => {
    expect(profileRedirect(path, has)).toBe(expected)
  })
})
