<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { volumeHigh } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

import { showToast } from '@/shared/ui'

import { say } from '../audio'

// Озвучка (LNG-S1-015, D-36): кнопка есть всегда, источник — при нажатии (запись слова →
// голос устройства → онлайн); ничего не прозвучало — подсказка.
const props = withDefaults(defineProps<{ text: string; lang: string; size?: 'md' | 'lg' }>(), {
  size: 'md',
})
const { t } = useI18n()

async function play(): Promise<void> {
  if ((await say(props.text, props.lang)) === 'none') void showToast(t('speech.unavailable'))
}
</script>

<template>
  <button
    type="button"
    class="speak"
    :class="`speak--${size}`"
    :data-lang="lang"
    :aria-label="t('dictionary.card.speak', { text })"
    @click.stop="play"
  >
    <IonIcon :icon="volumeHigh" aria-hidden="true" />
  </button>
</template>

<style scoped>
.speak {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-size: 1.15rem;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.speak--lg {
  width: 56px;
  height: 56px;
  background: var(--tint);
  color: var(--on-tint);
  font-size: 1.6rem;
}

.speak:active {
  transform: scale(0.9);
}
</style>
