export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

const HEX_RE = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/
const RGBA_RE = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/

export function parseColor(css: string): Rgba | null {
  const hex = HEX_RE.exec(css)
  if (hex) {
    const [, rgb, alphaHex] = hex
    return {
      r: parseInt(rgb!.slice(0, 2), 16),
      g: parseInt(rgb!.slice(2, 4), 16),
      b: parseInt(rgb!.slice(4, 6), 16),
      a: alphaHex ? parseInt(alphaHex, 16) / 255 : 1,
    }
  }
  const rgba = RGBA_RE.exec(css)
  if (rgba) {
    const [, r, g, b, a] = rgba
    return { r: Number(r), g: Number(g), b: Number(b), a: a !== undefined ? Number(a) : 1 }
  }
  return null
}

export function toCssColor(c: Rgba): string {
  const channel = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  const hex = `#${channel(c.r)}${channel(c.g)}${channel(c.b)}`
  return c.a >= 1 ? hex : `${hex}${channel(c.a * 255)}`
}

export function toRgbTriplet(c: Rgba): string {
  return `${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}`
}

export function mix(a: Rgba, b: Rgba, ratio: number): Rgba {
  const lerp = (x: number, y: number) => x + (y - x) * ratio
  return { r: lerp(a.r, b.r), g: lerp(a.g, b.g), b: lerp(a.b, b.b), a: lerp(a.a, b.a) }
}

function srgbChannel(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(c: Rgba): number {
  return 0.2126 * srgbChannel(c.r) + 0.7152 * srgbChannel(c.g) + 0.0722 * srgbChannel(c.b)
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const PURE_WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 }
const PURE_BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 }

export function pickContrastColor(bg: Rgba): Rgba {
  return contrastRatio(bg, PURE_WHITE) >= contrastRatio(bg, PURE_BLACK) ? PURE_WHITE : PURE_BLACK
}

export function ensureContrast(fg: Rgba, bg: Rgba, minRatio = 4.5): Rgba {
  if (contrastRatio(fg, bg) >= minRatio) return fg
  const toward = relativeLuminance(bg) < 0.5 ? PURE_WHITE : PURE_BLACK
  let lo = 0
  let hi = 1
  let best = mix(fg, toward, 1)
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    const candidate = mix(fg, toward, mid)
    if (contrastRatio(candidate, bg) >= minRatio) {
      best = candidate
      hi = mid
    } else {
      lo = mid
    }
  }
  return best
}
