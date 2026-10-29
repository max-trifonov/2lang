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
import { alertCircleOutline, textOutline } from 'ionicons/icons'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { SpeakButton } from '@/features/dictionary'
import {
  CodeText,
  alphabetOf,
  loadLessons,
  lessonRoute,
  soundLessons,
  type Lesson,
  type Letter,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { UiButton, UiChip, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Алфавит и чтение (D-48): буквы языка — название, звуки, слоги для тренировки, слова и ссылки
// на правила; ниже — все правила чтения из уроков звучания по урокам. Язык — ?lang=.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()

const lessons = ref<Lesson[] | null>(null)
const failed = ref(false)
const picked = ref<string | null>(null)

async function load(): Promise<void> {
  failed.value = false
  try {
    lessons.value = await loadLessons()
  } catch {
    failed.value = true
  }
}
void load()

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const langs = computed<string[]>(() => profiles.active?.languages ?? [])
const lang = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : (langs.value[0] ?? ''),
)
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''

const letters = computed(() => (lessons.value ? alphabetOf(lessons.value, lang.value) : []))
const sounds = computed(() => (lessons.value ? soundLessons(lessons.value, lang.value) : []))
const letter = computed(() => letters.value.find((l) => l.letter === picked.value) ?? null)
/** Правило чтения по id — для ссылок из карточки буквы. */
const ruleOwner = computed(() => {
  const out = new Map<string, { title: Record<string, string>; anchor: string }>()
  for (const s of sounds.value)
    for (const r of s.rules ?? []) out.set(r.id, { title: r.title, anchor: `rule-${r.id}` })
  return out
})

function setLang(l: string): void {
  picked.value = null
  void router.replace({ query: { ...route.query, lang: l } })
}

function pick(l: Letter): void {
  picked.value = picked.value === l.letter ? null : l.letter
}

function toRule(id: string): void {
  document.getElementById(`rule-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/lessons" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ t('alphabet.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding" :data-lang="lang || undefined">
      <div v-if="langs.length > 1" class="abc__langs" role="group">
        <UiChip
          v-for="l in langs"
          :key="l"
          :data-lang="l"
          :selected="l === lang"
          @click="setLang(l)"
        >
          {{ t(`profiles.lang.${l}`) }}
        </UiChip>
      </div>

      <UiEmptyState
        v-if="failed"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('lessons.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="!lessons">
        <UiSkeleton v-for="n in 3" :key="n" class="abc__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="!letters.length"
        variant="empty"
        :icon="textOutline"
        :title="t('alphabet.empty')"
      />

      <template v-else>
        <p class="abc__hint">{{ t('alphabet.hint') }}</p>
        <ul class="abc__grid" :aria-label="t('alphabet.letters')">
          <li v-for="l in letters" :key="l.letter">
            <button
              type="button"
              class="abc__cell"
              :class="{ 'abc__cell--on': l.letter === picked }"
              :aria-expanded="l.letter === picked"
              @click="pick(l)"
            >
              <strong :lang="lang">{{ l.letter.toUpperCase() }}{{ l.letter }}</strong>
              <span>{{ l.ipa ? `[${l.ipa}]` : l.name }}</span>
            </button>
          </li>
        </ul>

        <article v-if="letter" class="abc__card" aria-live="polite">
          <header class="abc__head">
            <span class="abc__big" :lang="lang"
              >{{ letter.letter.toUpperCase() }}{{ letter.letter }}</span
            >
            <span class="abc__name">
              <span :lang="lang">{{ letter.name }}</span>
              <span v-if="letter.ipa" class="abc__ipa">[{{ letter.ipa }}]</span>
            </span>
            <SpeakButton :text="letter.letter.toUpperCase()" :lang="lang" />
          </header>
          <p v-if="letter.sound" class="abc__sound"><CodeText :text="local(letter.sound)" /></p>

          <template v-if="letter.syllables?.length">
            <h3>{{ t('alphabet.syllables') }}</h3>
            <ul class="abc__syllables">
              <li v-for="s in letter.syllables" :key="s">
                <span :lang="lang">{{ s }}</span>
                <SpeakButton :text="s" :lang="lang" />
              </li>
            </ul>
          </template>

          <template v-if="letter.examples?.length">
            <h3>{{ t('alphabet.words') }}</h3>
            <ul class="abc__words">
              <li v-for="(w, i) in letter.examples" :key="i">
                <span>
                  <strong :lang="lang">{{ w[lang] }}</strong>
                  <span v-if="w.ru" class="abc__muted"> — {{ w[locale] ?? w.ru }}</span>
                </span>
                <SpeakButton :text="w[lang] ?? ''" :lang="lang" />
              </li>
            </ul>
          </template>

          <template v-if="letter.rules?.length">
            <h3>{{ t('alphabet.letterRules') }}</h3>
            <div class="abc__chips">
              <button
                v-for="id in letter.rules.filter((r) => ruleOwner.has(r))"
                :key="id"
                type="button"
                class="abc__chip"
                @click="toRule(id)"
              >
                {{ local(ruleOwner.get(id)!.title) }}
              </button>
            </div>
          </template>
        </article>

        <h2 class="abc__section">{{ t('alphabet.rules') }}</h2>
        <section v-for="s in sounds" :key="s.id" class="abc__lesson">
          <header class="abc__lesson-head">
            <span class="abc__code">{{ s.code }}</span>
            <strong>{{ local(s.title) }}</strong>
            <RouterLink :to="lessonRoute(s)" class="abc__go">{{
              t('alphabet.practice')
            }}</RouterLink>
          </header>
          <article v-for="r in s.rules ?? []" :id="`rule-${r.id}`" :key="r.id" class="abc__rule">
            <h3>
              {{ local(r.title) }}
              <span v-if="r.ipa" class="abc__ipa">[{{ r.ipa }}]</span>
            </h3>
            <p><CodeText :text="local(r.text)" /></p>
            <ul class="abc__words">
              <li v-for="(w, i) in r.examples" :key="i">
                <span>
                  <strong :lang="lang">{{ w[lang] }}</strong>
                  <span v-if="w.ru" class="abc__muted"> — {{ w[locale] ?? w.ru }}</span>
                </span>
                <SpeakButton :text="w[lang] ?? ''" :lang="lang" />
              </li>
            </ul>
          </article>
        </section>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.abc__langs {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
  margin-bottom: var(--size-gutter);
}

.abc__skeleton {
  height: 96px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
}

.abc__hint {
  margin: 0 0 12px;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.abc__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 6px;
  margin: 0 0 var(--size-gutter);
  padding: 0;
  list-style: none;
}

.abc__cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  width: 100%;
  padding: 8px 4px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  color: var(--color-fg);
  font: inherit;
  cursor: pointer;
}

.abc__cell strong {
  font-family: var(--font-foreign, inherit);
  font-size: 1.25rem;
}

.abc__cell span {
  overflow: hidden;
  max-width: 100%;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.abc__cell--on {
  background: var(--tint-soft);
  box-shadow: inset 0 0 0 2px var(--tint);
}

.abc__card {
  margin-bottom: calc(var(--size-gutter) * 1.5);
  padding: 16px;
  border-radius: var(--radius-lg, var(--radius-md));
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.abc__card h3,
.abc__rule h3 {
  margin: 14px 0 6px;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.abc__head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.abc__big {
  font-family: var(--font-foreign, inherit);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.abc__name {
  display: flex;
  flex: 1;
  flex-direction: column;
  font-weight: 650;
}

.abc__ipa {
  color: var(--color-fg-subtle);
  font-weight: 500;
}

.abc__sound {
  margin: 12px 0 0;
}

.abc__syllables {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.abc__syllables li {
  display: flex;
  gap: 2px;
  align-items: center;
  padding: 2px 4px 2px 12px;
  border-radius: var(--radius-xl);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-family: var(--font-foreign, inherit);
  font-weight: 650;
}

.abc__words {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.abc__words li {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.abc__muted {
  color: var(--color-fg-muted);
}

.abc__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.abc__chip {
  padding: 6px 12px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  color: var(--color-fg);
  font: inherit;
  font-size: var(--fs-small);
  cursor: pointer;
}

.abc__section {
  margin: 0 0 8px;
  font-size: 1.125rem;
}

.abc__lesson {
  margin-bottom: calc(var(--size-gutter) * 1.25);
}

.abc__lesson-head {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 4px;
}

.abc__lesson-head strong {
  flex: 1;
}

.abc__code {
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 700;
}

.abc__go {
  color: var(--tint-ink);
  font-size: var(--fs-small);
  font-weight: 650;
  white-space: nowrap;
}

.abc__rule {
  scroll-margin-top: 16px;
  padding: 2px 0 10px;
  border-bottom: 1px solid var(--color-stroke);
}

.abc__rule p {
  margin: 0 0 8px;
}
</style>
