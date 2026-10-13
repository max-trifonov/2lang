<script setup lang="ts"></script>

<template>
  <ul class="ui-list">
    <slot />
  </ul>
</template>

<style scoped>
.ui-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  overflow: hidden;
}
</style>
