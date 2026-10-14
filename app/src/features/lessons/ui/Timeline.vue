<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { GrammarRule } from '../domain/types'

// Линия времени правила (D-22): отрезки past / now / future данными — рисуем полосой или точкой.
defineProps<{ segments: NonNullable<GrammarRule['timeline']> }>()
const { t, locale } = useI18n()

const POS = { past: 12, now: 50, future: 88 } as const
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const span = (from: keyof typeof POS, until?: keyof typeof POS) => {
  const a = POS[from]
  const b = POS[until ?? from]
  return { left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%` }
}
</script>

<template>
  <figure class="timeline">
    <div v-for="(s, i) in segments" :key="i" class="timeline__row">
      <div class="timeline__track" aria-hidden="true">
        <span class="timeline__now" />
        <span
          class="timeline__seg"
          :class="{ 'timeline__seg--point': !s.until || s.until === s.from }"
          :style="span(s.from, s.until)"
        />
      </div>
      <figcaption v-if="s.label" class="timeline__label">{{ local(s.label) }}</figcaption>
    </div>
    <div class="timeline__axis" aria-hidden="true">
      <span>{{ t('lessons.grammar.time.past') }}</span>
      <span>{{ t('lessons.grammar.time.now') }}</span>
      <span>{{ t('lessons.grammar.time.future') }}</span>
    </div>
  </figure>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.timeline__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline__track {
  position: relative;
  height: 14px;
  border-radius: 7px;
  background: var(--color-chip);
}

.timeline__now {
  position: absolute;
  top: -4px;
  bottom: -4px;
  left: 50%;
  width: 2px;
  background: var(--color-fg-subtle);
}

.timeline__seg {
  position: absolute;
  top: 0;
  height: 100%;
  min-width: 14px;
  border-radius: 7px;
  background: var(--tint);
}

.timeline__seg--point {
  width: 14px !important;
  transform: translateX(-7px);
}

.timeline__label {
  color: var(--color-fg-muted);
  font-size: var(--fs-small);
}

.timeline__axis {
  display: flex;
  justify-content: space-between;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 600;
}
</style>
