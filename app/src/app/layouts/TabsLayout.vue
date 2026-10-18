<script setup lang="ts">
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { appTabs } from '@/app/navigation/tabs'
import type { TabDescriptor } from '@/app/navigation/types'

const { t } = useI18n()

const props = defineProps<{ tabs?: readonly TabDescriptor[] }>()
const tabs = computed(() => props.tabs ?? appTabs)
</script>

<template>
  <IonPage>
    <IonTabs>
      <IonRouterOutlet />
      <IonTabBar slot="bottom">
        <IonTabButton v-for="tab in tabs" :key="tab.id" :tab="tab.id" :href="`/${tab.path}`">
          <IonIcon :icon="tab.icon" aria-hidden="true" />
          <IonLabel>{{ t(tab.labelKey) }}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonPage>
</template>
