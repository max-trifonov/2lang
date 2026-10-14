<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { checkmark, close, refresh, volumeHigh } from 'ionicons/icons'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SpeakButton, WordArticle, say } from '@/features/dictionary'
import { UiButton, UiField } from '@/shared/ui'

import { checkAnswer, type Checked } from '../player/answer'
import type { Task } from '../player/practice'

// Задание практики урока слов (LNG-S1-017): вопрос → ответ → разбор → «дальше».
// Родитель пересоздаёт компонент на каждое задание (key), состояние живёт здесь.
// Кнопки — внизу экрана (LNG-S1-029): урок проходится одной рукой.
const props = defineProps<{ task: Task; lang: string; retry: boolean }>()
const emit = defineEmits<{ next: [correct: boolean, accent: boolean] }>()
const { t } = useI18n()

const result = ref<Checked | null>(null)
const chosen = ref<string | null>(null)
const typed = ref('')
/** Собранные блоки — индексы в task.blocks: одинаковые слова различаются позицией. */
const built = ref<number[]>([])

const correct = computed(() => result.value !== null && result.value.verdict !== 'wrong')
const isChoice = computed(
  () =>
    props.task.kind === 'recognize' ||
    props.task.kind === 'hear' ||
    props.task.kind === 'pick' ||
    props.task.kind === 'choose',
)
/** Ответ собирается из блоков: «собери фразу» и трансформер грамматики. */
const isBlocks = computed(() => props.task.kind === 'build' || props.task.kind === 'transform')
const blocks = computed(() =>
  props.task.kind === 'build' || props.task.kind === 'transform' ? props.task.blocks : [],
)
/** Своё предложение (compose): образец открывается по кнопке, оценка — самоотметкой. */
const revealed = ref(false)

const accepted = computed((): string[] => {
  const task = props.task
  switch (task.kind) {
    case 'recognize':
    case 'hear':
    case 'pick':
    case 'choose':
      return [task.answer]
    case 'build':
      return [task.sentence]
    case 'compose':
      return task.samples
    default:
      return task.accepted
  }
})

function choose(option: string): void {
  if (result.value) return
  chosen.value = option
  result.value = checkAnswer(option, accepted.value)
}

function check(): void {
  const input = isBlocks.value ? built.value.map((i) => blocks.value[i]).join(' ') : typed.value
  result.value = checkAnswer(input, accepted.value)
}

const canCheck = computed(() =>
  isBlocks.value ? built.value.length > 0 : typed.value.trim() !== '',
)

function optionState(option: string): string | undefined {
  if (!result.value) return undefined
  if (checkAnswer(option, accepted.value).verdict === 'exact') return 'right'
  return option === chosen.value ? 'wrong' : undefined
}

const hearTask = () =>
  props.task.kind === 'hear' ? say(props.task.word.lemma, props.lang) : undefined
onMounted(hearTask)

/** Пропуск в предложении — заметная «лунка», а не подчёркивания. */
const sentenceParts = computed(() =>
  props.task.kind === 'fill' || props.task.kind === 'build' || props.task.kind === 'choose'
    ? props.task.sentence.split('___')
    : [],
)
/** Что видно в «лунке»: набранное или выбранный вариант. */
const gapText = computed(() =>
  props.task.kind === 'choose' ? (chosen.value ?? '') : typed.value.trim(),
)
/** Подпись задания: у трансформера — во что превратить предложение. */
const kindLabel = computed(() =>
  props.task.kind === 'transform'
    ? t(`lessons.grammar.form.${props.task.form}`)
    : t(`lessons.task.${props.task.kind}`),
)
</script>

