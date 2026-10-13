<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Бейдж языка: код в цвете языка; полное имя — для скринридера и по желанию рядом.
withDefaults(defineProps<{ lang: string; label?: boolean }>(), { label: false })
const { t } = useI18n()
</script>

<template>
  <span class="lang-badge" :data-lang="lang">
    <span class="lang-badge__code" :aria-label="t(`profiles.lang.${lang}`)">{{
      lang.toUpperCase()
    }}</span>
    <span v-if="label" class="lang-badge__name" aria-hidden="true">{{
      t(`profiles.lang.${lang}`)
    }}</span>
  </span>
</template>

<style scoped>
.lang-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: var(--tint-ink);
  font-weight: 600;
}

.lang-badge__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.1em;
  height: 1.6em;
  padding: 0 0.45em;
  border-radius: var(--radius-xs);
  background: var(--tint);
  color: var(--on-tint);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.lang-badge__name {
  font-size: var(--fs-meta);
}
</style>
