<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'
import { computed, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { canHearWords, loadLanguage } from '@/features/dictionary'
import {
  PracticeTask,
  answerPractice,
  currentTask,
  practiceFinished,
  startPractice,
  type Practice,
  type Task,
} from '@/features/lessons'
import { useActivityStore } from '@/features/activity'
import { useProfilesStore } from '@/features/profiles'
import { loadBundledTexts, mergeLibrary, textPhrases, useTextsStore } from '@/features/texts'
import { buildReview, gradeFor, review, useCardsStore, type Card } from '@/features/review'
import { LangBadge } from '@/features/language'
import { UiButton, UiEmptyState, UiProgressRing, UiSkeleton } from '@/shared/ui'

// Экран повторения (LNG-S1-024): сессия одного языка, оценка сразу при ответе (D-2).
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const cards = useCardsStore()
const activity = useActivityStore()
const texts = useTextsStore()

const lang = computed(() => {
  const q = typeof route.query.lang === 'string' ? route.query.lang : ''
  const langs = profiles.active?.languages ?? []
  return langs.includes(q as never) ? q : (langs[0] ?? '')
})

const status = ref<'loading' | 'ready' | 'failed'>('loading')
const practice = ref<Practice | null>(null)
/** Задание → его карточка; повтор после ошибки — тот же объект задания. */
const owners = new Map<Task, Card>()
const saving = ref(false)

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    if (cards.profileId !== profiles.activeId) await cards.forProfile(profiles.activeId)
    if (activity.profileId !== profiles.activeId) await activity.forProfile(profiles.activeId)
    const [entries, canHear] = await Promise.all([
      loadLanguage(lang.value),
      canHearWords(lang.value),
    ])
    // Фразы из текстов (LNG-S1-027): карточки фраз берут оригинал и перевод из библиотеки.
    await texts.ready()
    const docs = mergeLibrary(await loadBundledTexts(), texts.texts).map((i) => i.doc)
    const phrases = new Map(textPhrases(docs, locale.value).map((p) => [p.key, p]))
    const items = buildReview(cards.due(lang.value), entries, {
      locale: locale.value,
      canHear,
      rng: Math.random,
      phrases,
    })
    owners.clear()
    for (const i of items) owners.set(i.task, i.card)
    practice.value = startPractice(items.map((i) => i.task))
    status.value = 'ready'
  } catch {
    status.value = 'failed'
  }
}

watch([lang, () => profiles.activeId], load, { immediate: true })

const done = computed(() => practice.value !== null && practiceFinished(practice.value))
const current = computed(() => (practice.value ? currentTask(practice.value) : null))
const bar = computed(() => {
  const p = practice.value
  return !p || !p.queue.length ? 1 : p.pos / p.queue.length
})

async function onAnswer(correct: boolean, accent: boolean): Promise<void> {
  const p = practice.value
  const item = p && currentTask(p)
  if (!p || !item) return
  saving.value = true
  try {
    // Повтор после ошибки карточку не оценивает: иначе провал «исправляется» повтором (D-4).
    // practice — реактивный ref: задание внутри него прокси, ключ карты — исходный объект.
    const card = owners.get(toRaw(item.task))
    if (!item.retry && card) {
      await cards.putMany([review(card, gradeFor(correct, accent), new Date())])
      await activity.record('review')
    }
    practice.value = answerPractice(p, correct)
  } finally {
    saving.value = false
  }
}

const accuracy = computed(() =>
  practice.value?.total ? practice.value.firstTry / practice.value.total : 1,
)

/** Ближайший срок после сессии — когда вернуться. */
const nextDue = computed(() => {
  const dates = [...cards.cards.values()]
    .filter((c) => c.lang === lang.value)
    .map((c) => c.due)
    .sort()
  const first = dates.find((d) => new Date(d).getTime() > Date.now())
  return first ? new Date(first).toLocaleDateString(locale.value) : ''
})

function close(): void {
  if (window.history.state?.back) router.back()
  else void router.replace('/home')
}
</script>

<template>
  <IonPage :data-lang="lang || undefined">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton :aria-label="t('review.close')" @click="close">
            <IonIcon slot="icon-only" :icon="closeOutline" aria-hidden="true" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ t('review.title') }}</IonTitle>
        <LangBadge v-if="lang" slot="end" :lang="lang" class="review__badge" />
      </IonToolbar>
      <IonProgressBar v-if="status === 'ready' && practice?.queue.length" :value="done ? 1 : bar" />
    </IonHeader>
    <IonContent class="ion-padding">
      <UiSkeleton v-if="status === 'loading'" class="review__skeleton" />

      <UiEmptyState
        v-else-if="status === 'failed'"
        variant="error"
        icon="alert-circle-outline"
        :title="t('review.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState
        v-else-if="!practice?.queue.length"
        variant="empty"
        icon="checkmark-done-outline"
        :title="t('review.empty')"
        :description="t('review.emptyHint')"
      >
        <template #action>
          <UiButton @click="close">{{ t('review.toHome') }}</UiButton>
        </template>
      </UiEmptyState>

      <PracticeTask
        v-else-if="current && !done"
        :key="practice!.pos"
        :task="current.task"
        :retry="current.retry"
        :lang="lang"
        @next="onAnswer"
      />

      <section v-else-if="done" class="review__summary">
        <UiProgressRing
          :value="accuracy"
          :size="140"
          :stroke="12"
          :label="
            t('review.summary.score', { correct: practice!.firstTry, total: practice!.total })
          "
        >
          <span class="review__score">{{ Math.round(accuracy * 100) }}<small>%</small></span>
        </UiProgressRing>
        <h1>{{ t('review.summary.title') }}</h1>
        <p class="review__lead">
          {{ t('review.summary.score', { correct: practice!.firstTry, total: practice!.total }) }}
        </p>
        <p v-if="nextDue" class="review__hint">{{ t('review.summary.next', { date: nextDue }) }}</p>
        <div class="review__bottom">
          <UiButton full-width size="lg" :loading="saving" @click="close">{{
            t('review.summary.done')
          }}</UiButton>
        </div>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.review__badge {
  margin-right: 8px;
}

.review__skeleton {
  height: 160px;
  border-radius: var(--radius-lg);
}

.review__summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--size-gutter) * 0.75);
  min-height: 100%;
  padding-top: var(--size-gutter);
  text-align: center;
}

.review__summary h1,
.review__lead,
.review__hint {
  margin: 0;
}

.review__summary h1 {
  margin-top: 8px;
  font-size: var(--fs-display);
}

.review__score {
  font-size: 2.4rem;
  font-weight: 750;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.review__score small {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.review__lead {
  color: var(--color-fg-muted);
}

.review__hint {
  padding: 8px 14px;
  border-radius: var(--radius-xl);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.review__bottom {
  position: sticky;
  bottom: 0;
  align-self: stretch;
  margin-top: auto;
  padding-top: var(--size-gutter);
}
</style>
