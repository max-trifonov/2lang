<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    shape?: 'text' | 'circle' | 'rect'
    width?: string | undefined
    height?: string | undefined
  }>(),
  { shape: 'text', width: undefined, height: undefined },
)

const style = computed(() => {
  const result: Record<string, string> = {}
  if (props.width) result.width = props.width
  if (props.height) result.height = props.height
  if (props.shape === 'circle') {
    result.borderRadius = '50%'
    if (!props.width) result.width = '2.5rem'
    if (!props.height) result.height = props.width ?? '2.5rem'
  }
  return result
})
</script>

<template>
  <div class="ui-skeleton" :class="`ui-skeleton--${shape}`" :style="style" aria-hidden="true" />
</template>

<style scoped>
.ui-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-chip) 0%,
    var(--color-chip-strong) 50%,
    var(--color-chip) 100%
  );
  background-size: 200% 100%;
  animation: ui-skeleton-shimmer var(--motion-duration-fade) var(--motion-ease-standard) infinite
    alternate;
}

.ui-skeleton--text {
  width: 100%;
  height: 1em;
  border-radius: var(--radius-xs);
}

.ui-skeleton--rect {
  width: 100%;
  height: 8rem;
  border-radius: var(--radius-md);
}

@keyframes ui-skeleton-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}
</style>
