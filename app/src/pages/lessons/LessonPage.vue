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
import { alertCircleOutline, closeOutline, searchOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  SpeakButton,
  WordArticle,
  canHearWords,
  keyOf,
  loadLanguage,
  useWordStatusStore,
  type CatalogEntry,
} from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import {
  PracticeTask,
  RuleLinks,
  UpNext,
  WordIntro,
  answerPractice,
  buildPractice,
  currentTask,
  grammarRefs,
  introSteps,
  lessonRoute,
  lessonWords,
  loadLessons,
  nextLesson,
  practiceFinished,
  practiceScore,
  startPractice,
  useLessonProgressStore,
  type GrammarLesson,
  type IntroStep,
  type Lesson,
  type Practice,
  type WordsLesson,
  CodeText,
} from '@/features/lessons'
import { useActivityStore } from '@/features/activity'
import { useProfilesStore } from '@/features/profiles'
import { useCardsStore } from '@/features/review'
import { UiButton, UiEmptyState, UiProgressRing, UiSkeleton } from '@/shared/ui'

// Плеер урока слов (LNG-S1-017): знакомство → практика → итог; прогресс — только на итоге (AC-7).
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const cards = useCardsStore()
const activity = useActivityStore()
const wordStatus = useWordStatusStore()

const all = ref<Lesson[]>([])
const lesson = ref<WordsLesson | null>(null)
/** Отсылки к правилам грамматики (D-38): на шаге мини-правила и в итоге. */
const rules = ref<GrammarLesson[]>([])
const words = ref<CatalogEntry[]>([])
const intro = ref<IntroStep[]>([])
const step = ref(0)
const practice = ref<Practice | null>(null)
const finalScore = ref<number | null>(null)
const status = ref<'loading' | 'ready' | 'missing' | 'failed'>('loading')

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    const id = String(route.params.id ?? '')
    all.value = await loadLessons()
    const found = all.value.find((l) => l.id === id)
    if (found?.kind !== 'words') {
      status.value = 'missing'
      return
    }
    rules.value = grammarRefs(found.see, all.value)
    const entries = await loadLanguage(found.lang)
    lesson.value = found
    words.value = lessonWords(found, entries)
    intro.value = introSteps(found, words.value)
    step.value = 0
    finalScore.value = null
    practice.value = startPractice(
      buildPractice(found, words.value, entries, {
        locale: locale.value,
        canHear: await canHearWords(found.lang),
        rng: Math.random,
      }),
    )
    status.value = 'ready'
  } catch {
    status.value = 'failed'
  }
}

watch(() => route.params.id, load, { immediate: true })
watch(
  () => profiles.activeId,
  (pid) => {
    if (progress.profileId !== pid) void progress.forProfile(pid)
    if (cards.profileId !== pid) void cards.forProfile(pid)
    if (activity.profileId !== pid) void activity.forProfile(pid)
    if (wordStatus.profileId !== pid) void wordStatus.forProfile(pid)
  },
  { immediate: true },
)

const inIntro = computed(() => step.value < intro.value.length)
const introStep = computed(() => intro.value[step.value])
const task = computed(() => (practice.value ? currentTask(practice.value) : null))
const done = computed(() => finalScore.value !== null)

/** Полоса: шаги знакомства + задания очереди (с повторами — она растёт на ошибках). */
const bar = computed(() => {
  const total = intro.value.length + (practice.value?.queue.length ?? 0)
  const pos = step.value + (practice.value?.pos ?? 0)
  return done.value || !total ? 1 : pos / total
})

const lang = computed(() => lesson.value?.lang ?? '')
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const translationOf = (item: Record<string, unknown>) =>
  local(
    Object.fromEntries(
      Object.entries(item).filter(
        (e): e is [string, string] =>
          e[0].length === 2 && e[0] !== lang.value && typeof e[1] === 'string',
      ),
    ),
  )
const fullTr = (w: CatalogEntry) => local(w.translations)
/** Номер нового слова среди слов урока — «2/3» в шапке шага. */
const wordNo = computed(
  () => intro.value.slice(0, step.value + 1).filter((s) => s.kind === 'word').length,
)
const accuracy = computed(() =>
  practice.value?.total ? practice.value.firstTry / practice.value.total : 1,
)

