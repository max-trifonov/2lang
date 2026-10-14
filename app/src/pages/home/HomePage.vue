<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue'
import { flame, musicalNotes, play, repeat, snowOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { localDay, pickIndex, useActivityStore } from '@/features/activity'
import { SpeakButton, useWordStatusStore } from '@/features/dictionary'
import { LangBadge } from '@/features/language'
import {
  lessonRoute,
  loadLessons,
  nextLesson,
  phraseOfDay,
  useLessonProgressStore,
  type Lesson,
} from '@/features/lessons'
import { usePlacementStore } from '@/features/placement'
import { useCardsStore } from '@/features/review'
import { ProfileAvatar, useProfilesStore } from '@/features/profiles'
import {
  loadBundledTexts,
  mergeLibrary,
  nextSong,
  songPhraseOfDay,
  useTextsStore,
  type TextDoc,
} from '@/features/texts'
import { UiButton, UiProgressRing, UiSkeleton } from '@/shared/ui'

const { t, locale } = useI18n()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const words = useWordStatusStore()
const placement = usePlacementStore()
const cards = useCardsStore()
const activity = useActivityStore()
const texts = useTextsStore()
const textDocs = ref<TextDoc[]>([])
/** Быстрая проверка «знаю / не знаю» — старт английского (D-12, LNG-S1-021). */
const PLACEMENT_LANGS = ['en']

// «Следующий урок» по языкам профиля (LNG-S1-017, D-6) — до пути уроков и экрана «Сегодня».
const lessons = ref<Lesson[] | null>(null)
const lessonsFailed = ref(false)

async function load(): Promise<void> {
  lessonsFailed.value = false
  try {
    lessons.value = await loadLessons()
  } catch {
    lessonsFailed.value = true
  }
}
void load()
// Тексты (LNG-S1-027): фраза дня берётся и из песен; сбой загрузки текстов фразу из уроков не ломает.
void Promise.all([texts.ready(), loadBundledTexts()])
  .then(([, bundled]) => (textDocs.value = mergeLibrary(bundled, texts.texts).map((i) => i.doc)))
  .catch(() => undefined)

watch(
  () => profiles.activeId,
  (pid) => {
    if (progress.profileId !== pid) void progress.forProfile(pid)
    if (words.profileId !== pid) void words.forProfile(pid)
    if (placement.profileId !== pid) void placement.forProfile(pid)
    if (cards.profileId !== pid) void cards.forProfile(pid)
    if (activity.profileId !== pid) void activity.forProfile(pid)
  },
  { immediate: true },
)

const tracks = computed(() =>
  lessons.value
    ? (profiles.active?.languages ?? []).map((lang) => ({
        lang,
        ...nextLesson(lessons.value!, lang, progress.doneIds(), words.knownKeys()),
        placement: PLACEMENT_LANGS.includes(lang) && !placement.isFinished(lang),
        due: cards.due(lang).length,
        // Песня для разбора (D-42): на пройденные правила, из поставки и своих загруженных.
        song: nextSong(textDocs.value, lang, progress.doneIds()),
      }))
    : [],
)
const goal = computed(() => profiles.active?.dailyGoal ?? 0)
const lessonsToday = computed(() => activity.today.lessons)
const goalDone = computed(() => goal.value > 0 && lessonsToday.value >= goal.value)
const goalShare = computed(() => (goal.value ? Math.min(1, lessonsToday.value / goal.value) : 0))
const streak = computed(() => activity.streakInfo)
const phrase = computed(() => {
  const langs = profiles.active?.languages ?? []
  const seed = `${profiles.activeId}:${localDay(new Date())}`
  const fromLesson = lessons.value
    ? phraseOfDay(lessons.value, progress.doneIds(), langs, locale.value, seed)
    : null
  const song = songPhraseOfDay(textDocs.value, langs, locale.value, seed)
  const pool = [...(fromLesson ? [fromLesson] : []), ...(song ? [song] : [])]
  // Источник выбирается по тому же зерну: в течение суток фраза не меняется.
  return pool.length ? (pool[pickIndex(`${seed}:src`, pool.length)] ?? null) : null
})
const title = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0]

/** Последние 7 дней: серия видна глазами, а не только числом. */
const week = computed(() => {
  const weekday = new Intl.DateTimeFormat(locale.value, { weekday: 'narrow' })
  const now = Date.now()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now - (6 - i) * 86_400_000)
    const day = activity.days.get(localDay(date))
    return {
      key: localDay(date),
      label: weekday.format(date),
      active: Boolean(day && day.lessons + day.reviews > 0),
      today: i === 6,
    }
  })
})
</script>

