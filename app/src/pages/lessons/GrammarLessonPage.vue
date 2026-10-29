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
import { alertCircleOutline, bookOutline, closeOutline, searchOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useActivityStore } from '@/features/activity'
import { SpeakButton, useWordStatusStore } from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import {
  GrammarRule,
  PracticeTask,
  RuleLinks,
  UpNext,
  answerPractice,
  buildGrammarPractice,
  currentTask,
  grammarRefs,
  lessonRoute,
  loadLessons,
  nextLesson,
  practiceFinished,
  practiceScore,
  ruleRoute,
  startPractice,
  useLessonProgressStore,
  type GrammarLesson,
  type GrammarTask,
  type Lesson,
  type Practice,
  CodeText,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { grammarKey, useCardsStore } from '@/features/review'
import { SongLinks, libraryDocs, songsForRule, type TextDoc } from '@/features/texts'
import { UiButton, UiEmptyState, UiProgressRing, UiSkeleton } from '@/shared/ui'

// Плеер урока грамматики (LNG-S1-033, D-38): паттерн → правило на одном экране → мост →
// практика → итог со ссылкой на справочник. Прогресс — только на итоге, как у урока слов.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const activity = useActivityStore()
const cards = useCardsStore()
const wordStatus = useWordStatusStore()

const all = ref<Lesson[]>([])
/** Песни библиотеки — «правило в песнях» на итоге (D-42). */
const library = ref<TextDoc[]>([])
void libraryDocs()
  .then((docs) => (library.value = docs))
  .catch(() => undefined)
const lesson = ref<GrammarLesson | null>(null)
const step = ref(0)
const practice = ref<Practice<GrammarTask> | null>(null)
const finalScore = ref<number | null>(null)
const status = ref<'loading' | 'ready' | 'missing' | 'failed'>('loading')

/** Мост показываем только на языки, которые учит профиль: чужой язык — шум (curriculum, п. 3). */
const bridges = computed(() =>
  (lesson.value?.bridge ?? []).filter((b) =>
    (profiles.active?.languages ?? [b.lang]).includes(b.lang),
  ),
)
type Intro = 'pattern' | 'rule' | 'bridge'
const intro = computed<Intro[]>(() => [
  'pattern',
  'rule',
  ...(bridges.value.length ? (['bridge'] as const) : []),
])

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    all.value = await loadLessons()
    const found = all.value.find((l) => l.id === String(route.params.id ?? ''))
    if (found?.kind !== 'grammar') {
      status.value = 'missing'
      return
    }
    lesson.value = found
    step.value = 0
    finalScore.value = null
    practice.value = startPractice(
      buildGrammarPractice(found, { locale: locale.value, rng: Math.random }),
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
    if (activity.profileId !== pid) void activity.forProfile(pid)
    if (cards.profileId !== pid) void cards.forProfile(pid)
    if (wordStatus.profileId !== pid) void wordStatus.forProfile(pid)
  },
  { immediate: true },
)

const inIntro = computed(() => step.value < intro.value.length)
const introStep = computed(() => intro.value[step.value])
const task = computed(() => (practice.value ? currentTask(practice.value) : null))
const done = computed(() => finalScore.value !== null)
const bar = computed(() => {
  const total = intro.value.length + (practice.value?.queue.length ?? 0)
  const pos = step.value + (practice.value?.pos ?? 0)
  return done.value || !total ? 1 : pos / total
})
const accuracy = computed(() =>
  practice.value?.total ? practice.value.firstTry / practice.value.total : 1,
)

const lang = computed(() => lesson.value?.lang ?? '')
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
/** Перевод примера: язык интерфейса, иначе русский; язык оригинала не подходит. */
const tr = (ex: Record<string, unknown>, own: string) => {
  const pick = (k: string) => (k !== own && typeof ex[k] === 'string' ? (ex[k] as string) : '')
  return pick(locale.value) || pick('ru')
}
const see = computed(() => grammarRefs(lesson.value?.see, all.value))
const songs = computed(() => (lesson.value ? songsForRule(library.value, lesson.value.id) : []))

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
  if (!practice.value || !lesson.value || inIntro.value || !practiceFinished(practice.value)) return
  const score = practiceScore(practice.value)
  await progress.complete(lesson.value.id, score)
  // Тема — в интервальное повторение (D-40): упражнения вернутся вперемешку со словами.
  await cards.addGrammar([grammarKey(lesson.value)])
  await activity.record('lesson')
  finalScore.value = score
}

/** Следующий шаг пути после итога (D-40). */
const upNext = computed(() =>
  done.value && lesson.value
    ? nextLesson(all.value, lesson.value.lang, progress.doneIds(), wordStatus.knownKeys()).next
    : null,
)
const goNext = () => upNext.value && router.replace(lessonRoute(upNext.value))

