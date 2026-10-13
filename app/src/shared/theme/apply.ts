import { parseColor, pickContrastColor, toRgbTriplet } from './color'
import { deriveColors } from './derive'
import type { Theme, ThemeColors, ThemeRadii, ThemeSizes } from './types'

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'bg',
  'surface',
  'surface_alt',
  'primary',
  'on_primary',
  'primary_pressed',
  'primary_disabled',
  'accent',
  'on_accent',
  'fg',
  'fg_muted',
  'fg_subtle',
  'fg_on_dark',
  'chip',
  'chip_strong',
  'stroke',
  'success',
  'danger',
  'info',
  'overlay',
]

const RADIUS_KEYS: (keyof ThemeRadii)[] = ['xs', 'sm', 'md', 'lg', 'xl']
const SIZE_KEYS: (keyof ThemeSizes)[] = ['gutter']

function toKebab(key: string): string {
  return key.replace(/_/g, '-')
}

type VarMap = Record<string, string | undefined>

function setColorAndRgb(vars: VarMap, name: string, css: string | undefined): void {
  vars[name] = css
  const parsed = css ? parseColor(css) : null
  vars[`${name}-rgb`] = parsed ? toRgbTriplet(parsed) : undefined
}

function buildIonicBridgeVars(theme: Theme, derived: ReturnType<typeof deriveColors>): VarMap {
  const vars: VarMap = {}
  setColorAndRgb(vars, '--ion-background-color', theme.colors.bg)
  setColorAndRgb(vars, '--ion-text-color', theme.colors.fg)
  vars['--ion-card-background'] = theme.colors.surface
  vars['--ion-item-background'] = theme.colors.surface
  vars['--ion-font-family'] = theme.typography.font_sans
  setColorAndRgb(vars, '--ion-color-primary', theme.colors.primary)
  setColorAndRgb(vars, '--ion-color-primary-contrast', theme.colors.on_primary)
  vars['--ion-color-primary-shade'] = derived.primaryShade
  vars['--ion-color-primary-tint'] = derived.primaryTint
  for (const [name, css] of [
    ['danger', theme.colors.danger],
    ['success', theme.colors.success],
  ] as const) {
    setColorAndRgb(vars, `--ion-color-${name}`, css)
    const parsed = css ? parseColor(css) : null
    if (!parsed) continue
    const contrast = pickContrastColor(parsed)
    vars[`--ion-color-${name}-contrast`] = `rgb(${contrast.r}, ${contrast.g}, ${contrast.b})`
    vars[`--ion-color-${name}-contrast-rgb`] = toRgbTriplet(contrast)
  }
  return vars
}

export function buildThemeVars(theme: Theme): VarMap {
  const derived = deriveColors(theme)
  const vars: VarMap = {}
  for (const key of COLOR_KEYS) {
    setColorAndRgb(vars, `--color-${toKebab(key)}`, theme.colors[key])
  }
  vars['--color-primary-pressed'] = theme.colors.primary_pressed ?? derived.primaryPressed
  vars['--color-primary-disabled'] = theme.colors.primary_disabled ?? derived.primaryDisabled
  vars['--color-primary-fg'] = derived.primaryFg
  vars['--color-accent-pressed'] = derived.accentPressed
  vars['--font-sans'] = theme.typography.font_sans
  vars['--font-serif'] = theme.typography.font_serif
  vars['--font-base'] = `${theme.typography.base_size}px`
  vars['--font-scale'] = String(theme.typography.scale)
  for (const key of RADIUS_KEYS) {
    const value = theme.radii?.[key]
    vars[`--radius-${key}`] = value !== undefined ? `${value}px` : undefined
  }
  for (const key of SIZE_KEYS) {
    const value = theme.sizes?.[key]
    vars[`--size-${toKebab(key)}`] = value !== undefined ? `${value}px` : undefined
  }
  vars['--shadow-card'] = theme.shadows?.card
  return { ...vars, ...buildIonicBridgeVars(theme, derived) }
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  const vars = buildThemeVars(theme)
  for (const [name, value] of Object.entries(vars)) {
    if (value === undefined) root.style.removeProperty(name)
    else root.style.setProperty(name, value)
  }
}