<template>
  <IonPage>
    <IonContent class="home">
      <header v-if="profiles.active" class="home__top">
        <h1 class="home__title">{{ t('home.greeting', { name: profiles.active.name }) }}</h1>
        <RouterLink to="/profile" class="home__avatar" :aria-label="t('tabs.profile')">
          <ProfileAvatar :name="profiles.active.name" :color="profiles.active.color" />
        </RouterLink>
      </header>

      <section v-if="profiles.active" class="home__today" :aria-label="t('today.title')">
        <UiProgressRing
          :value="goalShare"
          :size="88"
          :stroke="9"
          :label="t('today.goal', { done: lessonsToday, goal }, goal)"
          :class="{ 'home__ring--done': goalDone }"
        >
          <span class="home__ring-num"
            >{{ lessonsToday }}<small>/{{ goal }}</small></span
          >
        </UiProgressRing>
        <div class="home__today-text">
          <strong>{{
            goalDone ? t('today.goalDone') : t('today.goal', { done: lessonsToday, goal }, goal)
          }}</strong>
          <p class="home__streak" :class="{ 'home__streak--on': streak.days }">
            <IonIcon :icon="flame" aria-hidden="true" />
            {{ t('today.streak', { n: streak.days }, streak.days) }}
            <span v-if="streak.freezes" class="home__freezes">
              <IonIcon :icon="snowOutline" aria-hidden="true" />{{ streak.freezes }}
            </span>
          </p>
          <ol class="home__week" :aria-label="t('today.streak', { n: streak.days }, streak.days)">
            <li
              v-for="d in week"
              :key="d.key"
              :class="{ 'is-active': d.active, 'is-today': d.today }"
            >
              <span aria-hidden="true">{{ d.label }}</span>
            </li>
          </ol>
          <p v-if="streak.days && !streak.todayDone" class="home__keep">{{ t('today.keep') }}</p>
        </div>
      </section>

      <section v-if="phrase" class="home__phrase" :data-lang="phrase.lang">
        <div class="home__phrase-head">
          <span class="home__phrase-label">{{ t('today.phrase') }}</span>
          <LangBadge :lang="phrase.lang" />
        </div>
        <div class="home__phrase-body">
          <p class="home__phrase-text" :lang="phrase.lang">{{ phrase.text }}</p>
          <SpeakButton
            :text="phrase.text"
            :lang="phrase.lang"
            size="lg"
            class="home__phrase-speak"
          />
        </div>
        <p class="home__phrase-tr">{{ phrase.translation }}</p>
      </section>

      <section class="home__tracks">
        <h2 class="home__h2">{{ t('home.lessons.title') }}</h2>
        <p v-if="lessonsFailed" class="home__muted">
          {{ t('lessons.loadFailed') }}
          <UiButton size="sm" variant="secondary" @click="load">{{ t('lessons.retry') }}</UiButton>
        </p>
        <template v-else-if="!lessons">
          <UiSkeleton v-for="n in 2" :key="n" class="home__skeleton" />
        </template>
        <article
          v-for="track in tracks"
          v-else
          :key="track.lang"
          class="track"
          :data-lang="track.lang"
        >
          <header class="track__head">
            <LangBadge :lang="track.lang" label />
          </header>

          <RouterLink
            v-if="track.due"
            :to="`/review?lang=${track.lang}`"
            class="track__row track__row--review"
          >
            <span class="track__icon" aria-hidden="true"><IonIcon :icon="repeat" /></span>
            <span class="track__row-text">
              <strong>{{ t('review.title') }}</strong>
              <span>{{ t('home.review.due', { n: track.due }, track.due) }}</span>
            </span>
            <span class="track__go">{{ t('home.review.start') }}</span>
          </RouterLink>

          <div v-if="track.placement" class="track__placement">
            <strong>{{ t('home.placement.title') }}</strong>
            <p>{{ t('home.placement.hint') }}</p>
            <UiButton variant="ghost" size="sm" @click="router.push(`/placement/${track.lang}`)">
              {{ t(words.hasAny(track.lang) ? 'home.placement.continue' : 'home.placement.start') }}
            </UiButton>
          </div>

          <div v-if="track.next" class="track__next">
            <span class="track__label">{{
              t(track.next.kind === 'grammar' ? 'home.lessons.nextGrammar' : 'home.lessons.next')
            }}</span>
            <strong class="track__title">{{ title(track.next.title) }}</strong>
            <UiButton full-width @click="router.push(lessonRoute(track.next))">
              <IonIcon :icon="play" aria-hidden="true" />
              {{ t('home.lessons.start') }}
            </UiButton>
          </div>
          <p v-else class="home__muted">
            {{ t(track.total ? 'home.lessons.allDone' : 'home.lessons.none') }}
          </p>

          <RouterLink v-if="track.song" :to="`/songs/${track.song.id}`" class="track__row">
            <span class="track__icon" aria-hidden="true"><IonIcon :icon="musicalNotes" /></span>
            <span class="track__row-text">
              <strong>{{ t('songs.next') }}</strong>
              <span :lang="track.lang">{{ track.song.title[track.song.lang] }}</span>
            </span>
            <span class="track__go">{{ t('home.lessons.start') }}</span>
          </RouterLink>
        </article>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.home {
  --padding-top: calc(var(--ion-safe-area-top) + var(--size-gutter) * 1.25);
}

