export interface ThemeColors {
  bg: string
  surface: string
  surface_alt?: string
  primary: string
  on_primary: string
  primary_pressed?: string
  primary_disabled?: string
  accent: string
  on_accent: string
  fg: string
  fg_muted?: string
  fg_subtle?: string
  fg_on_dark?: string
  chip?: string
  chip_strong?: string
  stroke?: string
  success: string
  danger: string
  info?: string
  overlay?: string
}

export interface ThemeTypography {
  font_sans: string
  font_serif: string
  base_size: number
  scale: number
}

export interface ThemeRadii {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface ThemeSizes {
  gutter: number
}

export interface Theme {
  version: number
  colors: ThemeColors
  typography: ThemeTypography
  radii: ThemeRadii
  sizes: ThemeSizes
  shadows?: { card?: string }
}

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T

export type PartialTheme = DeepPartial<Theme>
