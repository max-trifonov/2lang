<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import { checkmarkCircle, chevronForward, flash, star, starOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  LISTS,
  WordArticle,
  byList,
  keyOf,
  loadLanguage,
  search,
  useSavedWordsStore,
  useWordStatusStore,
  type CatalogEntry,
  type ListId,
} from '@/features/dictionary'
import { useProfilesStore } from '@/features/profiles'
import {
  UiButton,
  UiChip,
  UiEmptyState,
  UiField,
  UiList,
  UiListItem,
  UiSkeleton,
} from '@/shared/ui'

// Вкладка «Словарь» (LNG-S1-014): язык × список, поиск, «мои слова». Состояние — в URL (AC-4).
type View = ListId | 'saved'
const VIEWS: readonly View[] = [...LISTS, 'saved']
const PAGE = 100

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const saved = useSavedWordsStore()
const known = useWordStatusStore()

const langs = computed<string[]>(() => profiles.active?.languages ?? [])
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const lang = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : (langs.value[0] ?? ''),
)
const view = computed<View>(() =>
  VIEWS.includes(str(route.query.list) as View) ? (str(route.query.list) as View) : 'verb',
)
const query = computed(() => str(route.query.q))

function setQuery(patch: Record<string, string | undefined>): void {
  const next = { ...route.query, ...patch }
  for (const k of Object.keys(next)) if (!next[k]) delete next[k]
  void router.replace({ query: next })
}

const entries = ref<CatalogEntry[]>([])
const loading = ref(true)
const failed = ref(false)
const limit = ref(PAGE)

