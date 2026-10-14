import { Preferences } from '@capacitor/preferences'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { applyTheme } from './apply'
import type { ColorScheme } from './color-scheme'
import { watchColorScheme } from './color-scheme'
import { defaultTheme } from './default-theme'
import { deriveDarkTheme } from './derive'
import { mergeThemeWithReport } from './merge'
import type { Theme } from './types'
import { validateTheme, type ThemeWarning } from './validate'

export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_PREFERENCE_KEY = 'theme-preference-v1'

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function resolveColorScheme(preference: ThemePreference, system: ColorScheme): ColorScheme {
  return preference === 'system' ? system : preference
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(defaultTheme)
  const warnings = ref<ThemeWarning[]>([])
  const preference = ref<ThemePreference>('system')
  const colorScheme = ref<ColorScheme>('light')

  let lightTheme: Theme = defaultTheme
  let systemScheme: ColorScheme = 'light'
  let unsubscribeColorScheme: (() => void) | null = null

  function applyCurrent(): void {
    const scheme = resolveColorScheme(preference.value, systemScheme)
    colorScheme.value = scheme
    const applied = scheme === 'dark' ? deriveDarkTheme(lightTheme) : lightTheme
    theme.value = applied
    applyTheme(applied)
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = scheme
      // Селектор для CSS, которому нужна схема (features/language/lang.css).
      document.documentElement.dataset.colorScheme = scheme
    }
  }

  function setTheme(patch: unknown = {}): void {
    const { theme: merged, discardedPaths } = mergeThemeWithReport(defaultTheme, patch)
    lightTheme = merged
    warnings.value = [
      ...discardedPaths.map((path): ThemeWarning => ({
        code: 'invalid-value',
        tokens: [path],
        message: `Поле ${path} отброшено`,
      })),
      ...validateTheme(merged),
    ]
    if (unsubscribeColorScheme) {
      applyCurrent()
    } else {
      unsubscribeColorScheme = watchColorScheme((scheme) => {
        systemScheme = scheme
        applyCurrent()
      })
    }
  }

  async function hydratePreference(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: THEME_PREFERENCE_KEY })
      if (isThemePreference(value)) {
        preference.value = value
        if (unsubscribeColorScheme) applyCurrent()
      }
    } catch {
      /* web/test без Preferences */
    }
  }

  async function setPreference(next: ThemePreference): Promise<void> {
    preference.value = next
    applyCurrent()
    try {
      await Preferences.set({ key: THEME_PREFERENCE_KEY, value: next })
    } catch {
      /* persist best-effort */
    }
  }

  return { theme, warnings, colorScheme, preference, setTheme, setPreference, hydratePreference }
})
