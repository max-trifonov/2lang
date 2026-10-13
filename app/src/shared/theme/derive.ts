import {
  contrastRatio,
  ensureContrast,
  mix,
  parseColor,
  pickContrastColor,
  toCssColor,
} from './color'
import type { Theme, ThemeColors } from './types'

const BLACK = { r: 0, g: 0, b: 0, a: 1 }
const WHITE = { r: 255, g: 255, b: 255, a: 1 }

export interface DerivedColors {
  primaryPressed: string
  primaryDisabled: string
  primaryFg: string
  primaryShade: string
  primaryTint: string
  accentPressed: string
}

function darkenBy(css: string, ratio: number): string {
  const c = parseColor(css)
  return c ? toCssColor(mix(c, BLACK, ratio)) : css
}

function lightenBy(css: string, ratio: number): string {
  const c = parseColor(css)
  return c ? toCssColor(mix(c, WHITE, ratio)) : css
}

function blendWith(
  css: string,
  target: { r: number; g: number; b: number; a: number },
  ratio: number,
): string {
  const c = parseColor(css)
  return c ? toCssColor(mix(c, target, ratio)) : css
}

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result: T = { ...obj }
  for (const key of keys) delete result[key]
  return result
}

export function deriveColors(theme: Theme): DerivedColors {
  const { colors } = theme
  const surface = parseColor(colors.surface) ?? WHITE
  const primary = parseColor(colors.primary)
  const primaryFg =
    primary && contrastRatio(primary, surface) < 4.5
      ? toCssColor(ensureContrast(primary, surface, 4.5))
      : colors.primary

  return {
    primaryPressed: colors.primary_pressed ?? darkenBy(colors.primary, 0.12),
    primaryDisabled: colors.primary_disabled ?? blendWith(colors.primary, surface, 0.6),
    primaryFg,
    primaryShade: darkenBy(colors.primary, 0.12),
    primaryTint: lightenBy(colors.primary, 0.1),
    accentPressed: darkenBy(colors.accent, 0.12),
  }
}

/** Тёмный primary (чернильный) на тёмном фоне не виден — поднимаем до контраста текста. */
function readableOn(css: string, bgCss: string): { color: string; on: string } | null {
  const color = parseColor(css)
  const bg = parseColor(bgCss)
  if (!color || !bg || contrastRatio(color, bg) >= 4.5) return null
  const lifted = ensureContrast(color, bg, 4.5)
  return { color: toCssColor(lifted), on: toCssColor(pickContrastColor(lifted)) }
}

export function deriveDarkTheme(theme: Theme): Theme {
  const c = omit(theme.colors, ['primary_pressed', 'primary_disabled'] as const)
  const bg = darkenBy(c.bg, 0.92)
  const primary = readableOn(c.primary, bg)
  const colors: ThemeColors = {
    ...c,
    ...(primary && { primary: primary.color, on_primary: primary.on }),
    ...(c.info !== undefined && { info: readableOn(c.info, bg)?.color ?? c.info }),
    success: readableOn(c.success, bg)?.color ?? c.success,
    danger: readableOn(c.danger, bg)?.color ?? c.danger,
    bg,
    surface: darkenBy(c.bg, 0.85),
    ...(c.surface_alt !== undefined && { surface_alt: darkenBy(c.surface_alt, 0.85) }),
    ...(c.chip !== undefined && { chip: darkenBy(c.chip, 0.75) }),
    ...(c.chip_strong !== undefined && { chip_strong: darkenBy(c.chip_strong, 0.65) }),
    fg: lightenBy(c.fg, 0.92),
    ...(c.fg_muted !== undefined && { fg_muted: lightenBy(c.fg_muted, 0.72) }),
    ...(c.fg_subtle !== undefined && { fg_subtle: lightenBy(c.fg_subtle, 0.78) }),
    // Обводка на тёмном — тихая линия чуть светлее поверхности, а не яркий контур.
    ...(c.stroke !== undefined && { stroke: darkenBy(c.stroke, 0.8) }),
  }
  return { ...theme, colors }
}
