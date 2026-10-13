import { describe, expect, it } from 'vitest'

import { contrastRatio, parseColor } from './color'
import { mergeTheme } from './merge'
import { defaultTheme } from './default-theme'

describe('parseColor', () => {
  it('читает hex', () => {
    expect(parseColor('#2563EB')).toEqual({ r: 37, g: 99, b: 235, a: 1 })
  })
  it('мусор — null', () => {
    expect(parseColor('nope')).toBeNull()
  })
})

describe('mergeTheme', () => {
  it('патчит primary и сохраняет остальное', () => {
    const merged = mergeTheme(defaultTheme, { colors: { primary: '#111111' } })
    expect(merged.colors.primary).toBe('#111111')
    expect(merged.colors.bg).toBe(defaultTheme.colors.bg)
  })
})

describe('contrastRatio', () => {
  it('чёрный на белом ≥ 4.5', () => {
    const a = parseColor('#000000')!
    const b = parseColor('#FFFFFF')!
    expect(contrastRatio(a, b)).toBeGreaterThan(4.5)
  })
})