<template>
  <section class="task" :aria-live="result ? 'polite' : undefined">
    <div class="task__head">
      <p class="task__kind">{{ kindLabel }}</p>
      <span v-if="retry" class="task__retry">
        <IonIcon :icon="refresh" aria-hidden="true" />{{ t('lessons.task.again') }}
      </span>
    </div>

    <!-- вопрос -->
    <div v-if="task.kind === 'recognize'" class="task__prompt task__prompt--word">
      <span class="task__word">
        <WordArticle :word="task.word" class="task__article" />
        <strong :lang="lang">{{ task.word.lemma }}</strong>
      </span>
      <SpeakButton :text="task.word.lemma" :lang="lang" />
    </div>
    <div v-else-if="task.kind === 'hear'" class="task__prompt task__prompt--hear">
      <button
        type="button"
        class="task__listen"
        :aria-label="t('lessons.task.listen')"
        @click="hearTask"
      >
        <IonIcon :icon="volumeHigh" aria-hidden="true" />
      </button>
      <span class="task__listen-hint">{{ t('lessons.task.listen') }}</span>
    </div>
    <div
      v-else-if="task.kind === 'recall' || task.kind === 'translate' || task.kind === 'pick'"
      class="task__prompt"
    >
      <strong class="task__native">{{ task.prompt }}</strong>
    </div>
    <div v-else-if="task.kind === 'build'" class="task__prompt task__prompt--sentence">
      <strong v-if="task.translation" class="task__native">{{ task.translation }}</strong>
      <p v-else class="task__sentence" :lang="lang">{{ task.sentence }}</p>
    </div>
    <div v-else-if="task.kind === 'transform'" class="task__prompt task__prompt--sentence">
      <p class="task__sentence task__source" :lang="lang">{{ task.source }}</p>
    </div>
    <div v-else-if="task.kind === 'compose'" class="task__prompt task__prompt--sentence">
      <strong class="task__native">{{ task.prompt }}</strong>
      <span v-if="task.template" class="task__tr" :lang="lang">{{ task.template }}</span>
    </div>
    <div v-else class="task__prompt task__prompt--sentence">
      <p class="task__sentence" :lang="lang">
        <template v-for="(part, i) in sentenceParts" :key="i"
          >{{ part
          }}<span
            v-if="i < sentenceParts.length - 1"
            class="task__gap"
            :class="{ 'task__gap--filled': gapText }"
            >{{ gapText || '\u2003\u2003' }}</span
          ></template
        >
      </p>
      <span v-if="task.translation" class="task__tr">{{ task.translation }}</span>
    </div>

    <!-- ответ -->
    <div
      v-if="
        isChoice &&
        (task.kind === 'recognize' ||
          task.kind === 'hear' ||
          task.kind === 'pick' ||
          task.kind === 'choose')
      "
      class="task__options"
    >
      <button
        v-for="option in task.options"
        :key="option"
        type="button"
        class="task__option"
        :class="optionState(option) && `task__option--${optionState(option)}`"
        :disabled="Boolean(result)"
        :lang="task.kind === 'recognize' ? undefined : lang"
        @click="choose(option)"
      >
        <span class="task__option-text">{{ option }}</span>
        <IonIcon
          v-if="optionState(option)"
          class="task__option-icon"
          :icon="optionState(option) === 'right' ? checkmark : close"
          aria-hidden="true"
        />
      </button>
    </div>

    <template v-else-if="isBlocks">
      <div
        class="task__slot"
        :class="result && `task__slot--${correct ? 'right' : 'wrong'}`"
        :lang="lang"
      >
        <button
          v-for="(i, n) in built"
          :key="`b${n}`"
          type="button"
          class="task__block task__block--placed"
          :disabled="Boolean(result)"
          @click="built.splice(n, 1)"
        >
          {{ blocks[i] }}
        </button>
      </div>
      <div v-if="!result" class="task__pool" :lang="lang">
        <button
          v-for="(block, i) in blocks"
          :key="`p${i}`"
          type="button"
          class="task__block"
          :disabled="built.includes(i)"
          @click="built.push(i)"
        >
          {{ block }}
        </button>
      </div>
    </template>

    <template v-else-if="task.kind === 'compose'">
      <UiField v-model="typed" :label="t('lessons.grammar.yours')" :disabled="revealed" />
      <div v-if="revealed" class="task__samples">
        <span class="task__later">{{ t('lessons.grammar.sample') }}</span>
        <p v-for="s in task.samples" :key="s" class="task__sentence" :lang="lang">{{ s }}</p>
      </div>
    </template>

    <form v-else-if="!result" class="task__form" @submit.prevent="canCheck && check()">
      <UiField v-model="typed" :label="t('lessons.task.answer')" />
    </form>

    <!-- разбор и действия: внизу экрана, под большим пальцем -->
    <div class="task__bottom">
      <div
        v-if="result"
        class="task__feedback"
        :class="`task__feedback--${result.verdict}`"
        role="status"
      >
        <span class="task__feedback-icon" aria-hidden="true">
          <IonIcon :icon="correct ? checkmark : close" />
        </span>
        <div class="task__feedback-text">
          <strong v-if="result.verdict === 'exact'">{{ t('lessons.feedback.correct') }}</strong>
          <template v-else-if="result.verdict === 'accent'">
            <strong>{{ t('lessons.feedback.correct') }}</strong>
            <span
              >{{ t('lessons.feedback.accent') }}
              <b :lang="lang" class="task__expected">{{ result.expected }}</b></span
            >
          </template>
          <template v-else>
            <strong>{{ t('lessons.feedback.wrong') }}</strong>
            <span
              class="task__expected"
              :lang="isChoice && task.kind === 'recognize' ? undefined : lang"
              >{{ result.expected }}</span
            >
            <span v-if="!retry" class="task__later">{{ t('lessons.feedback.later') }}</span>
          </template>
        </div>
      </div>

      <div v-if="task.kind === 'compose'" class="task__actions">
        <template v-if="revealed">
          <UiButton
            variant="secondary"
            size="lg"
            class="task__nowrap"
            @click="emit('next', false, false)"
            >{{ t('lessons.sound.again') }}</UiButton
          >
          <UiButton full-width size="lg" @click="emit('next', true, false)">{{
            t('lessons.sound.gotIt')
          }}</UiButton>
        </template>
        <UiButton v-else full-width size="lg" @click="revealed = true">{{
          t('lessons.grammar.showSample')
        }}</UiButton>
      </div>
      <div v-else class="task__actions">
        <UiButton
          v-if="result"
          full-width
          size="lg"
          :class="{ 'task__next--wrong': !correct }"
          @click="emit('next', correct, result?.verdict === 'accent')"
          >{{ t('lessons.next') }}</UiButton
        >
        <template v-else-if="!isChoice">
          <UiButton
            v-if="isBlocks"
            variant="secondary"
            size="lg"
            :disabled="!built.length"
            :aria-label="t('lessons.task.reset')"
            @click="built = []"
          >
            <IonIcon :icon="refresh" aria-hidden="true" />
          </UiButton>
          <UiButton :disabled="!canCheck" full-width size="lg" @click="check">{{
            t('lessons.check')
          }}</UiButton>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  gap: calc(var(--size-gutter) * 1.25);
  min-height: 100%;
}

