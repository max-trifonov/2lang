<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import { bookOutline, checkmark, play, school, sparkles } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useWordStatusStore } from '@/features/dictionary'
import {
  courseRoute,
  lessonPath,
  lessonRoute,
  loadLessons,
  soundLessons,
  useLessonProgressStore,
  type Lesson,
  type LessonStatus,
} from '@/features/lessons'
import { useProfilesStore } from '@/features/profiles'
import { UiButton, UiChip, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Вкладка «Уроки» (LNG-S1-022): путь по языку и теме, состояние — в URL (AC-1).
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const progress = useLessonProgressStore()
const words = useWordStatusStore()

const lessons = ref<Lesson[] | null>(null)
const failed = ref(false)

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
  (id) => {
    if (progress.profileId !== id) void progress.forProfile(id)
    if (words.profileId !== id) void words.forProfile(id)
  },
  { immediate: true },
)

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const langs = computed<string[]>(() => profiles.active?.languages ?? [])
const lang = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : (langs.value[0] ?? ''),
)

const path = computed(() =>
  lessons.value
    ? lessonPath(lessons.value, lang.value, progress.doneIds(), words.knownKeys())
    : null,
)
// Звучание — отдельный раздел-«тема» (LNG-S1-028): свой список по order, без трека слов.
const SOUND = 'sound'
const sounds = computed(() => (lessons.value ? soundLessons(lessons.value, lang.value) : []))
const topics = computed(() => [
  ...new Set((path.value?.items ?? []).map((i) => i.lesson.topic)),
  ...(grammar.value.length ? [GRAMMAR] : []),
  ...(sounds.value.length ? [SOUND] : []),
])
const inSound = computed(() => topic.value === SOUND)
// Грамматика — тоже раздел-«тема» (D-38): темы по order, «следующая» — по ритму пути (D-14).
const GRAMMAR = 'grammar'
const grammar = computed(() => path.value?.grammar ?? [])
const inGrammar = computed(() => topic.value === GRAMMAR)
const grammarDone = computed(() => grammar.value.filter((g) => g.status === 'done').length)
const topic = computed(() =>
  topics.value.includes(str(route.query.topic)) ? str(route.query.topic) : (topics.value[0] ?? ''),
)
// Маршрут темы (D-40): уроки слов и темы грамматики между ними — там, где их предложит путь.
// Тема грамматики относится к теме ближайшего следующего урока слов, в конце — предыдущего.
const course = computed(() =>
  lessons.value
    ? courseRoute(lessons.value, lang.value, progress.doneIds(), words.knownKeys())
    : [],
)
const shown = computed(() => {
  if (inSound.value || inGrammar.value) return []
  const nodes = course.value
  const topicAt = (i: number): string => {
    const near = [...nodes.slice(i), ...nodes.slice(0, i).reverse()]
    const w = near.find((n) => n.kind === 'words')
    return w?.kind === 'words' ? w.item.lesson.topic : ''
  }
  let n = 0
  return nodes
    .filter(
      (node, i) => (node.kind === 'words' ? node.item.lesson.topic : topicAt(i)) === topic.value,
    )
    .map((node) => ({ ...node, step: node.kind === 'words' ? ++n : 0 }))
})
const doneCount = computed(
  () => (path.value?.items ?? []).filter((i) => i.status === 'done').length,
)

function setQuery(patch: Record<string, string | undefined>): void {
  const next = { ...route.query, ...patch }
  for (const k of Object.keys(next)) if (!next[k]) delete next[k]
  void router.replace({ query: next })
}

