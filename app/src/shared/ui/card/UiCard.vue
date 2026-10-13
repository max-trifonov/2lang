<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    interactive?: boolean
    tag?: 'div' | 'button' | 'a'
  }>(),
  { interactive: false, tag: 'div' },
)

const slots = useSlots()
const rootTag = computed(() => (props.interactive && props.tag === 'div' ? 'button' : props.tag))
const hasMedia = computed(() => Boolean(slots.media))
</script>

<template>
  <component
    :is="rootTag"
    class="ui-card"
    :class="{ 'ui-card--interactive': interactive }"
    :type="rootTag === 'button' ? 'button' : undefined"
  >
    <div v-if="hasMedia" class="ui-card__media">
      <slot name="media" />
    </div>
    <div class="ui-card__body">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.ui-card {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0 0 var(--size-gutter);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow:
    inset 0 0 0 1px var(--color-stroke),
    var(--shadow-card);
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-size: var(--fs-small);
  text-align: left;
  text-decoration: none;
}

.ui-card--interactive {
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.ui-card--interactive:active {
  transform: scale(0.985);
}

.ui-card__media {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ui-card__body {
  padding: var(--size-gutter) var(--size-gutter) 0;
}
</style>