async function load(): Promise<void> {
  if (!lang.value) return
  loading.value = true
  failed.value = false
  try {
    entries.value = await loadLanguage(lang.value)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

watch(lang, load, { immediate: true })
// Звёздочки — свои у каждого профиля: при смене профиля список перечитывается.
watch(
  () => profiles.activeId,
  (id) => {
    void saved.forProfile(id)
    // Отметки «знаю» из быстрой проверки (LNG-S1-021, AC-5).
    if (known.profileId !== id) void known.forProfile(id)
  },
  { immediate: true },
)
const knownCount = computed(() => shown.value.filter((e) => known.isKnown(keyOf(e))).length)
watch([lang, view, query], () => (limit.value = PAGE))

const shown = computed<CatalogEntry[]>(() => {
  if (query.value.trim()) return search(entries.value, query.value)
  if (view.value === 'saved') {
    const order = (e: CatalogEntry) => LISTS.indexOf(e.pos as ListId)
    return entries.value
      .filter((e) => saved.has(keyOf(e)))
      .sort((a, b) => order(a) - order(b) || a.rank - b.rank)
  }
  return byList(entries.value, view.value)
})

const translation = (e: CatalogEntry) =>
  e.translations[locale.value] ?? e.translations.ru ?? Object.values(e.translations)[0]
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('dictionary.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding" :data-lang="lang">
      <div v-if="langs.length > 1" class="dict__langs" role="group">
        <UiChip
          v-for="l in langs"
          :key="l"
          :data-lang="l"
          :selected="l === lang"
          class="dict__lang"
          @click="setQuery({ lang: l })"
        >
          <span class="dict__lang-code">{{ l.toUpperCase() }}</span>
          {{ t(`profiles.lang.${l}`) }}
        </UiChip>
      </div>

      <button
        type="button"
        class="dict__train"
        @click="router.push({ path: '/train', query: { lang, list: view } })"
      >
        <IonIcon :icon="flash" class="dict__train-icon" aria-hidden="true" />
        <span class="dict__train-text">
          <strong>{{ t('dictionary.train') }}</strong>
          <span>{{ t('dictionary.trainHint') }}</span>
        </span>
        <IonIcon :icon="chevronForward" aria-hidden="true" />
      </button>

      <UiField
        :model-value="query"
        :label="t('dictionary.search')"
        @update:model-value="setQuery({ q: $event })"
      />

      <div v-if="!query.trim()" class="dict__row dict__lists">
        <UiChip v-for="v in VIEWS" :key="v" :selected="v === view" @click="setQuery({ list: v })">
          {{ t(`dictionary.lists.${v}`) }}
        </UiChip>
      </div>

      <UiEmptyState
        v-if="failed"
        variant="error"
        icon="alert-circle-outline"
        :title="t('dictionary.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('dictionary.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="loading">
        <UiSkeleton v-for="n in 6" :key="n" class="dict__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="shown.length === 0 && view === 'saved' && !query.trim()"
        variant="empty"
        icon="star-outline"
        :title="t('dictionary.savedEmpty')"
        :description="t('dictionary.savedHint')"
      />

      <UiEmptyState
        v-else-if="shown.length === 0"
        variant="empty"
        icon="search-outline"
        :title="t('dictionary.notFound')"
      />

      <template v-else>
        <p class="dict__count">
          {{ t('dictionary.count', { n: shown.length }, shown.length) }}
          <template v-if="knownCount"
            >· {{ t('dictionary.knownCount', { n: knownCount }) }}</template
          >
        </p>
        <UiList>
          <UiListItem
            v-for="e in shown.slice(0, limit)"
            :key="e.id"
            interactive
            @click="router.push(`/dictionary/${e.lang}/${e.id}`)"
          >
            <span class="dict__item">
              <span class="dict__rank" aria-hidden="true">{{ e.rank }}</span>
              <span class="dict__body">
                <span class="dict__word">
                  <WordArticle :word="e" />
                  <strong :lang="e.lang">{{ e.lemma }}</strong>
                  <span v-if="e.irregular" class="dict__badge">{{
                    t('dictionary.irregular')
                  }}</span>
                  <IonIcon
                    v-if="known.isKnown(keyOf(e))"
                    :icon="checkmarkCircle"
                    class="dict__known"
                    :aria-label="t('dictionary.known')"
                  />
                </span>
                <span class="dict__tr">{{ translation(e) }}</span>
              </span>
            </span>
            <template #end>
              <button
                type="button"
                class="dict__star"
                :aria-pressed="saved.has(keyOf(e))"
                :aria-label="
                  t(saved.has(keyOf(e)) ? 'dictionary.unsave' : 'dictionary.save', {
                    word: e.lemma,
                  })
                "
                @click.stop="saved.toggle(keyOf(e))"
              >
                <IonIcon :icon="saved.has(keyOf(e)) ? star : starOutline" aria-hidden="true" />
              </button>
            </template>
          </UiListItem>
        </UiList>
        <UiButton
          v-if="shown.length > limit"
          variant="secondary"
          full-width
          class="dict__more"
          @click="limit += PAGE"
        >
          {{ t('dictionary.more') }}
        </UiButton>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.dict__langs {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
  margin-bottom: var(--size-gutter);
}

.dict__lang {
  min-height: 48px;
}

.dict__lang-code {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  opacity: 0.8;
}

.dict__train {
  display: flex;
  gap: 14px;
  align-items: center;
  width: 100%;
  margin-bottom: var(--size-gutter);
  padding: 14px 16px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.dict__train:active {
  transform: scale(0.98);
}

.dict__train:focus-visible {
  outline: 2px solid var(--tint);
  outline-offset: 2px;
}

.dict__train-icon {
  flex: none;
  padding: 8px;
  border-radius: var(--radius-xl);
  background: var(--tint);
  color: var(--on-tint);
  font-size: 1.2rem;
}

.dict__train-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dict__train-text strong {
  font-size: var(--fs-h3);
}

.dict__train-text span {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.dict__row {
  display: flex;
  gap: calc(var(--size-gutter) * 0.5);
  margin-bottom: var(--size-gutter);
}

.dict__lists {
  margin: var(--size-gutter) calc(var(--size-gutter) * -1);
  padding: 0 var(--size-gutter);
  overflow-x: auto;
  scrollbar-width: none;
}

.dict__skeleton {
  height: 56px;
  margin-bottom: calc(var(--size-gutter) * 0.5);
  border-radius: var(--radius-sm);
}

.dict__known {
  flex: none;
  align-self: center;
  color: var(--color-success);
}

.dict__count {
  margin: 0 0 calc(var(--size-gutter) * 0.5);
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 600;
}

.dict__item {
  display: flex;
  gap: 14px;
  align-items: center;
}

.dict__rank {
  flex: none;
  min-width: 2.2em;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.dict__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dict__word {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.dict__word strong {
  color: var(--tint-ink);
  font-size: 1.2rem;
  font-weight: 600;
}

.dict__badge {
  padding: 1px 7px;
  border-radius: var(--radius-xl);
  background: var(--reward-soft);
  color: var(--reward-ink);
  font-size: 0.7rem;
  font-weight: 650;
}

.dict__tr {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.dict__star {
  display: inline-flex;
  padding: 8px;
  border: 0;
  background: transparent;
  color: var(--reward);
  font-size: 1.4rem;
  cursor: pointer;
}

.dict__star[aria-pressed='false'] {
  color: var(--color-chip-strong);
}

.dict__star:focus-visible {
  outline: 2px solid var(--tint, var(--color-fg));
  border-radius: var(--radius-xs);
}

.dict__more {
  margin-top: var(--size-gutter);
}
</style>
