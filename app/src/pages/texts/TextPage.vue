<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { alertCircleOutline, searchOutline } from 'ionicons/icons'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useProfilesStore } from '@/features/profiles'
import { useCardsStore } from '@/features/review'
import { SpeakButton, loadLanguage, type CatalogEntry } from '@/features/dictionary'
import { CodeText, RuleLinks, grammarRefs, loadLessons, type Lesson } from '@/features/lessons'
import {
  expandStanzas,
  findEntry,
  lineWords,
  loadBundledTexts,
  mergeLibrary,
  phraseCardKey,
  textIn,
  translationOf,
  useTextsStore,
  type Line,
  type TextDoc,
  type Word,
} from '@/features/texts'
import { UiButton, UiChip, UiEmptyState, UiSheet, UiSkeleton } from '@/shared/ui'

// Чтение текста (LNG-S1-026): /texts/:id — строфы, перевод рядом, разбор строки по нажатию.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const texts = useTextsStore()
const profiles = useProfilesStore()
const cards = useCardsStore()

const doc = ref<TextDoc | null>(null)
const loading = ref(true)
const failed = ref(false)
const open = ref<string | null>(null) // «строфа:строка» с раскрытым разбором
const picked = ref<Word | null>(null)
const showWord = ref(false)
const dictionary = ref<CatalogEntry[]>([])
const lessons = ref<Lesson[]>([])

async function load(): Promise<void> {
  loading.value = true
  failed.value = false
  try {
    await texts.ready()
    const items = mergeLibrary(await loadBundledTexts(), texts.texts)
    doc.value = items.find((i) => i.doc.id === String(route.params.id))?.doc ?? null
    if (doc.value) dictionary.value = await loadLanguage(doc.value.lang).catch(() => [])
    // Правила текста (D-47): отсылки `see` — ссылками в справочник; сбой их просто прячет.
    lessons.value = await loadLessons().catch(() => [])
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (cards.profileId !== profiles.activeId)
    await cards.forProfile(profiles.activeId).catch(() => undefined)
  await load()
})

// Фраза в повторение (LNG-S1-027): повторное нажатие карточку не меняет.
const inReview = (original: string) =>
  !!doc.value && !!cards.get(phraseCardKey(doc.value, original))
async function addToReview(original: string): Promise<void> {
  if (doc.value && !inReview(original)) await cards.addPhrase(phraseCardKey(doc.value, original))
}

const lang = computed(() => doc.value?.lang ?? '')
const rules = computed(() => grammarRefs(doc.value?.see, lessons.value))
const stanzas = computed(() => (doc.value ? expandStanzas(doc.value) : []))
const title = computed(() => (doc.value ? textIn({ ...doc.value.title }, doc.value.lang) : ''))

const original = (line: Line) => textIn(line, lang.value) ?? ''
const translation = (line: Line) => translationOf(line, lang.value, locale.value)
const local = (l: Record<string, string> | undefined) =>
  l ? translationOf(l, lang.value, locale.value)?.text : undefined
const formOf = (w: Word) => textIn(w, lang.value) ?? ''
const entryOf = (w: Word) => findEntry(dictionary.value, { form: formOf(w), lemma: w.lemma })

function toggle(key: string): void {
  open.value = open.value === key ? null : key
}

function pick(w: Word): void {
  picked.value = w
  showWord.value = true
}

const pickedEntry = computed(() => (picked.value ? entryOf(picked.value) : undefined))
const pickedTr = computed(() =>
  picked.value ? translationOf(picked.value, lang.value, locale.value) : undefined,
)
const entryTr = (e: CatalogEntry) =>
  e.translations[locale.value] ?? e.translations.ru ?? Object.values(e.translations)[0]

function openWord(e: CatalogEntry): void {
  showWord.value = false
  void router.push(`/dictionary/${e.lang}/${e.id}`)
}
</script>

