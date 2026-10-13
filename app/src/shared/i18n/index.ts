import { Preferences } from '@capacitor/preferences'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

import ru from './locales/ru.json'
import en from './locales/en.json'
import es from './locales/es.json'
import { pluralRulesFor } from './plural'

export const DEFAULT_LOCALE = 'ru'

export const messages = { ru, en, es } as const

export type AppLocale = keyof typeof messages

// Список языков выводится из словарей: apply.mjs правит только импорты и
// `messages`, переключатель в ProfilePage строится по этому массиву (D-17).
export const SUPPORTED_LOCALES = Object.keys(messages) as AppLocale[]

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
  pluralRules: pluralRulesFor(SUPPORTED_LOCALES),
})

// <html lang> следует за языком интерфейса: озвучка, скринридер и переносы
// выбирают язык по нему, а index.html знает только язык по умолчанию.
watch(
  i18n.global.locale,
  (locale) => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale
  },
  { immediate: true },
)

function isAppLocale(value: string): value is AppLocale {
  return value in messages
}

// LOCALE_PREFERENCE_KEY — тот же паттерн, что THEME_PREFERENCE_KEY
// (shared/theme/store.ts): переключение языка само по себе не переживало
// перезапуск ни у одного потомка — chip в ProfilePage правил только
// реактивный `locale` без persist. Общая полезность, не курьерская
// специфика (D-14, templates-app).
export const LOCALE_PREFERENCE_KEY = 'locale-preference-v1'

export async function hydrateLocalePreference(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: LOCALE_PREFERENCE_KEY })
    if (value && isAppLocale(value)) {
      i18n.global.locale.value = value
    }
  } catch {
    /* web/test без Preferences */
  }
}

export async function setLocalePreference(locale: AppLocale): Promise<void> {
  i18n.global.locale.value = locale
  try {
    await Preferences.set({ key: LOCALE_PREFERENCE_KEY, value: locale })
  } catch {
    /* persist best-effort, как setPreference в theme/store.ts */
  }
}
