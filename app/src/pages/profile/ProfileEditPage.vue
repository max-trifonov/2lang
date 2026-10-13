<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  alertController,
  useIonRouter,
} from '@ionic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  ProfileForm,
  defaultDraft,
  isInterfaceLocale,
  useProfileEditor,
  useProfilesStore,
} from '@/features/profiles'
import { UiButton } from '@/shared/ui'

// /profiles/new — создание, /profiles/:id/edit — правка и удаление (AC-2, AC-5).
const { t, locale } = useI18n()
const route = useRoute()
const router = useIonRouter()
const profiles = useProfilesStore()

const editing = computed(() => profiles.profiles.find((p) => p.id === route.params.id) ?? null)
const isNew = !route.params.id

const initial = editing.value
  ? { ...editing.value }
  : defaultDraft(profiles.profiles, isInterfaceLocale(locale.value) ? locale.value : 'ru')

const { draft, errors, busy, submit } = useProfileEditor(initial, (d) =>
  editing.value ? profiles.update(editing.value.id, d) : profiles.create(d),
)

const canDelete = computed(() => !isNew && profiles.profiles.length > 1)

async function onSubmit(): Promise<void> {
  if (await submit()) router.navigate('/profile', 'back', 'replace')
}

async function onDelete(): Promise<void> {
  const target = editing.value
  if (!target) return
  // Удаление стирает прогресс без возврата — здесь подтверждение оправдано.
  const alert = await alertController.create({
    header: t('profiles.deleteTitle', { name: target.name }),
    message: t('profiles.deleteText'),
    buttons: [
      { text: t('profiles.cancel'), role: 'cancel' },
      { text: t('profiles.deleteConfirm'), role: 'destructive' },
    ],
  })
  await alert.present()
  const { role } = await alert.onDidDismiss()
  if (role !== 'destructive') return
  if (await profiles.remove(target.id)) router.navigate('/profile', 'back', 'replace')
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/profile" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ isNew ? t('profiles.newTitle') : t('profiles.editTitle') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <ProfileForm
        v-if="isNew || editing"
        v-model="draft"
        :errors="errors"
        :busy="busy"
        :submit-label="isNew ? t('profiles.create') : t('profiles.save')"
        @submit="onSubmit"
      >
        <template v-if="!isNew" #extra>
          <UiButton variant="secondary" full-width :disabled="!canDelete" @click="onDelete">
            {{ t('profiles.delete') }}
          </UiButton>
          <p v-if="!canDelete" class="edit__hint">{{ t('profiles.lastProfile') }}</p>
        </template>
      </ProfileForm>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.edit__hint {
  margin: 0;
  color: var(--color-fg-subtle);
  font-size: 0.875rem;
}
</style>
