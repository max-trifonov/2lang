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
import { bookOutline, checkmark, play } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { SpeakButton } from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import {
  GrammarRule,
  RuleLinks,
  backlinks,
  grammarRefs,
  lessonRoute,
  loadLessons,
  ruleRoute,
  useLessonProgressStore,
  type GrammarLesson,
  type Lesson,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { SongLinks, libraryDocs, songsForRule, type TextDoc } from '@/features/texts'
import { UiButton, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Карточка правила в справочнике (LNG-S1-033, D-38): правило целиком на одном экране —
// формула, таблица, линия времени, примеры, мост к другому языку, связанные темы и уроки,
// где правило встречается. Отсюда же — пройти урок темы.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()

const all = ref<Lesson[]>([])
/** Песни библиотеки — «правило в песнях» (D-42). */
const library = ref<TextDoc[]>([])
void libraryDocs()
  .then((docs) => (library.value = docs))
  .catch(() => undefined)
const lesson = ref<GrammarLesson | null>(null)
const status = ref<'loading' | 'ready' | 'missing' | 'failed'>('loading')

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    all.value = await loadLessons()
    const found = all.value.find((l) => l.id === String(route.params.id ?? ''))
    lesson.value = found?.kind === 'grammar' ? found : null
    status.value = lesson.value ? 'ready' : 'missing'
  } catch {
    status.value = 'failed'
  }
}

watch(() => route.params.id, load, { immediate: true })
watch(
  () => profiles.activeId,
  (pid) => {
    if (progress.profileId !== pid) void progress.forProfile(pid)
  },
  { immediate: true },
)

const lang = computed(() => lesson.value?.lang ?? '')
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const tr = (ex: Record<string, unknown>, own: string) => {
  const pick = (k: string) => (k !== own && typeof ex[k] === 'string' ? (ex[k] as string) : '')
  return pick(locale.value) || pick('ru')
}
const passed = computed(() => (lesson.value ? progress.get(lesson.value.id) : undefined))
const see = computed(() => grammarRefs(lesson.value?.see, all.value))
/** Уроки слов, где правило встречается, — до 8, в порядке пути. */
const songs = computed(() => (lesson.value ? songsForRule(library.value, lesson.value.id) : []))
const usedIn = computed(() =>
  lesson.value
    ? backlinks(lesson.value.id, all.value)
        .filter((l) => l.kind === 'words')
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, 8)
    : [],
)
</script>

<template>
  <IonPage :data-lang="lang || undefined">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton :default-href="`/rules?lang=${lang}`" :text="t('common.back')" />
        </IonButtons>
        <IonTitle>{{ t('rules.title') }}</IonTitle>
        <LangBadge v-if="lang" slot="end" :lang="lang" class="rule__badge" />
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="rule__skeleton" />
        <UiSkeleton class="rule__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="status === 'missing'"
        variant="empty"
        icon="search-outline"
        :title="t('rules.notFound')"
      >
        <template #action>
          <UiButton @click="router.replace('/rules')">{{ t('rules.toIndex') }}</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState
        v-else-if="status === 'failed'"
        variant="error"
        icon="alert-circle-outline"
        :title="t('lessons.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <article v-else-if="lesson" class="rule">
        <header class="rule__head">
          <span class="rule__meta">
            {{ lesson.code }}
            <template v-if="lesson.section"> · {{ t(`rules.section.${lesson.section}`) }}</template>
            <template v-if="lesson.level"> · {{ lesson.level }}</template>
          </span>
          <h1 class="rule__title">{{ local(lesson.title) }}</h1>
        </header>

        <GrammarRule :rule="lesson.rule" :lang="lang" />

        <section class="rule__block">
          <h2>{{ t('rules.examples') }}</h2>
          <ul class="rule__examples">
            <li v-for="(ex, i) in lesson.pattern" :key="i">
              <div class="rule__line">
                <span :lang="lang">{{ ex[lang] }}</span>
                <SpeakButton :text="String(ex[lang] ?? '')" :lang="lang" />
              </div>
              <span class="rule__muted">{{ tr(ex, lang) }}</span>
            </li>
          </ul>
        </section>

        <section v-if="lesson.bridge?.length" class="rule__block">
          <h2>{{ t('lessons.grammar.bridge') }}</h2>
          <div v-for="b in lesson.bridge" :key="b.lang" class="rule__bridge" :data-lang="b.lang">
            <p v-if="b.formula" class="rule__bridge-formula" :lang="b.lang">
              <LangBadge :lang="b.lang" />
              {{ b.formula }}
            </p>
            <template v-for="(ex, i) in b.examples ?? []" :key="i">
              <span :lang="b.lang">{{ ex[b.lang] }}</span>
              <span class="rule__muted">{{ tr(ex, b.lang) }}</span>
            </template>
            <p v-if="b.note" class="rule__muted">{{ local(b.note) }}</p>
            <RouterLink v-if="b.lesson" :to="ruleRoute(b.lesson)" class="rule__link">
              <IonIcon :icon="bookOutline" aria-hidden="true" />
              {{ t('lessons.grammar.bridgeRule') }}
            </RouterLink>
          </div>
        </section>

        <RuleLinks :rules="see" :title="t('lessons.grammar.see')" />

        <SongLinks :songs="songs" :title="t('lessons.grammar.songs')" />

        <section v-if="usedIn.length" class="rule__block">
          <h2>{{ t('rules.usedIn') }}</h2>
          <ul class="rule__used">
            <li v-for="l in usedIn" :key="l.id">
              <RouterLink :to="lessonRoute(l)">{{ local(l.title) }}</RouterLink>
            </li>
          </ul>
        </section>

        <div class="rule__bottom">
          <p v-if="passed" class="rule__passed">
            <IonIcon :icon="checkmark" aria-hidden="true" />
            {{ t('rules.passed', { n: Math.round(passed.bestScore * 100) }) }}
          </p>
          <UiButton
            full-width
            size="lg"
            :variant="passed ? 'secondary' : 'primary'"
            @click="router.push(lessonRoute(lesson))"
          >
            <IonIcon :icon="play" aria-hidden="true" />
            {{ t(passed ? 'rules.practiceAgain' : 'rules.practice') }}
          </UiButton>
        </div>
      </article>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.rule__badge {
  margin-right: 8px;
}

.rule__skeleton {
  height: 96px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

.rule {
  display: flex;
  flex-direction: column;
  gap: calc(var(--size-gutter) * 1.25);
}

.rule__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule__meta {
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.rule__title {
  margin: 0;
  font-size: var(--fs-h1, 1.6rem);
  line-height: 1.25;
}

.rule__block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule__block h2 {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.rule__examples,
.rule__used {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rule__examples li,
.rule__bridge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.rule__line {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
}

.rule__muted {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.rule__bridge-formula {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 4px;
  color: var(--tint-ink);
  font-weight: 600;
}

.rule__link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  align-self: flex-start;
  margin-top: 4px;
  color: var(--tint-ink);
  font-weight: 650;
  text-decoration: none;
}

.rule__used a {
  color: var(--tint-ink);
  font-weight: 550;
}

.rule__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.rule__passed {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}
</style>
