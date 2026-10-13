<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ value: number; size?: number; stroke?: number; label?: string | undefined }>(),
  { size: 96, stroke: 10, label: undefined },
)

const r = computed(() => (props.size - props.stroke) / 2)
const length = computed(() => 2 * Math.PI * r.value)
const share = computed(() => Math.min(1, Math.max(0, props.value)))
</script>

<template>
  <div
    class="ui-ring"
    role="progressbar"
    :aria-valuenow="Math.round(share * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
      <circle class="ui-ring__track" :cx="size / 2" :cy="size / 2" :r="r" :stroke-width="stroke" />
      <circle
        class="ui-ring__value"
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        :stroke-width="stroke"
        :stroke-dasharray="length"
        :stroke-dashoffset="length * (1 - share)"
      />
    </svg>
    <div class="ui-ring__center">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-ring {
  position: relative;
  flex: none;
}

.ui-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ui-ring circle {
  fill: none;
}

.ui-ring__track {
  stroke: var(--ring-track, var(--color-chip));
}

.ui-ring__value {
  stroke: var(--ring-color, var(--tint, var(--color-fg)));
  stroke-linecap: round;
  transition: stroke-dashoffset 700ms var(--motion-ease-standard);
}

@media (prefers-reduced-motion: reduce) {
  .ui-ring__value {
    transition: none;
  }
}

.ui-ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
