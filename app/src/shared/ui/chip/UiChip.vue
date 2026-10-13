<script setup lang="ts">
withDefaults(
  defineProps<{
    selected?: boolean
    disabled?: boolean
  }>(),
  { selected: false, disabled: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    class="ui-chip"
    :class="{ 'ui-chip--selected': selected }"
    :aria-pressed="selected"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-chip {
  display: inline-flex;
  flex: none;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: calc(var(--size-gutter) * 0.28) calc(var(--size-gutter) * 0.85);
  border: none;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1.5px var(--color-stroke);
  color: var(--color-fg-muted);
  font-family: var(--font-sans);
  font-size: var(--fs-meta);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fade) var(--motion-ease-standard),
    color var(--motion-duration-fade) var(--motion-ease-standard);
}

.ui-chip--selected {
  background: var(--tint, var(--color-fg));
  box-shadow: none;
  color: var(--on-tint, var(--color-bg));
}

.ui-chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