.task__head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.task__kind {
  margin: 0;
  color: var(--tint-ink, var(--color-fg-muted));
  font-size: var(--fs-meta);
  font-weight: 700;
}

.task__retry {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-xl);
  background: var(--reward-soft);
  color: var(--reward-ink);
  font-size: var(--fs-small);
  font-weight: 650;
}

.task__prompt {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 72px;
}

.task__prompt--word {
  justify-content: space-between;
  padding: calc(var(--size-gutter) * 1.25);
  border-radius: var(--radius-lg);
  background: var(--tint-soft);
}

.task__word {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  align-items: baseline;
  min-width: 0;
}

.task__word strong {
  color: var(--tint-ink);
  font-size: clamp(2rem, 10vw, 2.6rem);
  font-weight: 600;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.task__article {
  font-size: 1.4rem;
}

.task__prompt--hear {
  flex-direction: column;
  gap: 10px;
  padding: var(--size-gutter) 0;
}

.task__listen {
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--tint);
  box-shadow: 0 0 0 10px var(--tint-soft);
  color: var(--on-tint);
  font-size: 2.6rem;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.task__listen:active {
  transform: scale(0.94);
}

.task__listen-hint {
  color: var(--color-fg-subtle);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.task__native {
  font-size: clamp(1.5rem, 7vw, 1.9rem);
  font-weight: 650;
  line-height: 1.25;
}

.task__prompt--sentence {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.task__sentence {
  margin: 0;
  font-size: clamp(1.4rem, 6.5vw, 1.75rem);
  font-weight: 500;
  line-height: 1.45;
}

.task__gap {
  display: inline-block;
  min-width: 3.5em;
  padding: 0 0.3em;
  border-bottom: 3px solid var(--tint);
  border-radius: 4px 4px 0 0;
  background: var(--tint-soft);
  color: var(--tint-ink);
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}

.task__nowrap {
  flex: none;
  white-space: nowrap;
}

.task__source {
  padding: 12px 14px;
  border-left: 3px solid var(--tint);
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  background: var(--tint-soft);
}

.task__samples {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--tint-soft);
}

.task__samples .task__sentence {
  margin: 0;
}

.task__tr {
  color: var(--color-fg-muted);
  font-size: var(--fs-body);
}

.task__options {
  display: grid;
  gap: 10px;
}

.task__option {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 14px 18px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow:
    inset 0 0 0 2px var(--color-stroke),
    0 2px 0 var(--color-stroke);
  color: var(--color-fg);
  font: inherit;
  font-size: var(--fs-h3);
  font-weight: 550;
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--motion-duration-fade) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fade) var(--motion-ease-standard);
}