function nextIntro(): void {
  step.value++
  if (!inIntro.value) void finishIfDone()
}

async function onAnswer(correct: boolean): Promise<void> {
  if (!practice.value) return
  practice.value = answerPractice(practice.value, correct)
  await finishIfDone()
}

async function finishIfDone(): Promise<void> {
  if (!practice.value || !lesson.value || !practiceFinished(practice.value)) return
  const score = practiceScore(practice.value)
  await progress.complete(lesson.value.id, score)
  // Слова урока уходят в интервальное повторение (LNG-S1-023, AC-3).
  await cards.addLessonWords(words.value.map(keyOf))
  await activity.record('lesson')
  finalScore.value = score
}

/** Следующий шаг пути после итога (D-40): урок слов или тема грамматики. */
const upNext = computed(() =>
  done.value && lesson.value
    ? nextLesson(all.value, lesson.value.lang, progress.doneIds(), wordStatus.knownKeys()).next
    : null,
)
const goNext = () => upNext.value && router.replace(lessonRoute(upNext.value))

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
          <IonButton :aria-label="t('lessons.close')" @click="close">
            <IonIcon slot="icon-only" :icon="closeOutline" aria-hidden="true" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ lesson ? local(lesson.title) : t('lessons.title') }}</IonTitle>
        <LangBadge v-if="lang" slot="end" :lang="lang" class="lesson__badge" />
      </IonToolbar>
      <IonProgressBar
        v-if="status === 'ready'"
        :value="bar"
        :aria-label="t('lessons.progress', { n: Math.round(bar * 100) })"
      />
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="lesson__skeleton" />
        <UiSkeleton class="lesson__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="status === 'missing'"
        variant="empty"
        :icon="searchOutline"
        :title="t('lessons.notFound')"
        :description="t('lessons.notFoundHint')"
      >
        <template #action>
          <UiButton @click="router.replace('/home')">{{ t('lessons.toHome') }}</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState
        v-else-if="status === 'failed'"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('lessons.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="lesson">
        <!-- знакомство -->
        <section v-if="inIntro && introStep" :key="step" class="lesson__step">
          <template v-if="introStep.kind === 'word'">
            <p class="lesson__label">
              {{ t('lessons.newWord') }}
              <span class="lesson__count">{{ wordNo }}/{{ words.length }}</span>
            </p>
            <WordIntro :word="introStep.word" :lang="lang" :topic="lesson.topic" />
          </template>

          <template v-else-if="introStep.kind === 'phrase'">
            <p class="lesson__label">{{ t('lessons.phrase') }}</p>
            <div class="lesson__hero lesson__hero--phrase">
              <p class="lesson__phrase" :lang="lang">{{ lesson.phrase[lang] }}</p>
              <SpeakButton :text="lesson.phrase[lang] ?? ''" :lang="lang" size="lg" />
              <p class="lesson__tr">{{ translationOf(lesson.phrase) }}</p>
            </div>
            <p v-if="lesson.phrase.note" class="lesson__note">
              <CodeText :text="local(lesson.phrase.note)" />
            </p>
          </template>

          <template v-else-if="lesson.rule">
            <p class="lesson__label">{{ t('lessons.rule') }}</p>
            <p class="lesson__rule"><CodeText :text="local(lesson.rule.text)" /></p>
            <ul class="lesson__examples">
              <li v-for="(ex, i) in lesson.rule.examples ?? []" :key="i">
                <div class="lesson__line">
                  <span :lang="lang" class="lesson__example-text">{{ ex[lang] }}</span>
                  <SpeakButton :text="ex[lang] ?? ''" :lang="lang" />
                </div>
                <span class="lesson__muted">{{ translationOf(ex) }}</span>
              </li>
            </ul>
            <RuleLinks :rules="rules" :title="t('lessons.grammar.more')" />
          </template>

          <div class="lesson__bottom">
            <UiButton full-width size="lg" @click="nextIntro">{{ t('lessons.next') }}</UiButton>
          </div>
        </section>

        <!-- практика -->
        <PracticeTask
          v-else-if="task && !done"
          :key="practice!.pos"
          :task="task.task"
          :retry="task.retry"
          :lang="lang"
          @next="onAnswer"
        />

        <!-- итог -->
        <section v-else-if="done" class="lesson__step lesson__summary">
          <UiProgressRing
            :value="accuracy"
            :size="140"
            :stroke="12"
            :label="
              t('lessons.summary.score', { correct: practice!.firstTry, total: practice!.total })
            "
          >
            <span class="lesson__score">{{ Math.round(accuracy * 100) }}<small>%</small></span>
          </UiProgressRing>
          <h1 class="lesson__summary-title">{{ t('lessons.summary.title') }}</h1>
          <p class="lesson__muted lesson__summary-score">
            {{
              t('lessons.summary.score', {
                correct: practice!.firstTry,
                total: practice!.total,
              })
            }}
          </p>
          <h2 class="lesson__label">{{ t('lessons.summary.words') }}</h2>
          <ul class="lesson__words">
            <li v-for="w in words" :key="w.id">
              <RouterLink :to="`/dictionary/${w.lang}/${w.id}`" class="lesson__word-link">
                <span class="lesson__word-lemma">
                  <WordArticle :word="w" />
                  <strong :lang="lang">{{ w.lemma }}</strong>
                </span>
                <span class="lesson__muted">{{ fullTr(w) }}</span>
              </RouterLink>
            </li>
          </ul>
          <RuleLinks :rules="rules" :title="t('lessons.grammar.more')" class="lesson__rules" />
          <div class="lesson__bottom">
            <UpNext v-if="upNext" :lesson="upNext" @go="goNext" />
            <UiButton
              full-width
              :size="upNext ? 'md' : 'lg'"
              :variant="upNext ? 'secondary' : 'primary'"
              @click="close"
              >{{ t('lessons.summary.done') }}</UiButton
            >
            <UiButton variant="ghost" full-width @click="load">{{
              t('lessons.summary.again')
            }}</UiButton>
          </div>
        </section>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.lesson__badge {
  margin-right: 8px;
}

.lesson__skeleton {
  height: 96px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

/* Шаг на всю высоту: кнопка — внизу, под большим пальцем. */
.lesson__step {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
  min-height: 100%;
  animation: lesson-in var(--motion-duration-sheet) var(--motion-ease-standard);
}

.lesson__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.lesson__label {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.lesson__count {
  color: var(--color-fg-subtle);
  font-variant-numeric: tabular-nums;
}

.lesson__hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px var(--size-gutter);
  align-items: center;
  padding: calc(var(--size-gutter) * 1.5) calc(var(--size-gutter) * 1.25);
  border-radius: var(--radius-lg);
  background: var(--tint-soft);
}

.lesson__hero > :not(.speak) {
  grid-column: 1 / -1;
}

.lesson__tr {
  margin: 10px 0 0;
  font-size: var(--fs-h2);
  font-weight: 600;
}

.lesson__phrase {
  margin: 0;
  color: var(--tint-ink);
  font-size: clamp(1.7rem, 8vw, 2.2rem);
  font-weight: 600;
  line-height: 1.2;
}

.lesson__note {
  margin: 0;
  padding: 12px 14px;
  border-left: 3px solid var(--tint);
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  background: var(--color-surface);
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  line-height: 1.5;
}

.lesson__example-text {
  font-size: 1.25rem;
  line-height: 1.4;
}

.lesson__rule {
  margin: 0;
  font-size: var(--fs-h3);
  line-height: 1.55;
}

.lesson__line {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.lesson__muted {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.lesson__examples,
.lesson__words {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson__examples li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.lesson__summary {
  align-items: center;
  text-align: center;
}

.lesson__score {
  font-size: 2.4rem;
  font-weight: 750;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.lesson__score small {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.lesson__summary-title {
  margin: 4px 0 0;
  font-size: var(--fs-display);
}

.lesson__summary-score {
  margin-top: -8px;
}

.lesson__summary .lesson__rules,
.lesson__summary .lesson__label,
.lesson__summary .lesson__words,
.lesson__summary .lesson__bottom {
  align-self: stretch;
  text-align: left;
}

.lesson__word-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--color-fg);
  text-decoration: none;
}

.lesson__word-lemma {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.lesson__word-lemma strong {
  color: var(--tint-ink);
  font-size: 1.3rem;
  font-weight: 600;
}

@keyframes lesson-in {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
}
</style>
