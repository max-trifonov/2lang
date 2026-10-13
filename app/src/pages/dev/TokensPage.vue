<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import { useI18n } from 'vue-i18n'

import { defaultTheme } from '@/shared/theme'

const { t } = useI18n()
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('dev.tokens') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <pre>{{ JSON.stringify(defaultTheme, null, 2) }}</pre>
    </IonContent>
  </IonPage>
</template>