.home__top {
  display: flex;
  gap: var(--size-gutter);
  align-items: center;
  justify-content: space-between;
}

.home__title {
  margin: 0;
  font-size: var(--fs-display);
  font-size: clamp(1.6rem, 7vw, 2rem);
}

.home__avatar {
  border-radius: var(--radius-xl);
  text-decoration: none;
}

.home__today {
  display: flex;
  gap: calc(var(--size-gutter) * 1.25);
  align-items: center;
  margin-top: calc(var(--size-gutter) * 1.25);
}

.home__ring--done {
  --ring-color: var(--color-success);
}

.home__ring-num {
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.home__ring-num small {
  color: var(--color-fg-subtle);
  font-size: 0.95rem;
  font-weight: 600;
}

.home__today-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.home__streak {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.home__streak ion-icon {
  color: var(--color-fg-subtle);
  font-size: 1.1rem;
}

.home__streak--on ion-icon {
  color: var(--reward);
}

.home__freezes {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  margin-left: 4px;
  color: var(--color-fg-subtle);
}

.home__week {
  display: flex;
  gap: 6px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.home__week li {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: var(--radius-xl);
  background: var(--color-chip);
  color: var(--color-fg-subtle);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
}

.home__week li.is-active {
  background: var(--reward);
  color: #2a1e00;
}

.home__week li.is-today {
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 0 3.5px var(--color-fg);
}

.home__keep {
  margin: 0;
  color: var(--reward-ink);
  font-size: var(--fs-small);
}

/* Фраза дня — единственная залитая цветом языка плашка экрана. */
.home__phrase {
  margin-top: calc(var(--size-gutter) * 1.5);
  padding: var(--size-gutter) calc(var(--size-gutter) * 1.25) calc(var(--size-gutter) * 1.25);
  border-radius: var(--radius-lg);
  background: var(--tint-soft);
}

.home__phrase-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home__phrase-label {
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 650;
}

.home__phrase-body {
  display: flex;
  gap: var(--size-gutter);
  align-items: flex-end;
  justify-content: space-between;
  margin-top: calc(var(--size-gutter) * 0.75);
}

.home__phrase-text {
  margin: 0;
  color: var(--tint-ink);
  font-size: clamp(1.6rem, 7.5vw, 2.1rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.home__phrase-tr {
  margin: 8px 0 0;
  color: var(--color-fg-muted);
  font-size: var(--fs-body);
}

.home__tracks {
  margin-top: calc(var(--size-gutter) * 1.75);
}

.home__h2 {
  margin: 0 0 calc(var(--size-gutter) * 0.75);
  font-size: var(--fs-h2);
}

.home__muted {
  margin: 0;
  color: var(--color-fg-muted);
}

.home__skeleton {
  height: 160px;
  margin-bottom: var(--size-gutter);
  border-radius: var(--radius-lg);
}

.track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(var(--size-gutter) * 0.75);
  margin-bottom: var(--size-gutter);
  padding: var(--size-gutter);
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow:
    inset 0 0 0 1px var(--color-stroke),
    var(--shadow-card);
}

.track::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--tint);
  content: '';
}

.track__row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
  color: var(--color-fg);
  text-decoration: none;
}

.track__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-xl);
  background: var(--tint);
  color: var(--on-tint);
  font-size: 1.2rem;
}

.track__row-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.track__row-text span {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.track__go {
  color: var(--tint-ink);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.track__placement {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-bottom: calc(var(--size-gutter) * 0.75);
  border-bottom: 1px dashed var(--color-stroke);
}

.track__placement p {
  margin: 0 0 4px;
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.track__next {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track__label {
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
  font-weight: 600;
}

.track__title {
  margin-bottom: 10px;
  font-size: var(--fs-h3);
  font-weight: 650;
  line-height: 1.3;
}
</style>
