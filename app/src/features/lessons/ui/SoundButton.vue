<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { volumeHighOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

import { showToast } from '@/shared/ui'

import { playSound } from '../audio'

// Кнопка звука (LNG-S1-028, D-36): запись из content/audio, затем цепочка speak; кнопка есть
// всегда, ничего не прозвучало — подсказка.
const props = defineProps<{ text: string; lang: string; audio?: string | undefined }>()
const { t } = useI18n()

async function play(): Promise<void> {
  const source = await playSound(props.audio, props.text, props.lang)
  if (source === 'none') void showToast(t('speech.unavailable'))
}
</script>

<template>
  <button
    type="button"
    class="sound"
    :aria-label="t('dictionary.card.speak', { text })"
    @click.stop="play"
  >
    <IonIcon :icon="volumeHighOutline" aria-hidden="true" />
  </button>
</template>

<style scoped>
.sound {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--tint-soft, var(--color-chip));
  color: var(--tint-ink, var(--color-fg));
  font-size: 1.15rem;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.sound:active {
  transform: scale(0.9);
}

.sound:focus-visible {
  outline: 2px solid var(--tint, var(--color-fg));
}
</style>
