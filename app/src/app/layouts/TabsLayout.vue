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
import * as ionicons from 'ionicons/icons'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { appTabs } from '@/app/navigation/tabs'
import type { TabDescriptor } from '@/app/navigation/types'

const { t } = useI18n()

const props = defineProps<{ tabs?: readonly TabDescriptor[] }>()
const tabs = computed(() => props.tabs ?? appTabs)

function iconFor(name: string): string | undefined {
  const key = name.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase())
  return (ionicons as Record<string, string>)[key]
}
</script>

<template>
  <IonPage>
    <IonTabs>
      <IonRouterOutlet />
      <IonTabBar slot="bottom">
        <IonTabButton v-for="tab in tabs" :key="tab.id" :tab="tab.id" :href="`/${tab.path}`">
          <IonIcon :icon="iconFor(tab.icon)" aria-hidden="true" />
          <IonLabel>{{ t(tab.labelKey) }}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonPage>
</template>
