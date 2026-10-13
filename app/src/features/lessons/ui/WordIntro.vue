<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SpeakButton, WordArticle, type CatalogEntry } from '@/features/dictionary'
import { HighlightText, formsOf } from '@/features/language'

// Карточка нового слова (LNG-S1-017, LNG-S1-030): слово крупно в цвете языка, озвучка,
// перевод, пример — по теме урока, иначе первый.
const props = defineProps<{ word: CatalogEntry; lang: string; topic?: string }>()
const { locale } = useI18n()

const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const example = computed(
  () => props.word.examples?.find((e) => e.topic === props.topic) ?? props.word.examples?.[0],
)
const exampleText = computed(() => {
  const ex = example.value as Record<string, unknown> | undefined
  return typeof ex?.[props.lang] === 'string' ? (ex[props.lang] as string) : ''
})
const exampleTr = computed(() => {
  const ex = example.value as Record<string, unknown> | undefined
  if (!ex) return ''
  return local(
    Object.fromEntries(
      Object.entries(ex).filter(
        (e): e is [string, string] =>
          e[0].length === 2 && e[0] !== props.lang && typeof e[1] === 'string',
      ),
    ),
  )
})
</script>

<template>
  <div class="intro__hero">
    <div class="intro__word">
      <WordArticle :word="word" class="intro__article" />
      <h1 :lang="lang">{{ word.lemma }}</h1>
    </div>
    <SpeakButton :text="word.lemma" :lang="lang" size="lg" />
    <p v-if="word.ipa" class="intro__ipa">[{{ word.ipa }}]</p>
    <p class="intro__tr">{{ local(word.translations) }}</p>
  </div>
  <div v-if="exampleText" class="intro__example">
    <div class="intro__line">
      <HighlightText
        :lang="lang"
        class="intro__example-text"
        :text="exampleText"
        :lemma="word.lemma"
        :forms="formsOf(word.forms)"
      />
      <SpeakButton :text="exampleText" :lang="lang" />
    </div>
    <span class="intro__muted">{{ exampleTr }}</span>
  </div>
</template>

<style scoped>
.intro__hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px var(--size-gutter);
  align-items: center;
  padding: calc(var(--size-gutter) * 1.5) calc(var(--size-gutter) * 1.25);
  border-radius: var(--radius-lg);
  background: var(--tint-soft);
}

.intro__hero > :not(.intro__word, .speak) {
  grid-column: 1 / -1;
}

.intro__word {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  align-items: baseline;
  min-width: 0;
}

.intro__word h1 {
  margin: 0;
  color: var(--tint-ink);
  font-size: clamp(2.4rem, 12vw, 3.2rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.intro__article {
  font-size: 1.5rem;
}

.intro__ipa {
  margin: 0;
  color: var(--color-fg-subtle);
  font-size: var(--fs-body);
}

.intro__tr {
  margin: 10px 0 0;
  font-size: var(--fs-h2);
  font-weight: 600;
}

.intro__example {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.intro__line {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.intro__example-text {
  font-size: 1.25rem;
  line-height: 1.4;
}

.intro__muted {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}
</style>
