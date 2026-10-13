<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import * as ionicons from 'ionicons/icons'
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    variant: 'empty' | 'error' | 'no-access'
    icon: string
    title: string
    description?: string | undefined
  }>(),
  { description: undefined },
)

const slots = useSlots()
const hasAction = computed(() => Boolean(slots.action))

function resolveIcon(name: string): string | undefined {
  const key = name.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase())
  return (ionicons as Record<string, string>)[key] ?? (ionicons as Record<string, string>)[name]
}

const iconData = computed(() => resolveIcon(props.icon))
</script>

<template>
  <div class="ui-empty" :data-variant="variant" role="status">
    <IonIcon v-if="iconData" class="ui-empty__icon" :icon="iconData" aria-hidden="true" />
    <h3 class="ui-empty__title">{{ title }}</h3>
    <p v-if="description" class="ui-empty__description">{{ description }}</p>
    <div v-if="hasAction" class="ui-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: calc(var(--size-gutter) * 1.33);
}

.ui-empty__icon {
  box-sizing: content-box;
  padding: 18px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-xl);
  background: var(--tint-soft, var(--color-chip));
  color: var(--tint-ink, var(--color-fg-muted));
  font-size: 2rem;
}

.ui-empty[data-variant='error'] .ui-empty__icon {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

.ui-empty__title {
  margin: 0 0 calc(var(--size-gutter) * 0.33);
  font-family: var(--font-sans);
  font-size: var(--fs-h2);
  color: var(--color-fg);
}

.ui-empty__description {
  margin: 0 0 var(--size-gutter);
  font-size: var(--fs-meta);
  color: var(--color-fg-subtle);
}
</style>
