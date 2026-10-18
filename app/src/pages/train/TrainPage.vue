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
import { alertCircleOutline, checkmarkDoneOutline, closeOutline, starOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useActivityStore } from '@/features/activity'
import {
  WordArticle,
  canHearWords,
  keyOf,
  loadLanguage,
  useSavedWordsStore,
  useWordStatusStore,
  type CatalogEntry,
} from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import { PracticeTask, WordIntro, currentTask, practiceFinished } from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { newCard, review, useCardsStore, type Grade } from '@/features/review'
import {
  NEW_MAX,
  SCOPES,
  answerRound,
  buildRound,
  planRound,
  scopeStats,
  startRound,
  type PlanInput,
  type Round,
  type TrainScope,
} from '@/features/train'
import { UiButton, UiChip, UiEmptyState, UiProgressRing, UiSkeleton } from '@/shared/ui'

// Тренировка по словарю (LNG-S1-030): язык и раздел → раунд → итог. Настройки — в URL.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const cards = useCardsStore()
const saved = useSavedWordsStore()
const known = useWordStatusStore()
const activity = useActivityStore()

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const langs = computed<string[]>(() => profiles.active?.languages ?? [])
const lang = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : (langs.value[0] ?? ''),
)
const scope = computed<TrainScope>(() =>
  SCOPES.includes(str(route.query.list) as TrainScope)
    ? (str(route.query.list) as TrainScope)
    : 'all',
)

function setQuery(patch: Record<string, string>): void {
  void router.replace({ query: { ...route.query, ...patch } })
}

const status = ref<'loading' | 'ready' | 'failed'>('loading')
const entries = ref<CatalogEntry[]>([])
const canHear = ref(false)

async function load(): Promise<void> {
  if (!lang.value) return
  status.value = 'loading'
  try {
    const pid = profiles.activeId
    await Promise.all([
      cards.profileId !== pid ? cards.forProfile(pid) : null,
      saved.profileId !== pid ? saved.forProfile(pid) : null,
      known.profileId !== pid ? known.forProfile(pid) : null,
      activity.profileId !== pid ? activity.forProfile(pid) : null,
    ])
    const [list, hear] = await Promise.all([loadLanguage(lang.value), canHearWords(lang.value)])
    entries.value = list
    canHear.value = hear
    status.value = 'ready'
  } catch {
    status.value = 'failed'
  }
}

watch([lang, () => profiles.activeId], load, { immediate: true })

const planInput = (s: TrainScope): PlanInput => ({
  entries: entries.value,
  cards: cards.cards,
  scope: s,
  saved: saved.keys,
  statuses: known.statuses,
  now: new Date(),
})
const stats = computed(() => scopeStats(planInput(scope.value)))
const planned = computed(() => planRound(planInput(scope.value)))

// --- раунд ---
const phase = ref<'setup' | 'round' | 'summary'>('setup')
const round = ref<Round | null>(null)
/** Итог по словам раунда: оценка и было ли слово новым. */
const results = ref(new Map<string, { word: CatalogEntry; grade: Grade; fresh: boolean }>())
const freshKeys = new Set<string>()
const saving = ref(false)

function start(): void {
  const words = planned.value
  if (!words.length) return
  freshKeys.clear()
  for (const w of words) if (!w.card) freshKeys.add(keyOf(w.word))
  const steps = buildRound(words, entries.value, {
    locale: locale.value,
    canHear: canHear.value,
    rng: Math.random,
  })
  round.value = startRound(steps)
  results.value = new Map()
  phase.value = 'round'
}

const step = computed(() => (round.value ? currentTask(round.value.practice) : null))
const bar = computed(() => {
  const p = round.value?.practice
  return !p || !p.queue.length ? 1 : p.pos / p.queue.length
})

async function onAnswer(correct: boolean, accent = false): Promise<void> {
  const r = round.value
  const item = r && currentTask(r.practice)
  if (!r || !item || saving.value) return
  saving.value = true
  try {
    const { round: next, graded } = answerRound(r, correct, accent)
    if (graded && item.task.kind !== 'intro') {
      const pid = profiles.activeId
      const now = new Date()
      const card = cards.get(graded.key) ?? (pid ? newCard(pid, graded.key, now) : null)
      if (card) {
        await cards.putMany([review(card, graded.grade, now)])
        await activity.record('review')
      }
      results.value = new Map(results.value).set(graded.key, {
        word: item.task.word,
        grade: graded.grade,
        fresh: freshKeys.has(graded.key),
      })
    }
    round.value = next
    if (practiceFinished(next.practice)) phase.value = 'summary'
  } finally {
    saving.value = false
  }
}

