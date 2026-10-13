<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    interactive?: boolean
    tag?: 'div' | 'button' | 'a'
  }>(),
  { interactive: false, tag: 'div' },
)

const rootTag = computed(() => (props.interactive && props.tag === 'div' ? 'button' : props.tag))
</script>

<template>
  <li class="ui-list-item">
    <component
      :is="rootTag"
      class="ui-list-item__row"
      :class="{ 'ui-list-item__row--interactive': interactive }"
      :type="rootTag === 'button' ? 'button' : undefined"
    >
      <span class="ui-list-item__content">
        <slot />
      </span>
    </component>
    <!-- Слот end — сосед строки, а не её содержимое: в интерактивной строке (button)
         кнопка в слоте была бы кнопкой в кнопке — невалидный HTML и путаница для скринридера. -->
    <span v-if="$slots.end" class="ui-list-item__end">
      <slot name="end" />
    </span>
  </li>
</template>

<style scoped>
.ui-list-item {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.ui-list-item:not(:first-child) {
  border-top: 1px solid var(--color-stroke);
}

.ui-list-item__row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: calc(var(--size-gutter) * 0.75) var(--size-gutter);
  border: none;
  background: transparent;
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  text-align: left;
}

.ui-list-item__row--interactive {
  cursor: pointer;
  transition: background-color var(--motion-duration-fade) var(--motion-ease-standard);
}

.ui-list-item__row--interactive:active {
  background: var(--color-surface-alt);
}

.ui-list-item__content {
  flex: 1;
}

.ui-list-item__end {
  display: flex;
  flex: none;
  align-items: center;
  padding-right: calc(var(--size-gutter) * 0.5);
}
</style>
