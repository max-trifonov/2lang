<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'

import { BootScreen, useBootScreenStore } from '@/app/boot'

const boot = useBootScreenStore()
</script>

<template>
  <IonApp>
    <IonRouterOutlet />
    <BootScreen v-if="boot.visible" />
  </IonApp>
</template>
