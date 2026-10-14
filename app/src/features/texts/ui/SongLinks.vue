<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { musicalNotes } from 'ionicons/icons'

import type { TextDoc } from '../domain/types'

// Песни с правилом (D-42): из темы грамматики и справочника — в урок по песне.
defineProps<{ songs: readonly TextDoc[]; title?: string }>()
</script>

<template>
  <nav v-if="songs.length" class="song-links" :aria-label="title">
    <p v-if="title" class="song-links__title">{{ title }}</p>
    <RouterLink
      v-for="s in songs"
      :key="s.id"
      :to="`/songs/${s.id}`"
      class="song-links__item"
      :data-lang="s.lang"
    >
      <IonIcon :icon="musicalNotes" aria-hidden="true" />
      <span class="song-links__text" :lang="s.lang">{{ s.title[s.lang] }}</span>
      <span v-if="s.performer" class="song-links__meta">{{ s.performer }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.song-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.song-links__title {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.song-links__item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  color: var(--color-fg);
  text-decoration: none;
}

.song-links__item ion-icon {
  flex: none;
  color: var(--tint);
}

.song-links__text {
  flex: 1;
  min-width: 0;
}

.song-links__meta {
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
}
</style>
