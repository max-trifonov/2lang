<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { UiButton, UiChip, UiField } from '@/shared/ui'

import {
  GOAL_MAX,
  GOAL_MIN,
  INTERFACE_LOCALES,
  NAME_MAX,
  PROFILE_COLORS,
  STUDY_LANGUAGES,
  type ProfileDraft,
  type ProfileErrors,
  type StudyLanguage,
} from '../domain/profile'

import './profile-colors.css'

const props = defineProps<{
  errors: ProfileErrors
  submitLabel: string
  busy?: boolean
}>()

const draft = defineModel<ProfileDraft>({ required: true })
const emit = defineEmits<{ submit: [] }>()
const { t } = useI18n()

const goals = Array.from({ length: GOAL_MAX - GOAL_MIN + 1 }, (_, i) => GOAL_MIN + i)
function errorText(field: keyof ProfileErrors): string | undefined {
  const code = props.errors[field]
  const max = field === 'name' ? NAME_MAX : GOAL_MAX
  return code ? t(`profiles.errors.${code}`, { min: GOAL_MIN, max }) : undefined
}

const nameError = computed(() => errorText('name'))

function patch(next: Partial<ProfileDraft>): void {
  draft.value = { ...draft.value, ...next }
}

function toggleLanguage(lang: StudyLanguage): void {
  const has = draft.value.languages.includes(lang)
  patch({
    languages: has
      ? draft.value.languages.filter((l) => l !== lang)
      : [...draft.value.languages, lang],
  })
}
</script>

<template>
  <form class="profile-form" novalidate @submit.prevent="emit('submit')">
    <UiField
      :model-value="draft.name"
      :label="t('profiles.name')"
      :error="nameError"
      required
      @update:model-value="patch({ name: $event })"
    />

    <fieldset class="profile-form__group">
      <legend>{{ t('profiles.interfaceLanguage') }}</legend>
      <div class="profile-form__row">
        <UiChip
          v-for="code in INTERFACE_LOCALES"
          :key="code"
          :selected="draft.interfaceLocale === code"
          @click="patch({ interfaceLocale: code })"
        >
          {{ t(`profiles.localeNames.${code}`) }}
        </UiChip>
      </div>
    </fieldset>

    <fieldset
      class="profile-form__group"
      :aria-describedby="errors.languages ? 'pf-lang-error' : undefined"
    >
      <legend>{{ t('profiles.studyLanguages') }}</legend>
      <div class="profile-form__row">
        <UiChip
          v-for="lang in STUDY_LANGUAGES"
          :key="lang"
          :data-lang="lang"
          :selected="draft.languages.includes(lang)"
          @click="toggleLanguage(lang)"
        >
          {{ t(`profiles.lang.${lang}`) }}
        </UiChip>
      </div>
      <p v-if="errors.languages" id="pf-lang-error" class="profile-form__error" role="alert">
        {{ errorText('languages') }}
      </p>
    </fieldset>

    <fieldset class="profile-form__group">
      <legend>{{ t('profiles.goal') }}</legend>
      <div class="profile-form__row">
        <UiChip
          v-for="n in goals"
          :key="n"
          :selected="draft.dailyGoal === n"
          @click="patch({ dailyGoal: n })"
        >
          {{ n }}
        </UiChip>
      </div>
      <p class="profile-form__hint">{{ t('profiles.goalHint') }}</p>
      <p v-if="errors.dailyGoal" class="profile-form__error" role="alert">
        {{ errorText('dailyGoal') }}
      </p>
    </fieldset>

    <fieldset class="profile-form__group">
      <legend>{{ t('profiles.color') }}</legend>
      <div class="profile-form__row">
        <button
          v-for="color in PROFILE_COLORS"
          :key="color"
          type="button"
          class="profile-form__swatch"
          :class="{ 'profile-form__swatch--selected': draft.color === color }"
          :style="{ background: `var(--profile-${color})` }"
          :aria-label="t(`profiles.colors.${color}`)"
          :aria-pressed="draft.color === color"
          @click="patch({ color })"
        />
      </div>
    </fieldset>

    <slot name="extra" />

    <UiButton full-width :loading="busy" @click="emit('submit')">{{ submitLabel }}</UiButton>
  </form>
</template>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
}

.profile-form__group {
  margin: 0;
  padding: 0;
  border: 0;
}

.profile-form__group legend {
  margin-bottom: calc(var(--size-gutter) * 0.5);
  color: var(--color-fg-muted);
  font-weight: 600;
}

.profile-form__row {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--size-gutter) * 0.5);
}

.profile-form__hint {
  margin: calc(var(--size-gutter) * 0.25) 0 0;
  color: var(--color-fg-subtle);
  font-size: 0.875rem;
}

.profile-form__error {
  margin: calc(var(--size-gutter) * 0.25) 0 0;
  color: var(--color-danger);
  font-size: 0.875rem;
}

.profile-form__swatch {
  width: 36px;
  height: 36px;
  border: 3px solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
}

.profile-form__swatch--selected {
  border-color: var(--color-fg);
  box-shadow: inset 0 0 0 2px var(--color-surface);
}

.profile-form__swatch:focus-visible {
  outline: 2px solid var(--tint, var(--color-fg));
  outline-offset: 2px;
}
</style>