.task__option[lang] {
  font-family: var(--font-lang);
  font-size: 1.3rem;
}

.task__option:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: inset 0 0 0 2px var(--tint, var(--color-fg));
}

.task__option:disabled {
  cursor: default;
}

.task__option:disabled:not(.task__option--right, .task__option--wrong) {
  opacity: 0.5;
}

.task__option-icon {
  flex: none;
  font-size: 1.4rem;
}

.task__option--right {
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-surface));
  box-shadow: inset 0 0 0 2px var(--color-success);
  color: var(--color-success);
  font-weight: 650;
  animation: task-pop var(--motion-duration-pop) var(--motion-ease-spring);
}

.task__option--wrong {
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  box-shadow: inset 0 0 0 2px var(--color-danger);
  color: var(--color-danger);
  text-decoration: line-through;
  animation: task-shake var(--motion-duration-pop) var(--motion-ease-standard);
}

.task__slot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  min-height: 112px;
  padding: 12px;
  border: 2px dashed var(--color-chip-strong);
  border-radius: var(--radius-md);
}

.task__slot--right {
  border-style: solid;
  border-color: var(--color-success);
}

.task__slot--wrong {
  border-style: solid;
  border-color: var(--color-danger);
}

.task__pool {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.task__block {
  min-height: 48px;
  padding: 8px 16px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow:
    inset 0 0 0 2px var(--color-stroke),
    0 3px 0 var(--color-stroke);
  color: var(--color-fg);
  font: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform var(--motion-duration-fade) var(--motion-ease-standard);
}

.task__block:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: inset 0 0 0 2px var(--color-stroke);
}

.task__block--placed {
  background: var(--tint-soft);
  box-shadow: inset 0 0 0 2px var(--tint);
  color: var(--tint-ink);
}

.task__block:disabled:not(.task__block--placed) {
  visibility: hidden;
}

.task__form :deep(.ui-field__input) {
  min-height: 56px;
  font-family: var(--font-lang);
  font-size: 1.3rem;
}

.task__bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: var(--size-gutter);
  background: linear-gradient(transparent, var(--color-bg) 24px);
}

.task__feedback {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  animation: task-rise var(--motion-duration-sheet) var(--motion-ease-standard);
}

.task__feedback--exact,
.task__feedback--accent {
  background: color-mix(in srgb, var(--color-success) 13%, var(--color-surface));
  --verdict: var(--color-success);
}

.task__feedback--wrong {
  background: color-mix(in srgb, var(--color-danger) 11%, var(--color-surface));
  --verdict: var(--color-danger);
}

.task__feedback-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-xl);
  background: var(--verdict);
  color: var(--color-surface);
  font-size: 1.3rem;
}

.task__feedback-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.task__feedback-text strong {
  color: var(--verdict);
  font-size: var(--fs-h3);
}

.task__expected {
  color: var(--color-fg);
  font-size: 1.25rem;
  font-weight: 600;
}

.task__later {
  color: var(--color-fg-muted);
  font-size: var(--fs-small);
}

.task__actions {
  display: flex;
  gap: 8px;
}

.task__next--wrong {
  background: var(--color-fg);
  color: var(--color-bg);
}

@keyframes task-pop {
  50% {
    transform: scale(1.03);
  }
}

@keyframes task-shake {
  25% {
    transform: translateX(-6px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-3px);
  }
}

@keyframes task-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
