<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { UiButton, UiCard, UiChip, UiEmptyState, UiField, UiSkeleton } from '@/shared/ui'

const { t } = useI18n()
const field = ref('')
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('dev.uiKit') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <UiButton>{{ t('home.ask') }}</UiButton>
      <UiButton variant="secondary">Secondary</UiButton>
      <UiChip selected>Chip</UiChip>
      <UiField v-model="field" :label="t('profile.title')" />
      <UiCard>Card</UiCard>
      <UiSkeleton />
      <UiEmptyState variant="empty" icon="file-tray-outline" :title="t('home.hello')" />
    </IonContent>
  </IonPage>
</template>
