import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { useBootScreenStore } from '@/app/boot'
import { requestPersistentStorage } from '@/db'
import { useProfilesStore } from '@/features/profiles'
import { hydrateLocalePreference, i18n } from '@/shared/i18n'
import { onResume, registerBackButton, startNetworkWatch } from '@/shared/native'
// PLATFORM:pwa
import { startOfflineShell } from '@/shared/native'
// /PLATFORM:pwa
import { useThemeStore } from '@/shared/theme'

import App from './App.vue'
import { router } from './router'

import '@fontsource-variable/onest'
import '@fontsource-variable/fraunces/full.css'

import './styles/tokens.css'
import './styles/typography-scale.css'
import '@/features/language/lang.css'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

import './styles/base.css'

const app = createApp(App).use(IonicVue).use(createPinia()).use(i18n).use(router)

async function boot(): Promise<void> {
  await Promise.all([useThemeStore().hydratePreference(), hydrateLocalePreference()])
  useThemeStore().setTheme()
  // До mount: первый экран зависит от того, есть ли профиль, и говорит на его языке.
  await useProfilesStore().ready()
  void requestPersistentStorage()
  app.mount('#app')
  try {
    await router.isReady()
  } finally {
    useBootScreenStore().markStartupSettled()
  }

  void startNetworkWatch()
  registerBackButton()
  // PLATFORM:pwa
  startOfflineShell()
  // /PLATFORM:pwa
  void onResume(() => {
    /* продукт подписывает обновление конфига/данных */
  })
}

void boot()
