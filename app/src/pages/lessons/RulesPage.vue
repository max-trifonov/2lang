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
import { alertCircleOutline, bookOutline, checkmark } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  grammarSections,
  loadLessons,
  ruleRoute,
  useLessonProgressStore,
  type Lesson,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { UiButton, UiChip, UiEmptyState, UiField, UiSkeleton } from '@/shared/ui'

// Справочник правил (LNG-S1-033, D-38): все темы грамматики языка по разделам — строй
// предложения, глаголы, времена, модальные… Пройденные отмечены; поиск по названию и формуле.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()

const lessons = ref<Lesson[] | null>(null)
const failed = ref(false)
const query = ref('')

async function load(): Promise<void> {
  failed.value = false
  try {
    lessons.value = await loadLessons()
  } catch {
    failed.value = true
  }
}
void load()

watch(
  () => profiles.activeId,
  (pid) => {
    if (progress.profileId !== pid) void progress.forProfile(pid)
  },
  { immediate: true },
)

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const langs = computed<string[]>(() => profiles.active?.languages ?? [])
const lang = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : (langs.value[0] ?? ''),
)
const local = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? ''
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const groups = computed(() => {
  if (!lessons.value) return []
  const q = fold(query.value.trim())
  return grammarSections(lessons.value, lang.value)
    .map((g) => ({
      ...g,
      lessons: q
        ? g.lessons.filter((l) =>
            fold(
              [...Object.values(l.title), l.rule.formula ?? '', l.code ?? ''].join(' '),
            ).includes(q),
          )
        : g.lessons,
    }))
    .filter((g) => g.lessons.length)
})
const total = computed(() =>
  lessons.value ? grammarSections(lessons.value, lang.value).flatMap((g) => g.lessons) : [],
)
const passed = computed(() => total.value.filter((l) => progress.get(l.id)).length)

function setLang(l: string): void {
  void router.replace({ query: { ...route.query, lang: l } })
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/lessons" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ t('rules.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding" :data-lang="lang || undefined">
      <div v-if="langs.length > 1" class="rules__langs" role="group">
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

      <RouterLink :to="{ path: '/alphabet', query: { lang } }" class="rules__alphabet">{{
        t('alphabet.open')
      }}</RouterLink>

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
        <UiSkeleton v-for="n in 4" :key="n" class="rules__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="!total.length"
        variant="empty"
        :icon="bookOutline"
        :title="t('rules.empty')"
      />

      <template v-else>
        <p class="rules__progress">
          {{ t('rules.progress', { done: passed, total: total.length }) }}
        </p>
        <UiField v-model="query" :label="t('rules.search')" class="rules__search" />
        <p v-if="!groups.length" class="rules__progress">{{ t('rules.nothing') }}</p>
        <section v-for="g in groups" :key="g.section" class="rules__group">
          <h2>{{ t(`rules.section.${g.section}`) }}</h2>
          <ul class="rules__list">
            <li v-for="l in g.lessons" :key="l.id">
              <RouterLink :to="ruleRoute(l.id)" class="rules__item">
                <span class="rules__code">{{ l.code }}</span>
                <span class="rules__text">
                  <strong>{{ local(l.title) }}</strong>
                  <span v-if="l.rule.formula" class="rules__formula" :lang="lang">{{
                    l.rule.formula
                  }}</span>
                </span>
                <IonIcon
                  v-if="progress.get(l.id)"
                  :icon="checkmark"
                  class="rules__done"
                  :aria-label="t('path.status.done')"
                />
              </RouterLink>
            </li>
          </ul>
        </section>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.rules__langs {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
  margin-bottom: var(--size-gutter);
}

.rules__alphabet {
  display: block;
  margin-bottom: var(--size-gutter);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-weight: 650;
  text-decoration: none;
}

.rules__skeleton {
  height: 56px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
}

.rules__progress {
  margin: 0 0 8px;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.rules__search {
  margin-bottom: var(--size-gutter);
}

.rules__group {
  margin-bottom: calc(var(--size-gutter) * 1.25);
}

.rules__group h2 {
  margin: 0 0 8px;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.rules__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rules__item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
  color: var(--color-fg);
  text-decoration: none;
}

.rules__code {
  flex: none;
  min-width: 3.4em;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.rules__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rules__text strong {
  font-weight: 600;
}

.rules__formula {
  overflow: hidden;
  color: var(--tint-ink);
  font-size: var(--fs-small);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rules__done {
  flex: none;
  color: var(--tint);
  font-size: 1.2rem;
}
</style>
