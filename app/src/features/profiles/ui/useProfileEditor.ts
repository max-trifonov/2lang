import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { showToast } from '@/shared/ui'

import type { Profile, ProfileDraft, ProfileErrors } from '../domain/profile'
import type { SaveResult } from '../store'

/** Состояние формы профиля: черновик, ошибки полей, «сохраняем», сбой хранилища — тостом. */
export function useProfileEditor(
  initial: ProfileDraft,
  save: (draft: ProfileDraft) => Promise<SaveResult>,
) {
  const { t } = useI18n()
  const draft = ref<ProfileDraft>(initial)
  const errors = ref<ProfileErrors>({})
  const busy = ref(false)

  async function submit(): Promise<Profile | null> {
    if (busy.value) return null
    busy.value = true
    try {
      const result = await save(draft.value)
      if (!result.ok) {
        errors.value = result.errors
        return null
      }
      errors.value = {}
      return result.profile
    } catch {
      void showToast(t('profiles.saveFailed'))
      return null
    } finally {
      busy.value = false
    }
  }

  return { draft, errors, busy, submit }
}
