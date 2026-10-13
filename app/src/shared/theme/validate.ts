import { contrastRatio, parseColor } from './color'
import type { Theme } from './types'

export interface ThemeWarning {
  code: 'low-contrast' | 'invalid-color' | 'invalid-value'
  tokens: string[]
  message: string
}

const CONTRAST_PAIRS: Array<{
  fg: keyof Theme['colors']
  bg: keyof Theme['colors']
  label: string
}> = [
  { fg: 'fg', bg: 'bg', label: 'fg/bg' },
  { fg: 'on_primary', bg: 'primary', label: 'on_primary/primary' },
  { fg: 'on_accent', bg: 'accent', label: 'on_accent/accent' },
]

export function validateTheme(theme: Theme): ThemeWarning[] {
  const warnings: ThemeWarning[] = []
  for (const [token, value] of Object.entries(theme.colors)) {
    if (typeof value === 'string' && !parseColor(value)) {
      warnings.push({
        code: 'invalid-color',
        tokens: [token],
        message: `Токен ${token} не распознан как CSS-цвет`,
      })
    }
  }
  for (const pair of CONTRAST_PAIRS) {
    const fgValue = theme.colors[pair.fg]
    const bgValue = theme.colors[pair.bg]
    if (!fgValue || !bgValue) continue
    const fg = parseColor(fgValue)
    const bg = parseColor(bgValue)
    if (!fg || !bg) continue
    const ratio = contrastRatio(fg, bg)
    if (ratio < 4.5) {
      warnings.push({
        code: 'low-contrast',
        tokens: [String(pair.fg), String(pair.bg)],
        message: `Контраст ${pair.label} ${ratio.toFixed(2)}:1 < 4.5`,
      })
    }
  }
  return warnings
}