const title = (m: Record<string, string>) => m[locale.value] ?? m.ru ?? Object.values(m)[0]
/** Пройденные узлы — иконкой, остальные — номером шага в теме. */
const ICONS: Partial<Record<LessonStatus, string>> = { done: checkmark, known: sparkles }
const score = (item: { lesson: { id: string } }) => {
  const best = progress.get(item.lesson.id)?.bestScore
  return best === undefined ? '' : `${Math.round(best * 100)}%`
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('path.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding" :data-lang="lang">
      <div v-if="langs.length > 1" class="path__langs" role="group">
        <UiChip
          v-for="l in langs"
          :key="l"
          :data-lang="l"
          :selected="l === lang"
          class="path__lang"
          @click="setQuery({ lang: l, topic: undefined })"
        >
          <span class="path__lang-code">{{ l.toUpperCase() }}</span>
          {{ t(`profiles.lang.${l}`) }}
        </UiChip>
      </div>

      <UiEmptyState
        v-if="failed"
        variant="error"
        icon="alert-circle-outline"
        :title="t('lessons.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="!path">
        <UiSkeleton v-for="n in 4" :key="n" class="path__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="!path.items.length && !sounds.length && !grammar.length"
        variant="empty"
        icon="book-outline"
        :title="t('path.empty')"
        :description="t('path.emptyHint')"
      />

      <template v-else>
        <div class="path__progress">
          <span>{{ t('path.progress', { done: doneCount, total: path.items.length }) }}</span>
          <span class="path__bar" aria-hidden="true">
            <span
              :style="{
                width: `${path.items.length ? (doneCount / path.items.length) * 100 : 0}%`,
              }"
            />
          </span>
        </div>
        <div v-if="topics.length > 1" class="path__topics">
          <UiChip
            v-for="tp in topics"
            :key="tp"
            :selected="tp === topic"
            @click="setQuery({ topic: tp })"
          >
            {{
              tp === SOUND
                ? t('path.sound')
                : tp === GRAMMAR
                  ? t('path.grammar')
                  : t(`dictionary.card.topics.${tp}`)
            }}
          </UiChip>
        </div>

        <template v-if="inGrammar">
          <div class="path__grammar-head">
            <span>{{
              t('path.grammarProgress', { done: grammarDone, total: grammar.length })
            }}</span>
            <RouterLink :to="`/rules?lang=${lang}`" class="path__handbook">
              <IonIcon :icon="bookOutline" aria-hidden="true" />
              {{ t('rules.title') }}
            </RouterLink>
          </div>
          <ol class="path__list">
            <li
              v-for="item in grammar"
              :key="item.lesson.id"
              class="node"
              :class="`node--${item.status}`"
            >
              <button
                type="button"
                class="node__row"
                @click="router.push(lessonRoute(item.lesson))"
              >
                <span class="node__dot" aria-hidden="true">
                  <IonIcon v-if="item.status === 'done'" :icon="checkmark" />
                  <template v-else>{{ item.lesson.order }}</template>
                </span>
                <span class="node__text">
                  <strong>{{ title(item.lesson.title) }}</strong>
                  <span class="node__meta">
                    {{ item.lesson.code }}
                    <template v-if="item.status !== 'open'">
                      · {{ t(`path.status.${item.status}`) }}</template
                    >
                    <template v-if="score(item)"> · {{ score(item) }}</template>
                  </span>
                  <span v-if="item.status === 'next'" class="node__start">
                    <IonIcon :icon="play" aria-hidden="true" />
                    {{ t('home.lessons.start') }}
                  </span>
                </span>
              </button>
            </li>
          </ol>
        </template>
        <ol v-else-if="inSound" class="path__list">
          <li
            v-for="(l, i) in sounds"
            :key="l.id"
            class="node"
            :class="progress.get(l.id) ? 'node--done' : 'node--open'"
          >
            <button type="button" class="node__row" @click="router.push(`/sounds/${l.id}`)">
              <span class="node__dot" aria-hidden="true">
                <IonIcon v-if="progress.get(l.id)" :icon="checkmark" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="node__text">
                <strong>{{ title(l.title) }}</strong>
                <span class="node__meta">
                  {{ l.code }} ·
                  {{ t(progress.get(l.id) ? 'path.status.done' : 'path.status.open') }}
                </span>
              </span>
            </button>
          </li>
        </ol>
        <ol v-else class="path__list">
          <li
            v-for="node in shown"
            :key="node.item.lesson.id"
            class="node"
            :class="[`node--${node.item.status}`, { 'node--rule': node.kind === 'grammar' }]"
          >
            <button
              type="button"
              class="node__row"
              @click="router.push(lessonRoute(node.item.lesson))"
            >
              <span class="node__dot" aria-hidden="true">
                <IonIcon
                  v-if="node.kind === 'grammar' && node.item.status !== 'done'"
                  :icon="school"
                />
                <IonIcon v-else-if="ICONS[node.item.status]" :icon="ICONS[node.item.status]" />
                <template v-else>{{ node.step }}</template>
              </span>
              <span class="node__text">
                <span v-if="node.kind === 'grammar'" class="node__kicker">
                  {{ t('path.rule') }}
                  <template v-if="node.item.lesson.code"> · {{ node.item.lesson.code }}</template>
                </span>
                <strong>{{ title(node.item.lesson.title) }}</strong>
                <span v-if="node.item.status !== 'open'" class="node__meta">
                  {{ t(`path.status.${node.item.status}`) }}
                  <template v-if="score(node.item)"> · {{ score(node.item) }}</template>
                </span>
                <span v-if="node.item.status === 'next'" class="node__start">
                  <IonIcon :icon="play" aria-hidden="true" />
                  {{ t('home.lessons.start') }}
                </span>
              </span>
            </button>
          </li>
        </ol>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.path__langs {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
  margin-bottom: calc(var(--size-gutter) * 1.25);
}

.path__lang {
  min-height: 48px;
}

.path__lang-code {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  opacity: 0.8;
}

.path__skeleton {
  height: 64px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
}

.path__progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 var(--size-gutter);
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.path__bar {
  display: block;
  height: 8px;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--color-chip);
}

