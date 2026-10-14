<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { bookOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

import type { GrammarLesson } from '../domain/types'
import { ruleRoute } from '../refs'

// Отсылки к правилам (D-38): чипы «правило» ведут в карточку справочника.
defineProps<{ rules: readonly GrammarLesson[]; title?: string }>()
const { locale } = useI18n()
const local = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? ''
</script>

<template>
  <nav v-if="rules.length" class="rule-links" :aria-label="title">
    <p v-if="title" class="rule-links__title">{{ title }}</p>
    <RouterLink
      v-for="r in rules"
      :key="r.id"
      :to="ruleRoute(r.id)"
      class="rule-links__item"
      :data-lang="r.lang"
    >
      <IonIcon :icon="bookOutline" aria-hidden="true" />
      <span class="rule-links__text">{{ local(r.title) }}</span>
      <span v-if="r.code" class="rule-links__code">{{ r.code }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.rule-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rule-links__title {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.rule-links__item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  color: var(--color-fg);
  text-decoration: none;
}

.rule-links__item ion-icon {
  flex: none;
  color: var(--tint);
  font-size: 1.1rem;
}

.rule-links__text {
  flex: 1;
  min-width: 0;
  font-weight: 550;
}

.rule-links__code {
  flex: none;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 650;
}
</style>
