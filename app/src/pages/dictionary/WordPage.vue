<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { chevronForward, searchOutline, star, starOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  SpeakButton,
  WordArticle,
  keyOf,
  loadLanguage,
  useSavedWordsStore,
  wordForms,
  type CatalogEntry,
} from '@/features/dictionary'
import { HighlightText, LangBadge, formsOf } from '@/features/language'
import {
  RuleLinks,
  grammarForWord,
  loadLessons,
  rulesFor,
  rulesIndex,
  type GrammarLesson,
  type RuleHint,
  CodeText,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { UiCard, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Карточка слова (LNG-S1-015): /dictionary/:lang/:id.
const { t, locale } = useI18n()
const route = useRoute()
const profiles = useProfilesStore()
const saved = useSavedWordsStore()

const lang = computed(() => String(route.params.lang ?? ''))
const id = computed(() => String(route.params.id ?? ''))
const entry = ref<CatalogEntry | null>(null)
const pair = ref<CatalogEntry | null>(null)
const rules = ref<RuleHint[]>([])
/** Темы грамматики, где слово — опора (D-38): «tener» → «tener que». */
const grammar = ref<GrammarLesson[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  entry.value = null
  pair.value = null
  rules.value = []
  grammar.value = []
  try {
    entry.value = (await loadLanguage(lang.value)).find((e) => e.id === id.value) ?? null
    // Подсказки правил чтения (LNG-S1-016): уроки грузятся, только если статья на них ссылается.
    if (entry.value?.rules?.length)
      rules.value = rulesFor(entry.value.rules, rulesIndex(await loadLessons(), lang.value))
    if (entry.value) grammar.value = grammarForWord(await loadLessons(), lang.value, id.value)
    const ref = entry.value?.pair?.split(':')
    if (ref?.length === 2)
      pair.value = (await loadLanguage(ref[0]!)).find((e) => e.id === ref[1]) ?? null
  } catch {
    entry.value = null
  } finally {
    loading.value = false
  }
}

watch([lang, id], load, { immediate: true })
// Прямой переход на карточку — «мои слова» активного профиля могут быть ещё не загружены.
watch(
  () => profiles.activeId,
  (pid) => {
    if (saved.profileId !== pid) void saved.forProfile(pid)
  },
  { immediate: true },
)

const tr = (e: CatalogEntry) =>
  e.translations[locale.value] ?? e.translations.ru ?? Object.values(e.translations)[0]
const forms = computed(() => (entry.value ? wordForms(entry.value) : { tenses: [], singles: [] }))
const isSaved = computed(() => (entry.value ? saved.has(keyOf(entry.value)) : false))
const listName = computed(() => (entry.value ? t(`dictionary.lists.${entry.value.pos}`) : ''))
</script>

<template>
  <IonPage :data-lang="lang">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton :default-href="`/dictionary?lang=${lang}`" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ entry?.lemma ?? t('dictionary.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="loading">
        <UiSkeleton class="word__skeleton" />
        <UiSkeleton class="word__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="!entry"
        variant="empty"
        :icon="searchOutline"
        :title="t('dictionary.card.notFound')"
        :description="t('dictionary.card.notFoundHint')"
      />

      <template v-else>
        <section class="word__head">
          <div class="word__top">
            <LangBadge :lang="entry.lang" />
            <button
              type="button"
              class="word__star"
              :aria-pressed="isSaved"
              :aria-label="
                t(isSaved ? 'dictionary.unsave' : 'dictionary.save', { word: entry.lemma })
              "
              @click="saved.toggle(keyOf(entry))"
            >
              <IonIcon :icon="isSaved ? star : starOutline" aria-hidden="true" />
            </button>
          </div>
          <div class="word__title">
            <div class="word__lemma">
              <WordArticle :word="entry" class="word__article" />
              <h1 :lang="entry.lang">{{ entry.lemma }}</h1>
            </div>
            <SpeakButton :text="entry.lemma" :lang="entry.lang" size="lg" />
          </div>
          <p v-if="entry.ipa" class="word__ipa">[{{ entry.ipa }}]</p>
          <p class="word__tr">{{ tr(entry) }}</p>
          <p class="word__meta">
            {{ t(`dictionary.card.pos.${entry.pos}`) }}
            <span v-if="entry.level" class="word__badge">{{ entry.level }}</span>
            <span v-if="entry.irregular" class="word__badge">{{ t('dictionary.irregular') }}</span>
            <span>{{ t('dictionary.card.rank', { rank: entry.rank, list: listName }) }}</span>
          </p>
        </section>

        <UiCard v-if="entry.note" class="word__block">
          <h2>{{ t('dictionary.card.note') }}</h2>
          <p>{{ tr({ ...entry, translations: entry.note }) }}</p>
        </UiCard>

        <section v-if="rules.length" class="word__block">
          <h2>{{ t('dictionary.card.reading') }}</h2>
          <ul class="word__rules">
            <li v-for="r in rules" :key="r.id">
              <strong>{{ r.title[locale] ?? r.title.ru }}</strong>
              <span v-if="r.ipa" class="word__ipa">[{{ r.ipa }}]</span>
              <p><CodeText :text="r.text[locale] ?? r.text.ru" /></p>
              <span v-if="r.code" class="word__topic">{{
                t('dictionary.card.topicCode', { code: r.code })
              }}</span>
            </li>
          </ul>
          <RouterLink :to="{ path: '/alphabet', query: { lang } }" class="word__alphabet">{{
            t('alphabet.open')
          }}</RouterLink>
        </section>

        <section v-if="grammar.length" class="word__block">
          <h2>{{ t('dictionary.card.grammar') }}</h2>
          <RuleLinks :rules="grammar" />
        </section>

        <section v-if="entry.examples?.length" class="word__block">
          <h2>{{ t('dictionary.card.examples') }}</h2>
          <ul class="word__examples">
            <li v-for="(ex, i) in entry.examples" :key="i">
              <div class="word__example">
                <HighlightText
                  :lang="entry.lang"
                  class="word__example-text"
                  :text="ex[entry.lang] ?? ''"
                  :lemma="entry.lemma"
                  :forms="formsOf(entry.forms)"
                />
                <SpeakButton :text="ex[entry.lang] ?? ''" :lang="entry.lang" />
              </div>
              <span class="word__example-tr">{{ ex[locale] ?? ex.ru }}</span>
              <span class="word__topic">{{ t(`dictionary.card.topics.${ex.topic}`) }}</span>
            </li>
          </ul>
        </section>

        <section v-if="forms.tenses.length || forms.singles.length" class="word__block">
          <h2>{{ t('dictionary.card.forms') }}</h2>
          <table v-for="tense in forms.tenses" :key="tense.key" class="word__table">
            <caption>
              {{
                t(`dictionary.forms.${tense.key}`)
              }}
            </caption>
            <tbody>
              <tr v-for="row in tense.rows" :key="row.person">
                <th scope="row">{{ row.person }}</th>
                <td :lang="entry.lang">{{ row.form }}</td>
              </tr>
            </tbody>
          </table>
          <dl class="word__singles">
            <template v-for="s in forms.singles" :key="s.key">
              <dt>{{ t(`dictionary.forms.${s.key}`, s.key) }}</dt>
              <dd :lang="entry.lang">{{ s.value }}</dd>
            </template>
          </dl>
        </section>

        <section v-if="pair" class="word__block">
          <h2>{{ t('dictionary.card.pair') }}</h2>
          <RouterLink
            :to="`/dictionary/${pair.lang}/${pair.id}`"
            class="word__pair"
            :data-lang="pair.lang"
          >
            <LangBadge :lang="pair.lang" />
            <span class="word__pair-text">
              <span class="word__pair-lemma">
                <WordArticle :word="pair" />
                <strong :lang="pair.lang">{{ pair.lemma }}</strong>
              </span>
              <span class="word__pair-tr">{{ tr(pair) }}</span>
            </span>
            <IonIcon :icon="chevronForward" class="word__pair-go" aria-hidden="true" />
          </RouterLink>
        </section>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.word__skeleton {
  height: 80px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

/* Шапка — плашка в цвете языка: слово, звук, перевод. */
.word__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: calc(var(--size-gutter) * 1.5);
  padding: var(--size-gutter) calc(var(--size-gutter) * 1.25) calc(var(--size-gutter) * 1.25);
  border-radius: var(--radius-lg);
  background: var(--tint-soft);
}

.word__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.word__title {
  display: flex;
  gap: var(--size-gutter);
  align-items: center;
  justify-content: space-between;
}

.word__lemma {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  align-items: baseline;
  min-width: 0;
}

.word__lemma h1 {
  margin: 0;
  color: var(--tint-ink);
  font-size: clamp(2.2rem, 11vw, 3rem);
  font-weight: 600;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.word__article {
  font-size: 1.4rem;
}

.word__star {
  display: inline-flex;
  margin: -8px -8px -8px 0;
  padding: 8px;
  border: 0;
  background: transparent;
  color: var(--reward);
  font-size: 1.6rem;
  cursor: pointer;
}

.word__star[aria-pressed='false'] {
  color: var(--tint-ink);
  opacity: 0.55;
}

.word__ipa {
  margin: 0;
  color: var(--color-fg-subtle);
}

.word__tr {
  margin: 6px 0 0;
  font-size: var(--fs-h2);
  font-weight: 600;
  line-height: 1.3;
}

.word__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin: 4px 0 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-small);
}

.word__badge {
  padding: 1px 8px;
  border-radius: var(--radius-xl);
  background: var(--reward-soft);
  color: var(--reward-ink);
  font-weight: 650;
}

.word__block {
  margin-bottom: calc(var(--size-gutter) * 1.5);
}

.word__block h2 {
  margin: 0 0 10px;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.word__examples,
.word__rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.word__examples li,
.word__rules li {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.word__example {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.word__example-text {
  font-size: 1.15rem;
  line-height: 1.4;
}

.word__example-tr {
  display: block;
  margin-top: 2px;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.word__topic {
  display: inline-block;
  margin-top: 6px;
  color: var(--color-fg-subtle);
  font-size: 0.75rem;
  font-weight: 600;
}

.word__rules p {
  margin: 4px 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.word__rules .word__ipa {
  margin-left: 6px;
}

.word__table {
  width: 100%;
  margin-bottom: var(--size-gutter);
  border-collapse: collapse;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.word__table caption {
  margin-bottom: 6px;
  color: var(--color-fg);
  font-weight: 650;
  text-align: left;
}

.word__table th,
.word__table td {
  padding: 8px 14px;
  text-align: left;
}

.word__table tr:not(:last-child) th,
.word__table tr:not(:last-child) td {
  border-bottom: 1px solid var(--color-stroke);
}

.word__table th {
  width: 40%;
  color: var(--color-fg-subtle);
  font-weight: 500;
}

.word__table td {
  color: var(--tint-ink);
  font-size: 1.1rem;
  font-weight: 550;
}

.word__singles {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  margin: 0;
}

.word__singles dt {
  color: var(--color-fg-subtle);
}

.word__singles dd {
  margin: 0;
  color: var(--tint-ink);
  font-weight: 550;
}

/* Мост к паре во втором языке — в её цвете: два языка рядом, но не вперемешку. */
.word__pair {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--color-fg);
  text-decoration: none;
}

.word__pair-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.word__pair-lemma {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.word__pair-lemma strong {
  color: var(--tint-ink);
  font-size: 1.3rem;
  font-weight: 600;
}

.word__pair-tr {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.word__pair-go {
  flex: none;
  color: var(--tint-ink);
  font-size: 1.2rem;
}

.word__alphabet {
  display: inline-block;
  margin-top: 12px;
  color: var(--tint-ink);
  font-weight: 650;
}
</style>
