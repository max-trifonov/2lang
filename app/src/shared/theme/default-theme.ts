import type { Theme } from './types'

export const defaultTheme: Theme = {
  version: 1,
  colors: {
    bg: '#F4F5F9',
    surface: '#FFFFFF',
    surface_alt: '#ECEEF4',
    primary: '#23264D',
    on_primary: '#FFFFFF',
    accent: '#FFC53D',
    on_accent: '#2A1E00',
    fg: '#15172E',
    fg_muted: '#4A4F6A',
    fg_subtle: '#676C8A',
    fg_on_dark: '#FFFFFF',
    chip: '#E6E8F0',
    chip_strong: '#D3D6E2',
    stroke: '#E3E5EE',
    success: '#0B7D52',
    danger: '#D33A40',
    info: '#23264D',
    overlay: 'rgba(21, 23, 46, 0.72)',
  },
  typography: {
    font_sans: '"Onest Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    font_serif: '"Fraunces Variable", ui-serif, Georgia, serif',
    base_size: 16,
    scale: 1,
  },
  radii: { xs: 10, sm: 14, md: 18, lg: 24, xl: 999 },
  sizes: { gutter: 16 },
  shadows: { card: '0 1px 2px rgba(21, 23, 46, 0.04), 0 6px 20px -8px rgba(21, 23, 46, 0.12)' },
}
