<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, alertController } from '@ionic/vue'
import { alertCircleOutline, musicalNotesOutline, searchOutline } from 'ionicons/icons'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { LangBadge } from '@/features/language'
import { useProfilesStore } from '@/features/profiles'
import {
  ImportResults,
  filterLibrary,
  loadBundledTexts,
  mergeLibrary,
  useTextsStore,
  type ImportOutcome,
  type ReplacePlan,
  type TextDoc,
} from '@/features/texts'
import {
  UiButton,
  UiChip,
  UiEmptyState,
  UiList,
  UiListItem,
  UiSheet,
  UiSkeleton,
} from '@/shared/ui'

// Вкладка «Тексты»: загрузка файлов (LNG-S1-003) и библиотека поставки + загруженных с
// фильтрами языка и типа в URL (LNG-S1-026).
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const texts = useTextsStore()
const profiles = useProfilesStore()

const picker = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const failed = ref(false)
const bundled = ref<TextDoc[]>([])
const outcomes = ref<ImportOutcome[]>([])
const showResults = ref(false)

async function load(): Promise<void> {
  failed.value = false
  try {
    await texts.ready()
    bundled.value = await loadBundledTexts()
  } catch {
    failed.value = true
  }
}

onMounted(load)

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const library = computed(() => mergeLibrary(bundled.value, texts.texts))
const langs = computed(() => [...new Set(library.value.map((i) => i.doc.lang))].sort())
const kinds = computed(() => [...new Set(library.value.map((i) => i.doc.kind))].sort())
const langFilter = computed(() =>
  langs.value.includes(str(route.query.lang)) ? str(route.query.lang) : '',
)
const kindFilter = computed(() =>
  (kinds.value as string[]).includes(str(route.query.kind)) ? str(route.query.kind) : '',
)
const shown = computed(() =>
  filterLibrary(library.value, { lang: langFilter.value, kind: kindFilter.value }),
)

function setFilter(patch: Record<string, string>): void {
  const next = { ...route.query, ...patch }
  for (const k of Object.keys(next)) if (!next[k]) delete next[k]
  void router.replace({ query: next })
}

async function confirmReplace(plan: ReplacePlan): Promise<boolean> {
  const alert = await alertController.create({
    header: t('texts.ui.replaceTitle', { title: plan.previous.title[plan.previous.lang] }),
    message: t('texts.ui.replaceText', { ...plan.phrases }),
    buttons: [
      { text: t('texts.ui.replaceKeep'), role: 'cancel' },
      { text: t('texts.ui.replaceConfirm'), role: 'confirm' },
    ],
  })
  await alert.present()
  return (await alert.onDidDismiss()).role === 'confirm'
}

async function onFiles(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = '' // тот же файл после правки можно выбрать снова
  if (files.length === 0) return
  busy.value = true
  try {
    outcomes.value = await texts.importFiles(files, {
      confirmReplace,
      addedBy: profiles.activeId,
    })
    failed.value = false
    showResults.value = true
  } catch {
    failed.value = true
  } finally {
    busy.value = false
  }
}

const translatedTitle = (title: Record<string, string>, lang: string) =>
  locale.value !== lang ? title[locale.value] : undefined
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('texts.ui.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <input
        ref="picker"
        type="file"
        accept=".json,application/json"
        multiple
        hidden
        data-testid="text-file-input"
        @change="onFiles"
      />

      <UiEmptyState
        v-if="failed"
        variant="error"
        :icon="alertCircleOutline"
        :title="t('texts.ui.loadFailed')"
      >
        <template #action>
          <UiButton @click="load">{{ t('texts.ui.retry') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else-if="!texts.loaded">
        <UiSkeleton v-for="n in 3" :key="n" class="texts__skeleton" />
      </template>

      <UiEmptyState
        v-else-if="library.length === 0"
        variant="empty"
        :icon="musicalNotesOutline"
        :title="t('texts.ui.emptyTitle')"
        :description="t('texts.ui.emptyText')"
      >
        <template #action>
          <UiButton :loading="busy" @click="picker?.click()">{{ t('texts.ui.upload') }}</UiButton>
        </template>
      </UiEmptyState>

      <template v-else>
        <UiButton full-width :loading="busy" class="texts__upload" @click="picker?.click()">
          {{ t('texts.ui.upload') }}
        </UiButton>
        <div v-if="langs.length > 1" class="texts__filters">
          <UiChip :selected="!langFilter" @click="setFilter({ lang: '' })">{{
            t('texts.ui.all')
          }}</UiChip>
          <UiChip
            v-for="l in langs"
            :key="l"
            :data-lang="l"
            :selected="l === langFilter"
            @click="setFilter({ lang: l })"
          >
            {{ t(`profiles.lang.${l}`) }}
          </UiChip>
        </div>
        <div v-if="kinds.length > 1" class="texts__filters">
          <UiChip :selected="!kindFilter" @click="setFilter({ kind: '' })">{{
            t('texts.ui.all')
          }}</UiChip>
          <UiChip
            v-for="k in kinds"
            :key="k"
            :selected="k === kindFilter"
            @click="setFilter({ kind: k })"
          >
            {{ t(`texts.ui.kind.${k}`) }}
          </UiChip>
        </div>
        <UiEmptyState
          v-if="shown.length === 0"
          variant="empty"
          :icon="searchOutline"
          :title="t('texts.ui.filteredEmpty')"
        />
        <UiList>
          <UiListItem
            v-for="{ doc: d } in shown"
            :key="d.id"
            interactive
            @click="router.push(`/texts/${d.id}`)"
          >
            <span class="texts__item" :data-lang="d.lang">
              <LangBadge :lang="d.lang" class="texts__badge" />
              <span class="texts__title" :lang="d.lang">{{ d.title[d.lang] }}</span>
              <span v-if="translatedTitle(d.title, d.lang)" class="texts__meta">
                {{ translatedTitle(d.title, d.lang) }}
              </span>
              <span class="texts__meta">
                {{ t(`texts.ui.kind.${d.kind}`) }}
                <template v-if="d.level"> · {{ d.level }}</template>
                <template v-if="d.license === 'personal'"> · {{ t('texts.ui.personal') }}</template>
              </span>
            </span>
          </UiListItem>
        </UiList>
      </template>

      <UiSheet v-model="showResults" :initial-breakpoint="1" :breakpoints="[0, 1]">
        <template #header>
          <h2 class="texts__sheet-title">{{ t('texts.ui.resultsTitle') }}</h2>
        </template>
        <ImportResults :outcomes="outcomes" />
        <UiButton variant="secondary" full-width @click="showResults = false">
          {{ t('texts.ui.close') }}
        </UiButton>
      </UiSheet>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.texts__upload {
  margin-bottom: var(--size-gutter);
}

.texts__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: calc(var(--size-gutter) * 0.75);
}

.texts__skeleton {
  height: 56px;
  margin-bottom: calc(var(--size-gutter) * 0.5);
  border-radius: var(--radius-sm);
}

.texts__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 12px;
  align-items: baseline;
}

.texts__item > :not(.texts__badge) {
  grid-column: 2;
}

.texts__badge {
  grid-row: 1 / span 3;
  align-self: start;
  margin-top: 4px;
}

.texts__title {
  color: var(--tint-ink);
  font-size: 1.2rem;
  font-weight: 600;
}

.texts__meta {
  color: var(--color-fg-muted);
  font-size: var(--fs-meta);
}

.texts__sheet-title {
  margin: 0;
}
</style>