function close(): void {
  if (window.history.state?.back) router.back()
  else void router.replace('/lessons')
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
        <LangBadge v-if="lang" slot="end" :lang="lang" class="grammar__badge" />
      </IonToolbar>
      <IonProgressBar
        v-if="status === 'ready'"
        :value="bar"
        :aria-label="t('lessons.progress', { n: Math.round(bar * 100) })"
      />
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="grammar__skeleton" />
        <UiSkeleton class="grammar__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="status === 'missing'"
        variant="empty"
        :icon="searchOutline"
        :title="t('lessons.notFound')"
        :description="t('lessons.notFoundHint')"
      >
        <template #action>
          <UiButton @click="router.replace('/lessons')">{{ t('lessons.toLessons') }}</UiButton>
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
        <section v-if="inIntro && introStep" :key="step" class="grammar__step">
          <template v-if="introStep === 'pattern'">
            <p class="grammar__label">
              {{ t('lessons.grammar.pattern') }}
              <span v-if="lesson.code" class="grammar__code">{{ lesson.code }}</span>
            </p>
            <p class="grammar__hint">{{ t('lessons.grammar.patternHint') }}</p>
            <ul class="grammar__examples">
              <li v-for="(ex, i) in lesson.pattern" :key="i">
                <div class="grammar__line">
                  <span :lang="lang" class="grammar__example">{{ ex[lang] }}</span>
                  <SpeakButton :text="String(ex[lang] ?? '')" :lang="lang" />
                </div>
                <span class="grammar__muted">{{ tr(ex, lang) }}</span>
              </li>
            </ul>
          </template>

          <template v-else-if="introStep === 'rule'">
            <p class="grammar__label">{{ t('lessons.grammar.rule') }}</p>
            <GrammarRule :rule="lesson.rule" :lang="lang" />
          </template>

          <template v-else>
            <p class="grammar__label">{{ t('lessons.grammar.bridge') }}</p>
            <article v-for="b in bridges" :key="b.lang" class="grammar__bridge" :data-lang="b.lang">
              <p v-if="b.formula" class="grammar__bridge-formula" :lang="b.lang">
                <LangBadge :lang="b.lang" />
                {{ b.formula }}
              </p>
              <template v-for="(ex, i) in b.examples ?? []" :key="i">
                <div class="grammar__line">
                  <span :lang="b.lang" class="grammar__example">{{ ex[b.lang] }}</span>
                  <SpeakButton :text="String(ex[b.lang] ?? '')" :lang="b.lang" />
                </div>
                <span class="grammar__muted">{{ tr(ex, b.lang) }}</span>
              </template>
              <p v-if="b.note" class="grammar__note"><CodeText :text="local(b.note)" /></p>
              <RouterLink v-if="b.lesson" :to="ruleRoute(b.lesson)" class="grammar__bridge-link">
                <IonIcon :icon="bookOutline" aria-hidden="true" />
                {{ t('lessons.grammar.bridgeRule') }}
              </RouterLink>
            </article>
          </template>

          <div class="grammar__bottom">
            <UiButton full-width size="lg" @click="nextIntro">{{ t('lessons.next') }}</UiButton>
          </div>
        </section>

        <PracticeTask
          v-else-if="task && !done"
          :key="practice!.pos"
          :task="task.task"
          :retry="task.retry"
          :lang="lang"
          @next="onAnswer"
        />

        <section v-else-if="done" class="grammar__step grammar__summary">
          <UiProgressRing
            v-if="practice?.total"
            :value="accuracy"
            :size="140"
            :stroke="12"
            :label="
              t('lessons.summary.score', { correct: practice.firstTry, total: practice.total })
            "
          >
            <span class="grammar__score">{{ Math.round(accuracy * 100) }}<small>%</small></span>
          </UiProgressRing>
          <h1 class="grammar__summary-title">{{ t('lessons.grammar.summary') }}</h1>
          <p v-if="lesson.rule.formula" class="grammar__formula" :lang="lang">
            {{ lesson.rule.formula }}
          </p>
          <RouterLink :to="ruleRoute(lesson.id)" class="grammar__handbook">
            <IonIcon :icon="bookOutline" aria-hidden="true" />
            {{ t('lessons.grammar.toHandbook') }}
          </RouterLink>
          <p class="grammar__review">{{ t('lessons.grammar.toReview') }}</p>
          <SongLinks :songs="songs" :title="t('lessons.grammar.songs')" class="grammar__see" />
          <RuleLinks :rules="see" :title="t('lessons.grammar.see')" class="grammar__see" />
          <div class="grammar__bottom">
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
.grammar__badge {
  margin-right: 8px;
}

.grammar__skeleton {
  height: 96px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

.grammar__step {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
  min-height: 100%;
}

.grammar__review {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  text-align: center;
}

.grammar__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.grammar__label {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.grammar__code {
  color: var(--color-fg-subtle);
  font-weight: 650;
}

.grammar__hint {
  margin: 0;
  color: var(--color-fg-muted);
}

.grammar__examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.grammar__examples li,
.grammar__bridge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.grammar__line {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.grammar__example {
  font-size: 1.2rem;
  line-height: 1.4;
}

.grammar__muted {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.grammar__bridge-formula {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 4px;
  color: var(--tint-ink);
  font-size: 1.1rem;
  font-weight: 600;
}

.grammar__note {
  margin: 6px 0 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  line-height: 1.5;
}

.grammar__bridge-link,
.grammar__handbook {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  align-self: flex-start;
  margin-top: 6px;
  color: var(--tint-ink);
  font-weight: 650;
  text-decoration: none;
}

.grammar__summary {
  align-items: center;
  text-align: center;
}

.grammar__summary-title {
  margin: 4px 0 0;
  font-size: var(--fs-display);
}

.grammar__score {
  font-size: 2.4rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.grammar__score small {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.grammar__formula {
  margin: 0;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-weight: 600;
}

.grammar__handbook {
  align-self: center;
}

.grammar__see,
.grammar__summary .grammar__bottom {
  align-self: stretch;
  text-align: left;
}
</style>
