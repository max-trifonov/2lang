<script setup lang="ts">
import { computed } from 'vue'

import type { ProfileColor } from '../domain/profile'

import './profile-colors.css'

const props = withDefaults(
  defineProps<{ name: string; color: ProfileColor; size?: 'sm' | 'lg' }>(),
  { size: 'sm' },
)

// Первая буква с учётом суррогатных пар: эмодзи в начале имени не рвётся пополам.
const initial = computed(() => Array.from(props.name.trim())[0]?.toLocaleUpperCase() ?? '?')
</script>

<template>
  <span
    class="profile-avatar"
    :class="`profile-avatar--${size}`"
    :style="{ background: `var(--profile-${color})` }"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>

<style scoped>
.profile-avatar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  color: var(--profile-on-color);
  font-weight: 600;
}

.profile-avatar--sm {
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
}

.profile-avatar--lg {
  width: 64px;
  height: 64px;
  font-size: 1.75rem;
}
</style>
