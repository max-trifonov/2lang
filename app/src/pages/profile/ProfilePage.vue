<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ProfileAvatar, useProfileBackup, useProfilesStore } from '@/features/profiles'
import { useThemeStore, type ThemePreference } from '@/shared/theme'
import { UiButton, UiCard, UiChip, UiList, UiListItem } from '@/shared/ui'

const { t } = useI18n()
const theme = useThemeStore()
const profiles = useProfilesStore()
const router = useIonRouter()

const backup = useProfileBackup()
const backupInput = ref<HTMLInputElement | null>(null)

async function onBackupFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await backup.restoreFrom(file)
}

const others = computed(() => profiles.profiles.filter((p) => p.id !== profiles.activeId))
const studying = computed(() =>
  (profiles.active?.languages ?? []).map((l) => t(`profiles.lang.${l}`)).join(', '),
)

const prefs: ThemePreference[] = ['system', 'light', 'dark']

function prefLabel(value: ThemePreference): string {
  if (value === 'system') return t('profile.themeSystem')
  if (value === 'light') return t('profile.themeLight')
  return t('profile.themeDark')
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('profile.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <UiCard v-if="profiles.active" class="profile__card">
        <div class="profile__head">
          <ProfileAvatar :name="profiles.active.name" :color="profiles.active.color" size="lg" />
          <div>
            <h2 class="profile__name">{{ profiles.active.name }}</h2>
            <p class="profile__meta">{{ t('profiles.studying', { langs: studying }) }}</p>
            <p class="profile__meta">
              {{
                t('profiles.goalValue', { n: profiles.active.dailyGoal }, profiles.active.dailyGoal)
              }}
            </p>
          </div>
        </div>
        <UiButton
          variant="secondary"
          size="sm"
          @click="router.push(`/profiles/${profiles.active.id}/edit`)"
        >
          {{ t('profiles.edit') }}
        </UiButton>
      </UiCard>

      <h2>{{ t('profile.language') }}</h2>
      <div class="row">
        <UiChip
          v-for="code in ['ru', 'en', 'es'] as const"
          :key="code"
          :selected="profiles.active?.interfaceLocale === code"
          @click="profiles.setInterfaceLocale(code)"
        >
          {{ t(`profiles.localeNames.${code}`) }}
        </UiChip>
      </div>

      <template v-if="others.length > 0">
        <h2>{{ t('profiles.others') }}</h2>
        <UiList>
          <UiListItem v-for="p in others" :key="p.id" interactive @click="profiles.switchTo(p.id)">
            <span class="profile__other">
              <ProfileAvatar :name="p.name" :color="p.color" />
              {{ p.name }}
            </span>
          </UiListItem>
        </UiList>
      </template>

      <UiButton
        variant="secondary"
        full-width
        class="profile__add"
        @click="router.push('/profiles/new')"
      >
        {{ t('profiles.add') }}
      </UiButton>

      <h2>{{ t('profile.theme') }}</h2>
      <div class="row">
        <UiChip
          v-for="item in prefs"
          :key="item"
          :selected="theme.preference === item"
          @click="theme.setPreference(item)"
        >
          {{ prefLabel(item) }}
        </UiChip>
      </div>

      <h2>{{ t('profiles.backup.title') }}</h2>
      <p class="profile__meta profile__hint">{{ t('profiles.backup.hint') }}</p>
      <div class="profile__backup">
        <UiButton
          variant="secondary"
          :loading="backup.exporting.value"
          :disabled="backup.restoring.value"
          @click="backup.exportToFile"
        >
          {{ t('profiles.backup.export') }}
        </UiButton>
        <UiButton
          variant="secondary"
          :loading="backup.restoring.value"
          :disabled="backup.exporting.value"
          @click="backupInput?.click()"
        >
          {{ t('profiles.backup.import') }}
        </UiButton>
      </div>
      <input
        ref="backupInput"
        type="file"
        accept=".json,application/json"
        hidden
        data-testid="backup-file-input"
        @change="onBackupFile"
      />
    </IonContent>
  </IonPage>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--size-gutter) * 0.5);
  margin-bottom: var(--size-gutter);
}

.profile__card {
  margin-bottom: var(--size-gutter);
}

.profile__head {
  display: flex;
  gap: var(--size-gutter);
  align-items: center;
  margin-bottom: calc(var(--size-gutter) * 0.75);
}

.profile__name {
  margin: 0 0 calc(var(--size-gutter) * 0.25);
}

.profile__meta {
  margin: 0;
  color: var(--color-fg-muted);
}

.profile__other {
  display: flex;
  gap: calc(var(--size-gutter) * 0.75);
  align-items: center;
}

.profile__hint {
  margin-bottom: calc(var(--size-gutter) * 0.75);
}

.profile__backup {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--size-gutter) * 0.5);
  margin-bottom: var(--size-gutter);
}

.profile__add {
  margin: var(--size-gutter) 0;
}
</style>