.path__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--tint);
}

.path__grammar-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 var(--size-gutter);
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.path__handbook {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  border-radius: var(--radius-xl);
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-weight: 650;
  text-decoration: none;
}

.path__topics {
  display: flex;
  gap: 8px;
  margin: 0 calc(var(--size-gutter) * -1) calc(var(--size-gutter) * 1.25);
  padding: 0 var(--size-gutter);
  overflow-x: auto;
  scrollbar-width: none;
}

/* Путь — линия с узлами: последовательность уроков видна как маршрут. */
.path__list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.node {
  position: relative;
  padding-bottom: 6px;
}

.node:not(:last-child)::before {
  position: absolute;
  top: 40px;
  bottom: -6px;
  left: 19px;
  width: 3px;
  border-radius: 2px;
  background: var(--color-chip-strong);
  content: '';
}

.node--done:not(:last-child)::before,
.node--known:not(:last-child)::before {
  background: var(--tint);
}

.node__row {
  display: flex;
  width: 100%;
  gap: 14px;
  align-items: flex-start;
  padding: 0 0 14px;
  border: 0;
  background: none;
  color: var(--color-fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.node__dot {
  display: grid;
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: inset 0 0 0 2.5px var(--color-chip-strong);
  color: var(--color-fg-subtle);
  font-size: var(--fs-meta);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.node--done .node__dot {
  background: var(--tint);
  box-shadow: none;
  color: var(--on-tint);
  font-size: 1.2rem;
}

.node--known .node__dot {
  background: var(--tint-soft);
  box-shadow: none;
  color: var(--tint-ink);
  font-size: 1.1rem;
}

.node--next .node__dot {
  background: var(--tint);
  box-shadow: 0 0 0 5px var(--tint-soft);
  color: var(--on-tint);
}

.node__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-top: 9px;
}

.node__meta {
  color: var(--color-fg-subtle);
  font-size: var(--fs-small);
}

.node--done .node__text strong,
.node--known .node__text strong {
  color: var(--color-fg-muted);
  font-weight: 550;
}

/* Тема грамматики в маршруте — точка-«правило»: видно, где в пути новое правило. */
.node--rule .node__dot {
  border-radius: var(--radius-md);
}

.node__kicker {
  color: var(--tint-ink);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Следующий урок — карточка в цвете языка: точка входа видна сразу. */
.node--next .node__text {
  margin-top: -4px;
  padding: 12px 14px 14px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
}

.node--next .node__text strong {
  font-size: var(--fs-h3);
  line-height: 1.3;
}

.node__start {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  align-self: flex-start;
  margin-top: 10px;
  padding: 10px 18px;
  border-radius: var(--radius-xl);
  background: var(--tint);
  color: var(--on-tint);
  font-weight: 650;
}
</style>
