<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'lg' | 'md' | 'sm'
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
  }>(),
  { variant: 'primary', size: 'md', disabled: false, loading: false, fullWidth: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function handleClick(event: MouseEvent): void {
  if (props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--full': fullWidth, 'ui-button--loading': loading },
    ]"
    :disabled="disabled"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || loading || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <span class="ui-button__content" :class="{ 'ui-button__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
/* Заливка — цвет контейнера (--tint, например язык урока), иначе чернильная нейтральная. */
.ui-button {
  position: relative;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 44px;
  padding: calc(var(--size-gutter) * 0.78) calc(var(--size-gutter) * 1.25);
  border: none;
  border-radius: var(--radius-xl);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  font-weight: 650;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fade) var(--motion-ease-standard),
    transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.ui-button--lg {
  min-height: 56px;
  font-size: var(--fs-h3);
}

.ui-button--sm {
  min-height: 40px;
  padding: calc(var(--size-gutter) * 0.44) calc(var(--size-gutter) * 0.9);
  font-size: var(--fs-meta);
}

.ui-button--full {
  width: 100%;
}

.ui-button:disabled,
.ui-button[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.45;
}

.ui-button--primary {
  background: var(--tint, var(--color-fg));
  color: var(--on-tint, var(--color-bg));
}

.ui-button:active:not(:disabled) {
  transform: scale(0.97);
}

.ui-button--primary:active:not(:disabled) {
  filter: brightness(0.92);
}

.ui-button--secondary {
  background: var(--color-surface);
  color: var(--tint-ink, var(--color-fg));
  box-shadow: inset 0 0 0 1.5px var(--color-chip-strong);
}

.ui-button--ghost {
  background: var(--tint-soft, var(--color-chip));
  color: var(--tint-ink, var(--color-fg));
}

.ui-button__content--hidden {
  visibility: hidden;
}

.ui-button__spinner {
  position: absolute;
  width: 1.25em;
  height: 1.25em;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ui-button-spin calc(var(--motion-duration-fade) * 2) linear infinite;
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
