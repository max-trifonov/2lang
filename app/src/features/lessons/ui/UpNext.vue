<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { arrowForward, school } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

import type { Lesson } from '../domain/types'

// «Дальше» на итоге урока (D-40): следующий шаг пути — урок слов или новое правило — без
// возврата во вкладку, так уроки и грамматика идут одной цепочкой.
defineProps<{ lesson: Lesson }>()
defineEmits<{ go: [] }>()
const { t, locale } = useI18n()
const local = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? ''
</script>

<template>
  <button type="button" class="up-next" :data-lang="lesson.lang" @click="$emit('go')">
    <span class="up-next__text">
      <span class="up-next__label">
        <IonIcon v-if="lesson.kind === 'grammar'" :icon="school" aria-hidden="true" />
        {{ t(lesson.kind === 'grammar' ? 'lessons.upNextGrammar' : 'lessons.upNext') }}
      </span>
      <strong>{{ local(lesson.title) }}</strong>
    </span>
    <span class="up-next__go" :aria-label="t('lessons.continue')">
      <IonIcon :icon="arrowForward" aria-hidden="true" />
    </span>
  </button>
</template>

<style scoped>
.up-next {
  display: flex;
  width: 100%;
  gap: 12px;
  align-items: center;
  padding: 14px 14px 14px 16px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--color-fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.up-next__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.up-next__label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.up-next__text strong {
  font-size: var(--fs-h3);
  line-height: 1.3;
}

.up-next__go {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-xl);
  background: var(--tint);
  color: var(--on-tint);
  font-size: 1.25rem;
}
</style>
