<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="boot-screen" role="status" :aria-label="t('boot.loading')">
    <p class="boot-screen__name">{{ t('app.name') }}</p>
  </div>
</template>

<style scoped>
.boot-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
}

.boot-screen__name {
  margin: 0;
  font-size: var(--fs-h1);
  font-weight: 700;
}
</style>
