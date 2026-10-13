<script setup lang="ts">
import { IonContent, IonModal } from '@ionic/vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    breakpoints?: number[]
    initialBreakpoint?: number
    handle?: boolean
  }>(),
  {
    breakpoints: () => [0, 0.5, 1],
    initialBreakpoint: 0.5,
    handle: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <IonModal
    :is-open="modelValue"
    :breakpoints="breakpoints"
    :initial-breakpoint="initialBreakpoint"
    :handle="handle"
    :expand-to-scroll="false"
    class="ui-sheet"
    @did-dismiss="emit('update:modelValue', false)"
  >
    <IonContent :scroll-y="true" class="ui-sheet__content">
      <header v-if="$slots.header" class="ui-sheet__header">
        <slot name="header" />
      </header>
      <div class="ui-sheet__body">
        <slot />
      </div>
    </IonContent>
  </IonModal>
</template>

<style scoped>
.ui-sheet__content {
  --padding-start: var(--size-gutter);
  --padding-end: var(--size-gutter);
  --padding-top: var(--size-gutter);
  --padding-bottom: calc(var(--size-gutter) + var(--ion-safe-area-bottom));
}

.ui-sheet__header {
  margin-bottom: calc(var(--size-gutter) * 0.5);
}

.ui-sheet__body {
  color: var(--color-fg);
  font-family: var(--font-sans);
}
</style>
