<script setup lang="ts">
import { computed, ref } from 'vue'

import { loadLessons } from '../loader'
import { splitCodes } from '../refs'

// Текст пояснения, где коды тем программы (EN-19, ES-P3) — ссылки на правило (D-47).
// Уроки грузятся один раз на все экземпляры; пока не загрузились — текст без ссылок.
const props = defineProps<{ text: string | undefined }>()

const known = ref<ReadonlySet<string>>(knownIds ?? new Set())
if (!knownIds) {
  void loadLessons()
    .then((all) => {
      knownIds = new Set(all.map((l) => l.id))
      known.value = knownIds
    })
    .catch(() => {})
}
const parts = computed(() => splitCodes(props.text ?? '', known.value))
</script>

<script lang="ts">
let knownIds: ReadonlySet<string> | null = null
</script>

<template>
  <template v-for="(p, i) in parts" :key="i">
    <RouterLink v-if="'route' in p" :to="p.route" class="code-link">{{ p.text }}</RouterLink>
    <template v-else>{{ p.text }}</template>
  </template>
</template>

<style scoped>
.code-link {
  color: var(--tint-ink, var(--tint));
  font-weight: 650;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  white-space: nowrap;
}
</style>