<template>
  <IonPage :data-lang="lang || undefined">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/texts" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ title || t('texts.ui.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <UiEmptyState
        v-if="failed"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('texts.ui.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('texts.ui.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="loading">
        <UiSkeleton v-for="n in 4" :key="n" class="read__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="!doc"
        variant="empty"
        :icon="searchOutline"
        :title="t('texts.ui.read.notFound')"
        :description="t('texts.ui.read.notFoundHint')"
      />

      <template v-else>
        <p v-if="doc.author || doc.performer" class="read__meta">
          {{ [doc.author, doc.performer].filter(Boolean).join(' · ') }}
        </p>
        <p v-if="local(doc.note)" class="read__note"><CodeText :text="local(doc.note)" /></p>
        <UiButton full-width class="read__lesson" @click="router.push(`/songs/${doc.id}`)">{{
          t('songs.start')
        }}</UiButton>
        <RuleLinks :rules="rules" :title="t('songs.rules')" class="read__rules" />

        <section v-for="(s, si) in stanzas" :key="si" class="read__stanza">
          <h2 v-if="s.speaker" class="read__label" :lang="lang">{{ s.speaker }}</h2>
          <h2 v-else-if="s.type !== 'verse' || s.repeat" class="read__label">
            {{ t(`texts.ui.read.stanza.${s.type}`) }}
            <template v-if="s.repeat"> · {{ t('texts.ui.read.repeat') }}</template>
          </h2>
          <div v-for="(line, li) in s.lines" :key="li" class="read__line">
            <div class="read__row">
              <button
                type="button"
                class="read__text"
                :lang="lang"
                :aria-expanded="open === `${si}:${li}`"
                :aria-label="
                  open === `${si}:${li}`
                    ? t('texts.ui.read.hideDetails')
                    : t('texts.ui.read.showDetails')
                "
                @click="toggle(`${si}:${li}`)"
              >
                {{ original(line) }}
              </button>
              <SpeakButton :text="original(line)" :lang="lang" />
            </div>
            <p v-if="translation(line)" class="read__tr" :lang="translation(line)!.lang">
              {{ translation(line)!.text }}
            </p>
            <p v-else class="read__tr read__tr--none">{{ t('texts.ui.read.noTranslation') }}</p>

            <div v-if="open === `${si}:${li}`" class="read__detail">
              <p v-if="local(line.lit)">
                <strong>{{ t('texts.ui.read.literal') }}:</strong> {{ local(line.lit) }}
              </p>
              <p v-if="local(line.note)">
                <strong>{{ t('texts.ui.read.note') }}:</strong>
                <CodeText :text="local(line.note)" />
              </p>
              <template v-if="line.phrases?.length">
                <h3>{{ t('texts.ui.read.phrases') }}</h3>
                <ul class="read__phrases">
                  <li v-for="(p, pi) in line.phrases" :key="pi">
                    <span :lang="lang"
                      ><strong>{{ textIn(p, lang) }}</strong></span
                    >
                    <SpeakButton :text="textIn(p, lang) ?? ''" :lang="lang" />
                    <UiButton
                      variant="secondary"
                      size="sm"
                      :disabled="inReview(textIn(p, lang) ?? '')"
                      @click="addToReview(textIn(p, lang) ?? '')"
                    >
                      {{
                        inReview(textIn(p, lang) ?? '')
                          ? t('texts.ui.read.inReview')
                          : t('texts.ui.read.addToReview')
                      }}
                    </UiButton>
                    — {{ translationOf(p, lang, locale)?.text }}
                    <span v-if="local(p.note)" class="read__phrase-note"
                      ><CodeText :text="local(p.note)"
                    /></span>
                  </li>
                </ul>
              </template>
              <h3>{{ t('texts.ui.read.words') }}</h3>
              <div class="read__words">
                <UiChip v-for="(w, wi) in lineWords(line, lang)" :key="wi" @click="pick(w)">
                  {{ formOf(w) }}
                </UiChip>
              </div>
            </div>
          </div>
        </section>
      </template>

      <UiSheet v-model="showWord" :initial-breakpoint="0.5" :breakpoints="[0, 0.5, 1]">
        <template v-if="picked" #header>
          <h2 class="read__sheet-title" :lang="lang">{{ formOf(picked) }}</h2>
        </template>
        <template v-if="picked">
          <p v-if="pickedTr" class="read__sheet-tr">{{ pickedTr.text }}</p>
          <p v-if="picked.lemma || picked.pos" class="read__meta">
            <template v-if="picked.lemma">{{ picked.lemma }}</template>
            <template v-if="picked.pos"> · {{ picked.pos }}</template>
          </p>
          <template v-if="pickedEntry">
            <p v-if="!pickedTr">{{ entryTr(pickedEntry) }}</p>
            <UiButton full-width variant="secondary" @click="openWord(pickedEntry)">
              {{ t('texts.ui.read.openWord') }}
            </UiButton>
          </template>
        </template>
      </UiSheet>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.read__skeleton {
  height: 56px;
  margin-bottom: calc(var(--size-gutter) * 0.5);
}

.read__meta,
.read__note {
  color: var(--color-fg-muted);
  font-size: 0.875rem;
}

.read__lesson {
  margin-bottom: var(--size-gutter);
}

.read__rules {
  margin-bottom: calc(var(--size-gutter) * 1.5);
}

.read__stanza {
  margin-bottom: calc(var(--size-gutter) * 1.5);
}

.read__label {
  display: inline-block;
  margin: 0 0 8px;
  padding: 2px 10px;
  border-radius: var(--radius-xl);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-size: var(--fs-small);
  font-weight: 650;
}

.read__line {
  margin-bottom: var(--size-gutter);
}

.read__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.read__text {
  flex: 1;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-fg);
  font: inherit;
  font-family: var(--font-lang);
  font-size: 1.25rem;
  font-weight: 550;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
}

.read__text[aria-expanded='true'] {
  color: var(--tint-ink);
}

.read__tr {
  margin: 2px 0 0;
  color: var(--color-fg-muted);
}

.read__tr[lang] {
  font-family: var(--font-sans);
}

.read__tr--none {
  font-style: italic;
}

.read__detail {
  margin-top: 10px;
  padding: 10px 14px;
  border-left: 3px solid var(--tint);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.read__detail h3 {
  margin: 8px 0 4px;
  font-size: 0.875rem;
}

.read__phrases {
  margin: 0;
  padding-left: 1.1em;
}

.read__phrase-note {
  display: block;
  color: var(--color-fg-muted);
  font-size: 0.875rem;
}

.read__words {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.read__sheet-title {
  margin: 0;
}

.read__sheet-tr {
  font-size: 1.125rem;
}
</style>
