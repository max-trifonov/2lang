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
import { alertCircleOutline, closeOutline } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  article,
  keyOf,
  loadLanguage,
  useWordStatusStore,
  type CatalogEntry,
} from '@/features/dictionary'
import {
  batchStatuses,
  nextBatch,
  placementOrder,
  summarize,
  usePlacementStore,
} from '@/features/placement'
import { useProfilesStore } from '@/features/profiles'
import { useCardsStore } from '@/features/review'
import { UiButton, UiEmptyState, UiSkeleton } from '@/shared/ui'

// Быстрая проверка «знаю / не знаю» (LNG-S1-021, D-12): порции по 10, отмечаются незнакомые.
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const profiles = useProfilesStore()
const words = useWordStatusStore()
const placement = usePlacementStore()
const cards = useCardsStore()

const lang = computed(() => String(route.params.lang ?? ''))
const order = ref<CatalogEntry[]>([])
const status = ref<'loading' | 'ready' | 'failed'>('loading')
const unknown = ref(new Set<string>())
const saving = ref(false)
/** Итог показывается после «Закончить» или когда слова кончились. */
const showSummary = ref(false)

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    // Статусы активного профиля нужны до расчёта порции — иначе проверка начнётся с начала.
    if (words.profileId !== profiles.activeId) await words.forProfile(profiles.activeId)
    if (placement.profileId !== profiles.activeId) await placement.forProfile(profiles.activeId)
    if (cards.profileId !== profiles.activeId) await cards.forProfile(profiles.activeId)
    order.value = placementOrder(await loadLanguage(lang.value))
    showSummary.value = placement.isFinished(lang.value)
    status.value = 'ready'
  } catch {
    status.value = 'failed'
  }
}

watch([lang, () => profiles.activeId], load, { immediate: true })

const batch = computed(() => nextBatch(order.value, words.status))
const summary = computed(() => summarize(order.value, words.status))
const bar = computed(() => (summary.value.total ? summary.value.checked / summary.value.total : 1))

function toggle(id: string): void {
  const next = new Set(unknown.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  unknown.value = next
}

async function saveBatch(): Promise<void> {
  saving.value = true
  try {
    const statuses = batchStatuses(batch.value, unknown.value)
    await words.setMany(statuses, 'placement')
    // Известные слова — в редкое повторение (D-12, LNG-S1-023, AC-4).
    await cards.addKnownWords(statuses.filter((s) => s.status === 'known').map((s) => s.key))
    unknown.value = new Set()
    if (!batch.value.length) await finish()
  } finally {
    saving.value = false
  }
}

async function finish(): Promise<void> {
  await placement.finish(lang.value)
  showSummary.value = true
}

function close(): void {
  if (window.history.state?.back) router.back()
  else void router.replace('/home')
}

const label = (e: CatalogEntry) => [article(e), e.lemma].filter(Boolean).join(' ')
</script>

<template>
  <IonPage :data-lang="lang || undefined">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton :aria-label="t('placement.close')" @click="close">
            <IonIcon slot="icon-only" :icon="closeOutline" aria-hidden="true" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ t('placement.title') }}</IonTitle>
      </IonToolbar>
      <IonProgressBar
        v-if="status === 'ready'"
        :value="bar"
        :aria-label="t('placement.checked', { n: summary.checked, total: summary.total })"
      />
    </IonHeader>
    <IonContent class="ion-padding">
      <template v-if="status === 'loading'">
        <UiSkeleton class="placement__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="status === 'failed'"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('placement.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('lessons.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <section v-else-if="showSummary || !batch.length" class="placement">
        <h1>{{ t('placement.summary.title') }}</h1>
        <p class="placement__lead">
          {{ t('placement.summary.known', { known: summary.known, checked: summary.checked }) }}
        </p>
        <p class="placement__hint">{{ t('placement.summary.hint') }}</p>
        <UiButton full-width @click="close">{{ t('placement.summary.done') }}</UiButton>
        <UiButton v-if="batch.length" variant="secondary" full-width @click="showSummary = false">
          {{ t('placement.summary.more') }}
        </UiButton>
      </section>

      <section v-else class="placement">
        <p class="placement__lead">{{ t('placement.prompt') }}</p>
        <p class="placement__hint">
          {{ t('placement.checked', { n: summary.checked, total: summary.total }) }}
        </p>
        <div class="placement__words" :lang="lang">
          <button
            v-for="e in batch"
            :key="keyOf(e)"
            type="button"
            class="placement__word"
            :class="{ 'placement__word--unknown': unknown.has(e.id) }"
            :aria-pressed="unknown.has(e.id)"
            @click="toggle(e.id)"
          >
            {{ label(e) }}
          </button>
        </div>
        <p class="placement__hint">
          {{ t('placement.marked', { n: unknown.size }, unknown.size) }}
        </p>
        <UiButton full-width :loading="saving" @click="saveBatch">{{
          t('placement.next')
        }}</UiButton>
        <UiButton variant="secondary" full-width :disabled="saving" @click="finish">
          {{ t('placement.finish') }}
        </UiButton>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.placement__skeleton {
  height: 160px;
}

.placement {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
}

.placement h1,
.placement__lead,
.placement__hint {
  margin: 0;
}

.placement__lead {
  font-size: 1.1rem;
}

.placement__hint {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.placement__words {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.placement__word {
  min-height: 48px;
  padding: 8px 16px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow:
    inset 0 0 0 2px var(--color-stroke),
    0 3px 0 var(--color-stroke);
  color: var(--tint-ink);
  font: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.placement__word:active {
  transform: translateY(3px);
  box-shadow: inset 0 0 0 2px var(--color-stroke);
}

.placement__word:focus-visible {
  outline: 2px solid var(--tint, var(--color-fg));
}

.placement__word--unknown {
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  box-shadow: inset 0 0 0 2px var(--color-danger);
  color: var(--color-danger);
  text-decoration: line-through;
}
</style>
