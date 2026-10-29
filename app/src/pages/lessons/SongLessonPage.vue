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
import {
  alertCircleOutline,
  closeOutline,
  documentTextOutline,
  searchOutline,
} from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useActivityStore } from '@/features/activity'
import { SpeakButton, useWordStatusStore } from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import {
  PracticeTask,
  RuleLinks,
  UpNext,
  answerPractice,
  currentTask,
  grammarRefs,
  lessonRoute,
  loadLessons,
  nextLesson,
  practiceFinished,
  practiceScore,
  startPractice,
  useLessonProgressStore,
  type Lesson,
  type Practice,
  CodeText,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { useCardsStore } from '@/features/review'
import {
  buildSongPractice,
  libraryDocs,
  songLessonId,
  songStanzas,
  textIn,
  textPhrases,
  translationOf,
  type Line,
  type Phrase,
  type TextDoc,
} from '@/features/texts'
import { UiButton, UiEmptyState, UiProgressRing, UiSkeleton } from '@/shared/ui'

// Урок по песне (LNG-S1-035, D-42): «о песне» (правила, заметка) → разбор строф (перевод,
// дословно, фразы с пояснениями) → практика по фразам → итог: фразы в повторении,
// прогресс `song:<id>`, «Дальше» по пути. Работает и для своих загруженных песен.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const cards = useCardsStore()
const activity = useActivityStore()
const wordStatus = useWordStatusStore()

const lessons = ref<Lesson[]>([])
const doc = ref<TextDoc | null>(null)
const step = ref(0)
const practice = ref<Practice | null>(null)
const finalScore = ref<number | null>(null)
const added = ref(0)
const status = ref<'loading' | 'ready' | 'missing' | 'failed'>('loading')

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    const [docs, all] = await Promise.all([libraryDocs(), loadLessons()])
    lessons.value = all
    const found = docs.find((d) => d.id === String(route.params.id ?? ''))
    if (!found) {
      status.value = 'missing'
      return
    }
    doc.value = found
    step.value = 0
    finalScore.value = null
    practice.value = startPractice(
      buildSongPractice(found, { locale: locale.value, rng: Math.random }),
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

const lang = computed(() => doc.value?.lang ?? '')
const stanzas = computed(() => (doc.value ? songStanzas(doc.value) : []))
/** Шаг 0 — «о песне», дальше — строфы по одной. */
const introCount = computed(() => 1 + stanzas.value.length)
const inIntro = computed(() => step.value < introCount.value)
const stanza = computed(() => (step.value > 0 ? stanzas.value[step.value - 1] : undefined))
const task = computed(() => (practice.value ? currentTask(practice.value) : null))
const done = computed(() => finalScore.value !== null)
const bar = computed(() => {
  const total = introCount.value + (practice.value?.queue.length ?? 0)
  const pos = step.value + (practice.value?.pos ?? 0)
  return done.value || !total ? 1 : pos / total
})
const accuracy = computed(() =>
  practice.value?.total ? practice.value.firstTry / practice.value.total : 1,
)
const rules = computed(() => grammarRefs(doc.value?.see, lessons.value))
const phrasesTotal = computed(() => (doc.value ? textPhrases([doc.value], locale.value).length : 0))

const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const original = (node: Line | Phrase) => textIn(node, lang.value) ?? ''
const translated = (node: Line | Phrase) => translationOf(node, lang.value, locale.value)?.text
const titleTr = computed(() => {
  const d = doc.value
  return d ? Object.entries(d.title).find(([k]) => k !== d.lang && k === locale.value)?.[1] : ''
})

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
  const d = doc.value
  if (!practice.value || !d || inIntro.value || !practiceFinished(practice.value)) return
  const score = practice.value.total ? practiceScore(practice.value) : 1
  await progress.complete(songLessonId(d.id), score)
  // Фразы песни — в интервальное повторение (LNG-S1-027): новые — на завтра, прежние не меняются.
  const keys = textPhrases([d], locale.value).map((p) => p.key)
  const fresh = keys.filter((k) => !cards.get(k))
  await cards.addLessonWords(keys)
  await activity.record('lesson')
  added.value = fresh.length
  finalScore.value = score
}

/** Следующий шаг пути после песни (D-40). */
const upNext = computed(() =>
  done.value && doc.value
    ? nextLesson(lessons.value, doc.value.lang, progress.doneIds(), wordStatus.knownKeys()).next
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
        <IonTitle>{{ doc ? doc.title[doc.lang] : t('songs.title') }}</IonTitle>
        <LangBadge v-if="lang" slot="end" :lang="lang" class="song__badge" />
      </IonToolbar>
      <IonProgressBar
        v-if="status === 'ready'"
        :value="bar"
        :aria-label="t('lessons.progress', { n: Math.round(bar * 100) })"
      />
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="song__skeleton" />
        <UiSkeleton class="song__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="status === 'missing'"
        variant="empty"
        :icon="searchOutline"
        :title="t('texts.ui.read.notFound')"
        :description="t('texts.ui.read.notFoundHint')"
      >
        <template #action>
          <UiButton @click="router.replace('/texts')">{{ t('songs.library') }}</UiButton>
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

      <template v-else-if="doc">
        <section v-if="inIntro" :key="step" class="song__step">
          <template v-if="step === 0">
            <p class="song__label">{{ t('songs.overview') }}</p>
            <div class="song__head">
              <h1 :lang="lang">{{ doc.title[doc.lang] }}</h1>
              <p v-if="titleTr" class="song__muted">{{ titleTr }}</p>
              <p class="song__meta">
                <template v-if="doc.performer">{{ doc.performer }} · </template>
                <template v-if="doc.level">{{ doc.level }} · </template>
                {{ t('songs.phrases', { n: phrasesTotal }, phrasesTotal) }}
              </p>
            </div>
            <p v-if="doc.note" class="song__note"><CodeText :text="local(doc.note)" /></p>
            <RuleLinks :rules="rules" :title="t('songs.rules')" />
          </template>

          <template v-else-if="stanza">
            <p class="song__label">
              {{ t('songs.stanza', { n: step, total: stanzas.length }) }}
              <span v-if="stanza.speaker" class="song__type" :lang="lang">{{
                stanza.speaker
              }}</span>
              <span v-else class="song__type">{{ t(`texts.ui.read.stanza.${stanza.type}`) }}</span>
            </p>
            <article v-for="(line, i) in stanza.lines" :key="i" class="song__line">
              <div class="song__row">
                <span :lang="lang" class="song__original">{{ original(line) }}</span>
                <SpeakButton :text="original(line)" :lang="lang" />
              </div>
              <span v-if="translated(line)" class="song__muted">{{ translated(line) }}</span>
              <span v-if="line.lit" class="song__extra">
                <strong>{{ t('texts.ui.read.literal') }}:</strong> {{ local(line.lit) }}
              </span>
              <span v-if="line.note" class="song__extra"
                ><CodeText :text="local(line.note)"
              /></span>
              <ul v-if="line.phrases?.length" class="song__phrases">
                <li v-for="(p, j) in line.phrases" :key="j">
                  <strong :lang="lang">{{ original(p) }}</strong>
                  <span v-if="translated(p)"> — {{ translated(p) }}</span>
                  <span v-if="p.note" class="song__phrase-note"
                    ><CodeText :text="local(p.note)"
                  /></span>
                </li>
              </ul>
            </article>
            <p class="song__hint">{{ t('songs.phrasesHint') }}</p>
          </template>

          <div class="song__bottom">
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

        <section v-else-if="done" class="song__step song__summary">
          <UiProgressRing
            v-if="practice?.total"
            :value="accuracy"
            :size="140"
            :stroke="12"
            :label="
              t('lessons.summary.score', { correct: practice.firstTry, total: practice.total })
            "
          >
            <span class="song__score">{{ Math.round(accuracy * 100) }}<small>%</small></span>
          </UiProgressRing>
          <h1 class="song__summary-title">{{ t('songs.summary') }}</h1>
          <p v-if="added" class="song__muted">{{ t('songs.toReview', { n: added }, added) }}</p>
          <RouterLink :to="`/texts/${doc.id}`" class="song__link">
            <IonIcon :icon="documentTextOutline" aria-hidden="true" />
            {{ t('songs.toText') }}
          </RouterLink>
          <RuleLinks :rules="rules" :title="t('songs.rules')" class="song__rules" />
          <div class="song__bottom">
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
.song__badge {
  margin-right: 8px;
}

.song__skeleton {
  height: 96px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

.song__step {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
  min-height: 100%;
}

.song__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.song__label {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.song__type {
  color: var(--color-fg-subtle);
  font-weight: 650;
}

.song__head h1 {
  margin: 0;
  font-size: var(--fs-display);
  line-height: 1.2;
}

.song__head p {
  margin: 4px 0 0;
}

.song__meta {
  color: var(--color-fg-subtle);
  font-size: var(--fs-meta);
}

.song__note {
  margin: 0;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  line-height: 1.5;
}

.song__line {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-stroke);
}

.song__row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.song__original {
  font-size: 1.15rem;
  line-height: 1.4;
}

.song__muted {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.song__extra {
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
}

.song__phrases {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0 0;
  padding: 8px 0 0;
  border-top: 1px solid var(--color-stroke);
  list-style: none;
  font-size: var(--fs-meta);
}

.song__phrases strong {
  color: var(--tint-ink);
}

.song__phrase-note {
  display: block;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
}

.song__hint {
  margin: 0;
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
}

.song__summary {
  align-items: center;
  text-align: center;
}

.song__summary-title {
  margin: 4px 0 0;
  font-size: var(--fs-display);
}

.song__score {
  font-size: 2.4rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.song__score small {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.song__link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--tint-ink);
  font-weight: 650;
  text-decoration: none;
}

.song__rules {
  align-self: stretch;
  text-align: left;
}
</style>
