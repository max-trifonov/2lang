<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  ProfileForm,
  defaultDraft,
  isInterfaceLocale,
  useProfileBackup,
  useProfileEditor,
  useProfilesStore,
} from '@/features/profiles'
import { setLocalePreference } from '@/shared/i18n'
import { UiButton } from '@/shared/ui'

// Первый запуск (AC-1): без профиля приложению некуда вести ученика.
const { t, locale } = useI18n()
const profiles = useProfilesStore()
const router = useIonRouter()

const start = isInterfaceLocale(locale.value) ? locale.value : 'ru'
const { draft, errors, busy, submit } = useProfileEditor(defaultDraft([], start), profiles.create)

// Экран сразу говорит на выбранном языке — человек видит, что получит.
watch(
  () => draft.value.interfaceLocale,
  (next) => void setLocalePreference(next),
)

// Новое устройство после старого (AC-2 LNG-S1-006): профиль — из резервной копии.
const backup = useProfileBackup()
const backupInput = ref<HTMLInputElement | null>(null)

async function onBackupFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file && (await backup.restoreFrom(file))) router.replace('/')
}

async function onSubmit(): Promise<void> {
  if (await submit()) router.replace('/')
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('app.name') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <h1>{{ t('profiles.welcomeTitle') }}</h1>
      <p class="welcome__hint">{{ t('profiles.welcomeHint') }}</p>
      <ProfileForm
        v-model="draft"
        :errors="errors"
        :busy="busy"
        :submit-label="t('profiles.start')"
        @submit="onSubmit"
      />
      <UiButton
        variant="secondary"
        full-width
        class="welcome__restore"
        :loading="backup.restoring.value"
        @click="backupInput?.click()"
      >
        {{ t('profiles.backup.welcomeRestore') }}
      </UiButton>
      <input
        ref="backupInput"
        type="file"
        accept=".json,application/json"
        hidden
        data-testid="backup-file-input"
        @change="onBackupFile"
      />
    </IonContent>
  </IonPage>
</template>

<style scoped>
.welcome__restore {
  margin-top: var(--size-gutter);
}

.welcome__hint {
  margin-bottom: calc(var(--size-gutter) * 1.5);
  color: var(--color-fg-muted);
}
</style>
