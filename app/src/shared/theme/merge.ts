import { defaultTheme } from './default-theme'
import type { PartialTheme, Theme } from './types'

export interface MergeResult {
  theme: Theme
  discardedPaths: string[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function typeMatches(base: unknown, value: unknown): boolean {
  if (typeof base === 'number') return typeof value === 'number' && Number.isFinite(value)
  return typeof base === typeof value
}

function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
  prefix: string,
  discardedPaths: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in base)) continue
    const baseValue = base[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = deepMerge(baseValue, value, path, discardedPaths)
    } else if (typeMatches(baseValue, value)) {
      result[key] = value
    } else {
      discardedPaths.push(path)
    }
  }
  return result
}

export function mergeThemeWithReport(base: Theme, patch: unknown): MergeResult {
  const discardedPaths: string[] = []
  if (!isPlainObject(patch)) return { theme: base, discardedPaths }
  const theme = deepMerge(
    base as unknown as Record<string, unknown>,
    patch,
    '',
    discardedPaths,
  ) as unknown as Theme
  return { theme, discardedPaths }
}

export function mergeTheme(base: Theme, patch: unknown): Theme {
  return mergeThemeWithReport(base, patch).theme
}

export function mergeWithDefault(patch: PartialTheme | unknown): Theme {
  return mergeTheme(defaultTheme, patch)
}
