<script setup lang="ts">
import { computed } from 'vue'

import { highlightParts } from './highlight'

const props = withDefaults(defineProps<{ text: string; lemma: string; forms?: string[] }>(), {
  forms: () => [],
})
const parts = computed(() => highlightParts(props.text, props.lemma, props.forms))
</script>

<template>
  <span
    ><template v-for="(p, i) in parts" :key="i"
      ><mark v-if="p.hit" class="hl">{{ p.text }}</mark
      ><template v-else>{{ p.text }}</template></template
    ></span
  >
</template>

<style scoped>
.hl {
  padding: 0 0.08em;
  border-radius: 4px;
  background: linear-gradient(transparent 58%, var(--tint-soft, var(--reward-soft)) 58%);
  color: var(--tint-ink, inherit);
  font-weight: 600;
}
</style>
