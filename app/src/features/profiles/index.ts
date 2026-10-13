// Семейные профили на устройстве — LNG-S1-002.
export {
  defaultDraft,
  isInterfaceLocale,
  type InterfaceLocale,
  type Profile,
  type ProfileDraft,
  type ProfileErrors,
  type StudyLanguage,
} from './domain/profile'
export { useProfilesStore, type RestorePlan, type SaveResult } from './store'
export { default as ProfileAvatar } from './ui/ProfileAvatar.vue'
export { default as ProfileForm } from './ui/ProfileForm.vue'
export { useProfileEditor } from './ui/useProfileEditor'
export { WELCOME_PATH, profileRedirect } from './guard'
export { useProfileBackup } from './ui/useProfileBackup'
