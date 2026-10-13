<script setup lang="ts">
import { alertCircleOutline } from 'ionicons/icons'
import { computed, useId } from 'vue'
import { IonIcon } from '@ionic/vue'

withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: 'text' | 'tel' | 'email' | 'number' | 'date' | 'password'
    error?: string | undefined
    hint?: string | undefined
    disabled?: boolean
    required?: boolean
  }>(),
  { type: 'text', disabled: false, required: false, error: undefined, hint: undefined },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const fieldId = useId()
const errorId = computed(() => `${fieldId}-error`)
</script>

<template>
  <div class="ui-field" :class="{ 'ui-field--error': Boolean(error) }">
    <label class="ui-field__label" :for="fieldId">
      {{ label }}
    </label>
    <input
      :id="fieldId"
      class="ui-field__input"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="errorId" class="ui-field__error" role="alert">
      <IonIcon :icon="alertCircleOutline" aria-hidden="true" />
      <span>{{ error }}</span>
    </p>
    <p v-else-if="hint" class="ui-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--size-gutter) * 0.33);
  width: 100%;
}

.ui-field__label {
  font-family: var(--font-sans);
  font-size: var(--fs-meta);
  font-weight: 600;
  color: var(--color-fg-muted);
}

.ui-field__input {
  min-height: 48px;
  padding: calc(var(--size-gutter) * 0.67) calc(var(--size-gutter) * 0.9);
  border: 1.5px solid var(--color-stroke);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  transition: border-color var(--motion-duration-fade) var(--motion-ease-standard);
}

.ui-field__input:focus {
  border-color: var(--tint, var(--color-fg));
  outline: none;
}

.ui-field__hint,
.ui-field__error {
  margin: 0;
  font-size: var(--fs-small);
}

.ui-field__error {
  color: var(--color-danger);
  display: flex;
  gap: calc(var(--size-gutter) * 0.33);
}

.ui-field__hint {
  color: var(--color-fg-muted);
}
</style>
