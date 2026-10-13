<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { Issue } from '@/features/content'
import { issueMessage } from '@/features/content'
import type { ImportOutcome } from '../store'

// Итог загрузки по каждому файлу (AC-2, AC-3, AC-5): что случилось и где именно проблемы.
defineProps<{ outcomes: ImportOutcome[] }>()

const { t } = useI18n()
const ok = new Set(['added', 'replaced', 'unchanged'])

const where = (issue: Issue) => issue.path || t('texts.ui.wholeFile')
</script>

<template>
  <ul class="import-results">
    <li v-for="(o, i) in outcomes" :key="i" class="import-results__file">
      <p class="import-results__name">{{ o.title ?? o.fileName }}</p>
      <p v-if="o.title" class="import-results__file-name">{{ o.fileName }}</p>
      <p
        class="import-results__status"
        :class="ok.has(o.status) ? 'import-results__status--ok' : 'import-results__status--bad'"
      >
        {{ t(`texts.ui.status.${o.status}`) }}
      </p>
      <p v-if="o.phrases && o.status === 'replaced'" class="import-results__meta">
        {{ t('texts.ui.phrases', { ...o.phrases }) }}
      </p>

      <template v-if="o.errors.length > 0">
        <p class="import-results__heading">
          {{ t('texts.ui.errorsHeading', { n: o.errors.length }) }}
        </p>
        <ul class="import-results__issues">
          <li v-for="(issue, k) in o.errors" :key="k">
            <code>{{ where(issue) }}</code>
            {{ issueMessage(issue, t) }}
          </li>
        </ul>
      </template>

      <template v-if="o.warnings.length > 0">
        <p class="import-results__heading">
          {{ t('texts.ui.warningsHeading', { n: o.warnings.length }) }}
        </p>
        <ul class="import-results__issues import-results__issues--warn">
          <li v-for="(issue, k) in o.warnings" :key="k">
            <code>{{ where(issue) }}</code>
            {{ issueMessage(issue, t) }}
          </li>
        </ul>
      </template>
    </li>
  </ul>
</template>

<style scoped>
.import-results,
.import-results__issues {
  margin: 0;
  padding: 0;
  list-style: none;
}

.import-results__file {
  padding: var(--size-gutter) 0;
  border-bottom: 1px solid var(--color-stroke);
}

.import-results__file:last-child {
  border-bottom: 0;
}

.import-results__name {
  margin: 0;
  font-weight: 600;
}

.import-results__file-name,
.import-results__meta {
  margin: 0;
  color: var(--color-fg-subtle);
  font-size: 0.875rem;
}

.import-results__status {
  margin: calc(var(--size-gutter) * 0.25) 0;
}

.import-results__status--ok {
  color: var(--color-success);
}

.import-results__status--bad {
  color: var(--color-danger);
}

.import-results__heading {
  margin: calc(var(--size-gutter) * 0.5) 0 calc(var(--size-gutter) * 0.25);
  font-weight: 600;
}

.import-results__issues li {
  margin-bottom: calc(var(--size-gutter) * 0.5);
  padding-left: calc(var(--size-gutter) * 0.5);
  border-left: 3px solid var(--color-danger);
  overflow-wrap: anywhere;
}

.import-results__issues--warn li {
  border-left-color: var(--color-accent);
}

.import-results__issues code {
  display: block;
  color: var(--color-fg-muted);
  font-size: 0.8125rem;
}
</style>
