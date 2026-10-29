<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { GrammarRule } from '../domain/types'
import CodeText from './CodeText.vue'
import Timeline from './Timeline.vue'

// Правило на одном экране (curriculum, D-8): формула, 1–3 фразы, таблица, линия времени.
// Тот же блок — в плеере урока и в справочнике.
defineProps<{ rule: GrammarRule; lang: string }>()
const { locale } = useI18n()
const local = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? ''
/** Ячейка на изучаемом языке: таблицы смешивают формы и русские пояснения — кириллица не он. */
const own = (cell: string) => !/\p{Script=Cyrillic}/u.test(cell)
</script>

<template>
  <div class="rule">
    <p v-if="rule.formula" class="rule__formula" :lang="lang">{{ rule.formula }}</p>
    <p class="rule__text"><CodeText :text="local(rule.text)" /></p>
    <div v-if="rule.table" class="rule__table-wrap">
      <table class="rule__table">
        <thead>
          <tr>
            <th v-for="(h, i) in rule.table.head" :key="i" scope="col">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in rule.table.rows" :key="r">
            <td v-for="(cell, c) in row" :key="c" :lang="c > 0 && own(cell) ? lang : undefined">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Timeline v-if="rule.timeline?.length" :segments="rule.timeline" />
  </div>
</template>

<style scoped>
.rule {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
}

.rule__formula {
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.rule__text {
  margin: 0;
  font-size: var(--fs-h3);
  line-height: 1.55;
}

/* Таблица шире экрана прокручивается сама, страница — нет. */
.rule__table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.rule__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-meta);
}

.rule__table th,
.rule__table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-stroke);
  text-align: left;
  vertical-align: top;
}

.rule__table th {
  background: var(--color-surface);
  color: var(--color-fg-muted);
  font-weight: 650;
}

.rule__table tr:last-child td {
  border-bottom: 0;
}

.rule__table td[lang] {
  color: var(--tint-ink);
  font-weight: 550;
}
</style>
