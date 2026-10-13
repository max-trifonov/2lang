<script setup lang="ts">
import { computed } from 'vue'

import { article } from '../catalog'
import type { Entry } from '../domain/types'

// Артикль в цвете рода (LNG-S1-029, AC-4): род запоминается вместе со словом.
// Артикли есть только у испанских существительных — отсюда lang="es".
const props = defineProps<{ word: Pick<Entry, 'lemma' | 'gender'> }>()
const text = computed(() => article(props.word))
</script>

<template>
  <span v-if="text" lang="es" class="article" :class="`article--${word.gender}`">{{ text }}</span>
</template>

<style scoped>
.article {
  font-weight: 600;
}

.article--m {
  color: var(--gender-m);
}

.article--f {
  color: var(--gender-f);
}

.article--mf {
  background: linear-gradient(90deg, var(--gender-m), var(--gender-f));
  background-clip: text;
  color: transparent;
}
</style>
