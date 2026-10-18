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

import { useActivityStore } from '@/features/activity'
import {
  SoundButton,
  SoundPractice,
  alphabetOf,
  answerPractice,
  buildSoundPractice,
  currentTask,
  loadLessons,
  practiceFinished,
  practiceScore,
  startPractice,
  useLessonProgressStore,
  type Practice,
  type SoundLesson,
  type SoundTask,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { UiButton, UiCard, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Плеер урока звучания (LNG-S1-028): знакомство (буквы, правила) → практика → итог.
// Прогресс — только на итоге, как у урока слов.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const activity = useActivityStore()

const lesson = ref<SoundLesson | null>(null)
const step = ref(0)
const practice = ref<Practice<SoundTask> | null>(null)
const finalScore = ref<number | null>(null)
const status = ref<'loading' | 'ready' | 'missing' | 'failed'>('loading')

/** Шаги знакомства: алфавит одним экраном, затем по правилу на экран. */
type Intro = { kind: 'letters' } | { kind: 'rule'; index: number }
const intro = computed<Intro[]>(() => [
  ...(lesson.value?.letters?.length ? [{ kind: 'letters' as const }] : []),
  ...(lesson.value?.rules ?? []).map((_, index) => ({ kind: 'rule' as const, index })),
])

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    const all = await loadLessons()
    const found = all.find((l) => l.id === String(route.params.id ?? ''))
    if (found?.kind !== 'sound') {
      status.value = 'missing'
      return
    }
    lesson.value = found
    step.value = 0
    finalScore.value = null
    practice.value = startPractice(
      buildSoundPractice(found, alphabetOf(all, found.lang), Math.random),
    )
    status.value = 'ready'
    if (!intro.value.length) await finishIfDone()
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

const lang = computed(() => lesson.value?.lang ?? '')
const local = (m: Record<string, string> | undefined) =>
  m ? (m[locale.value] ?? m.ru ?? Object.values(m)[0] ?? '') : ''
const rule = computed(() => {
  const s = introStep.value
  return s?.kind === 'rule' ? lesson.value?.rules?.[s.index] : undefined
})
const exampleTr = (ex: Record<string, string | undefined>) =>
  Object.entries(ex).find(
    ([k, v]) => k.length === 2 && k !== lang.value && k === locale.value && v,
  )?.[1] ??
  Object.entries(ex).find(([k, v]) => k.length === 2 && k !== lang.value && v)?.[1] ??
  ''

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
  await activity.record('lesson')
  finalScore.value = score
}

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
      </IonToolbar>
      <IonProgressBar
        v-if="status === 'ready'"
        :value="bar"
        :aria-label="t('lessons.progress', { n: Math.round(bar * 100) })"
      />
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="sound__skeleton" />
        <UiSkeleton class="sound__skeleton" />
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
        <section v-if="inIntro && introStep" class="sound__step">
          <template v-if="introStep.kind === 'letters'">
            <p class="sound__label">{{ t('lessons.sound.letters') }}</p>
            <ul class="sound__letters">
              <li v-for="l in lesson.letters" :key="l.letter">
                <strong :lang="lang">{{ l.letter.toUpperCase() }}{{ l.letter }}</strong>
                <span class="sound__muted" :lang="lang">{{ l.name }}</span>
                <span v-if="l.ipa" class="sound__muted">[{{ l.ipa }}]</span>
                <SoundButton :text="l.name" :lang="lang" :audio="l.audio" />
              </li>
            </ul>
          </template>

          <template v-else-if="rule">
            <p class="sound__label">{{ t('lessons.sound.rule') }}</p>
            <h1 class="sound__title">{{ local(rule.title) }}</h1>
            <p v-if="rule.ipa" class="sound__ipa">
              [{{ rule.ipa }}]
              <SoundButton
                :text="rule.examples[0]?.[lang] ?? rule.ipa"
                :lang="lang"
                :audio="rule.audio"
              />
            </p>
            <p>{{ local(rule.text) }}</p>
            <UiCard>
              <ul class="sound__examples">
                <li v-for="(ex, i) in rule.examples" :key="i">
                  <span class="sound__line">
                    <span :lang="lang">{{ ex[lang] }}</span>
                    <SoundButton :text="String(ex[lang] ?? '')" :lang="lang" />
                  </span>
                  <span class="sound__muted">{{ exampleTr(ex) }}</span>
                </li>
              </ul>
            </UiCard>
          </template>

          <UiButton full-width @click="nextIntro">{{ t('lessons.next') }}</UiButton>
        </section>

        <SoundPractice
          v-else-if="task && !done"
          :key="practice!.pos"
          :task="task.task"
          :retry="task.retry"
          :lang="lang"
          @next="onAnswer"
        />

        <section v-else-if="done" class="sound__step">
          <h1>{{ t('lessons.summary.title') }}</h1>
          <p v-if="practice?.total">
            {{ t('lessons.summary.score', { correct: practice.firstTry, total: practice.total }) }}
          </p>
          <UiButton full-width @click="close">{{ t('lessons.summary.done') }}</UiButton>
          <UiButton variant="secondary" full-width @click="load">{{
            t('lessons.summary.again')
          }}</UiButton>
        </section>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.sound__skeleton {
  height: 96px;
  margin-bottom: var(--size-gutter);
}

.sound__step {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
}

.sound__label {
  margin: 0;
  color: var(--color-fg-muted);
  font-weight: 600;
}

.sound__title {
  margin: 0;
}

.sound__muted {
  color: var(--color-fg-muted);
  font-size: 0.875rem;
}

.sound__ipa,
.sound__line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.sound__letters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sound__letters li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px 6px 10px;
  border: 1px solid var(--color-stroke);
  border-radius: var(--radius-xs);
  background: var(--color-surface);
}

.sound__examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