const summary = computed(() => {
  const list = [...results.value.values()]
  return {
    total: list.length,
    correct: list.filter((r) => r.grade > 1).length,
    fresh: list.filter((r) => r.fresh).length,
    reviewed: list.filter((r) => !r.fresh).length,
    mistakes: list.filter((r) => r.grade === 1).map((r) => r.word),
  }
})
const accuracy = computed(() =>
  summary.value.total ? summary.value.correct / summary.value.total : 1,
)

const translation = (e: CatalogEntry) =>
  e.translations[locale.value] ?? e.translations.ru ?? Object.values(e.translations)[0]

const emptyKey = computed(() =>
  scope.value === 'saved' ? 'saved' : scope.value === 'hard' ? 'hard' : 'done',
)

function close(): void {
  if (phase.value === 'round') {
    phase.value = 'setup'
    return
  }
  if (window.history.state?.back) router.back()
  else void router.replace({ path: '/dictionary', query: { lang: lang.value } })
}
</script>

<template>
  <IonPage :data-lang="lang || undefined">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton :aria-label="t('train.close')" @click="close">
            <IonIcon slot="icon-only" :icon="closeOutline" aria-hidden="true" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ t('train.title') }}</IonTitle>
        <LangBadge v-if="lang && phase !== 'setup'" slot="end" :lang="lang" class="train__badge" />
      </IonToolbar>
      <IonProgressBar v-if="phase === 'round'" :value="bar" />
    </IonHeader>
    <IonContent class="ion-padding">
      <UiSkeleton v-if="status === 'loading'" class="train__skeleton" />

      <UiEmptyState
        v-else-if="status === 'failed'"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('train.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('dictionary.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <!-- настройка -->
      <section v-else-if="phase === 'setup'" class="train__step">
        <h2 class="train__label">{{ t('train.language') }}</h2>
        <div class="train__langs" role="group">
          <UiChip
            v-for="l in langs"
            :key="l"
            :data-lang="l"
            :selected="l === lang"
            class="train__lang"
            @click="setQuery({ lang: l })"
          >
            <span class="train__lang-code">{{ l.toUpperCase() }}</span>
            {{ t(`profiles.lang.${l}`) }}
          </UiChip>
        </div>

        <h2 class="train__label">{{ t('train.scope') }}</h2>
        <div class="train__scopes" role="group">
          <UiChip
            v-for="s in SCOPES"
            :key="s"
            :selected="s === scope"
            @click="setQuery({ list: s })"
          >
            {{ t(`train.scopes.${s}`) }}
            <span v-if="s === 'hard' && stats.hard" class="train__chip-count">{{
              stats.hard
            }}</span>
          </UiChip>
        </div>

        <div class="train__stats">
          <div class="train__stat">
            <strong>{{ stats.due }}</strong>
            <span>{{ t('train.stats.due') }}</span>
          </div>
          <div v-if="scope !== 'hard'" class="train__stat">
            <strong>{{ stats.fresh }}</strong>
            <span>{{ t('train.stats.fresh') }}</span>
          </div>
          <div v-else class="train__stat">
            <strong>{{ stats.hard }}</strong>
            <span>{{ t('train.stats.hard') }}</span>
          </div>
        </div>
        <p class="train__how">
          {{ scope === 'hard' ? t('train.howHard') : t('train.how', { n: NEW_MAX }) }}
        </p>

        <UiEmptyState
          v-if="!planned.length"
          variant="empty"
          :icon="scope === 'saved' ? starOutline : checkmarkDoneOutline"
          :title="t(`train.empty.${emptyKey}`)"
          :description="t(`train.empty.${emptyKey}Hint`)"
        />

        <div class="train__bottom">
          <UiButton full-width size="lg" :disabled="!planned.length" @click="start">
            {{ t('train.start', { n: planned.length }, planned.length) }}
          </UiButton>
        </div>
      </section>

      <!-- раунд -->
      <template v-else-if="phase === 'round' && step">
        <section v-if="step.task.kind === 'intro'" :key="round!.practice.pos" class="train__step">
          <p class="train__label">{{ t('train.newWord') }}</p>
          <WordIntro :word="step.task.word" :lang="lang" />
          <div class="train__bottom">
            <UiButton full-width size="lg" @click="onAnswer(true)">{{
              t('lessons.next')
            }}</UiButton>
          </div>
        </section>
        <PracticeTask
          v-else
          :key="round!.practice.pos"
          :task="step.task.task"
          :retry="step.retry"
          :lang="lang"
          @next="onAnswer"
        />
      </template>

      <!-- итог -->
      <section v-else-if="phase === 'summary'" class="train__step train__summary">
        <UiProgressRing
          :value="accuracy"
          :size="140"
          :stroke="12"
          :label="t('train.summary.score', { correct: summary.correct, total: summary.total })"
        >
          <span class="train__score">{{ Math.round(accuracy * 100) }}<small>%</small></span>
        </UiProgressRing>
        <h1>{{ t('train.summary.title') }}</h1>
        <p class="train__muted">
          {{ t('train.summary.score', { correct: summary.correct, total: summary.total }) }}
        </p>
        <div class="train__stats">
          <div class="train__stat">
            <strong>{{ summary.fresh }}</strong>
            <span>{{ t('train.summary.fresh') }}</span>
          </div>
          <div class="train__stat">
            <strong>{{ summary.reviewed }}</strong>
            <span>{{ t('train.summary.reviewed') }}</span>
          </div>
        </div>
        <template v-if="summary.mistakes.length">
          <h2 class="train__label">{{ t('train.summary.mistakes') }}</h2>
          <ul class="train__words">
            <li v-for="w in summary.mistakes" :key="w.id">
              <RouterLink :to="`/dictionary/${w.lang}/${w.id}`" class="train__word-link">
                <span class="train__word-lemma">
                  <WordArticle :word="w" />
                  <strong :lang="lang">{{ w.lemma }}</strong>
                </span>
                <span class="train__muted">{{ translation(w) }}</span>
              </RouterLink>
            </li>
          </ul>
        </template>
        <div class="train__bottom">
          <UiButton full-width size="lg" :disabled="!planned.length" @click="start">{{
            t('train.summary.again')
          }}</UiButton>
          <UiButton variant="ghost" full-width @click="close">{{
            t('train.summary.done')
          }}</UiButton>
        </div>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.train__badge {
  margin-right: 8px;
}

.train__skeleton {
  height: 160px;
  border-radius: var(--radius-lg);
}

.train__step {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
  min-height: 100%;
}

.train__label {
  margin: 0;
  color: var(--tint-ink, var(--color-fg-muted));
  font-size: var(--fs-meta);
  font-weight: 700;
}

.train__langs {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
}

.train__lang {
  min-height: 48px;
}

.train__lang-code {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  opacity: 0.8;
}

.train__scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.train__chip-count {
  min-width: 1.4em;
  padding: 0 6px;
  border-radius: var(--radius-xl);
  background: var(--reward-soft);
  color: var(--reward-ink);
  font-size: 0.75rem;
  font-weight: 700;
}

.train__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-self: stretch;
}

.train__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  text-align: left;
}

.train__stat strong {
  color: var(--tint-ink);
  font-size: 1.8rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.train__stat span {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.train__how,
.train__muted {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  line-height: 1.5;
}

.train__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  margin-top: auto;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.train__summary {
  align-items: center;
  text-align: center;
}

.train__summary h1 {
  margin: 4px 0 0;
  font-size: var(--fs-display);
}

.train__summary .train__label,
.train__summary .train__words {
  align-self: stretch;
  text-align: left;
}

.train__score {
  font-size: 2.4rem;
  font-weight: 750;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.train__score small {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.train__words {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.train__word-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--color-fg);
  text-decoration: none;
}

.train__word-lemma {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.train__word-lemma strong {
  color: var(--tint-ink);
  font-size: 1.3rem;
  font-weight: 600;
}
</style>
