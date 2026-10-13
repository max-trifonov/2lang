<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { say } from '@/features/dictionary'
import { UiButton, UiField } from '@/shared/ui'

import { checkAnswer, type Checked } from '../player/answer'
import type { SoundTask } from '../player/sound'
import SoundButton from './SoundButton.vue'

// Задание звучания (LNG-S1-028): pairs / dictation сверяются, read / spell — самоотметка.
// Родитель пересоздаёт компонент на каждое задание (key).
const props = defineProps<{ task: SoundTask; lang: string; retry: boolean }>()
const emit = defineEmits<{ next: [correct: boolean] }>()
const { t } = useI18n()

const result = ref<Checked | null>(null)
const chosen = ref<string | null>(null)
const typed = ref('')
const revealed = ref(false)

const heard = computed(() =>
  props.task.kind === 'pairs' || props.task.kind === 'dictation'
    ? props.task.kind === 'pairs'
      ? props.task.heard
      : props.task.word
    : '',
)
const listen = () => say(heard.value, props.lang)
onMounted(() => {
  if (heard.value) void listen()
})

const correct = computed(() => result.value !== null && result.value.verdict !== 'wrong')

function choose(option: string): void {
  if (result.value || props.task.kind !== 'pairs') return
  chosen.value = option
  result.value = checkAnswer(option, props.task.answer)
}

function check(): void {
  if (props.task.kind === 'dictation') result.value = checkAnswer(typed.value, props.task.word)
}
</script>

<template>
  <section class="task" :aria-live="result ? 'polite' : undefined">
    <p class="task__kind">{{ t(`lessons.sound.task.${task.kind}`) }}</p>
    <p v-if="retry" class="task__retry">{{ t('lessons.task.again') }}</p>

    <!-- услышь и выбери / диктант -->
    <template v-if="task.kind === 'pairs' || task.kind === 'dictation'">
      <div class="task__prompt">
        <UiButton variant="secondary" @click="listen">{{ t('lessons.task.listen') }}</UiButton>
      </div>
      <div v-if="task.kind === 'pairs'" class="task__options">
        <button
          v-for="option in task.options"
          :key="option"
          type="button"
          class="task__option"
          :class="
            result &&
            (option === task.answer
              ? 'task__option--right'
              : option === chosen && 'task__option--wrong')
          "
          :lang="lang"
          :disabled="Boolean(result)"
          @click="choose(option)"
        >
          {{ option }}
        </button>
      </div>
      <form v-else-if="!result" class="task__form" @submit.prevent="typed.trim() && check()">
        <UiField v-model="typed" :label="t('lessons.task.answer')" />
      </form>
    </template>

    <!-- прочитай сам -->
    <template v-else-if="task.kind === 'read'">
      <div class="task__prompt">
        <strong :lang="lang">{{ task.word }}</strong>
        <SoundButton :text="task.word" :lang="lang" />
      </div>
      <p class="task__hint">{{ t('lessons.sound.readHint') }}</p>
    </template>

    <!-- продиктуй по буквам -->
    <template v-else>
      <div class="task__prompt">
        <strong :lang="lang">{{ task.word }}</strong>
      </div>
      <p class="task__hint">{{ t('lessons.sound.spellHint') }}</p>
      <ul v-if="revealed" class="task__names">
        <li v-for="(name, i) in task.names" :key="i">
          <span :lang="lang">{{ name }}</span>
          <SoundButton :text="name" :lang="lang" />
        </li>
      </ul>
      <UiButton v-else variant="secondary" @click="revealed = true">
        {{ t('lessons.sound.reveal') }}
      </UiButton>
    </template>

    <!-- разбор сверяемых заданий -->
    <div
      v-if="result"
      class="task__feedback"
      :class="`task__feedback--${result.verdict}`"
      role="status"
    >
      <strong v-if="result.verdict === 'exact'">{{ t('lessons.feedback.correct') }}</strong>
      <template v-else-if="result.verdict === 'accent'">
        <strong>{{ t('lessons.feedback.correct') }}</strong>
        <span
          >{{ t('lessons.feedback.accent') }} <b :lang="lang">{{ result.expected }}</b></span
        >
      </template>
      <template v-else>
        <strong>{{ t('lessons.feedback.wrong') }}</strong>
        <span :lang="lang">{{ result.expected }}</span>
        <span v-if="!retry" class="task__later">{{ t('lessons.feedback.later') }}</span>
      </template>
    </div>

    <div class="task__actions">
      <UiButton v-if="result" full-width @click="emit('next', correct)">{{
        t('lessons.next')
      }}</UiButton>
      <template v-else-if="task.kind === 'dictation'">
        <UiButton :disabled="!typed.trim()" full-width @click="check">{{
          t('lessons.check')
        }}</UiButton>
      </template>
      <template v-else-if="task.kind === 'read' || task.kind === 'spell'">
        <UiButton variant="secondary" @click="emit('next', false)">{{
          t('lessons.sound.again')
        }}</UiButton>
        <UiButton full-width @click="emit('next', true)">{{ t('lessons.sound.gotIt') }}</UiButton>
      </template>
    </div>
  </section>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  gap: var(--size-gutter);
}

.task__kind {
  margin: 0;
  color: var(--color-fg-muted);
  font-weight: 600;
}

.task__retry,
.task__hint {
  margin: 0;
  color: var(--color-fg-subtle);
  font-size: 0.875rem;
}

.task__prompt {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 1.5rem;
}

.task__options {
  display: grid;
  gap: 8px;
}

.task__option {
  min-height: 48px;
  padding: 10px 14px;
  border: 1px solid var(--color-stroke);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  color: var(--color-fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.task__option:focus-visible {
  outline: 2px solid var(--tint, var(--color-fg));
}

.task__option--right {
  border-color: var(--color-success);
  font-weight: 600;
}

.task__option--wrong {
  border-color: var(--color-danger);
  text-decoration: line-through;
}

.task__names {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.task__names li {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px 2px 12px;
  border: 1px solid var(--color-stroke);
  border-radius: var(--radius-xl);
  background: var(--color-chip);
}

.task__feedback {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: var(--radius-xs);
  background: var(--color-chip);
}

.task__feedback--wrong strong {
  color: var(--color-danger);
}

.task__feedback--exact strong,
.task__feedback--accent strong {
  color: var(--color-success);
}

.task__later {
  color: var(--color-fg-subtle);
  font-size: 0.875rem;
}

.task__actions {
  display: flex;
  gap: 8px;
}
</style>
