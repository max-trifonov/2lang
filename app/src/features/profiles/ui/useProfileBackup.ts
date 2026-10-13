import { alertController } from '@ionic/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { saveFile } from '@/shared/native'
import { showToast } from '@/shared/ui'

import { useProfilesStore, type RestorePlan } from '../store'

type ReadyPlan = Extract<RestorePlan, { ok: true }>

/** Сохранить копию активного профиля и восстановить профиль из файла (LNG-S1-006). */
export function useProfileBackup() {
  const { t, locale } = useI18n()
  const profiles = useProfilesStore()
  const exporting = ref(false)
  const restoring = ref(false)
  const busy = () => exporting.value || restoring.value

  async function exportToFile(): Promise<void> {
    if (busy()) return
    exporting.value = true
    try {
      const file = await profiles.exportActive()
      if (!file) return
      const result = await saveFile(file.fileName, file.content, 'application/json')
      if (result !== 'cancelled') void showToast(t('profiles.backup.saved'))
    } catch {
      void showToast(t('profiles.backup.saveFailed'))
    } finally {
      exporting.value = false
    }
  }

  async function confirmReplace(plan: ReadyPlan): Promise<boolean> {
    const date = new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(
      new Date(plan.exportedAt),
    )
    const alert = await alertController.create({
      header: t('profiles.backup.replaceTitle', { name: plan.existing?.name ?? plan.profile.name }),
      message: t('profiles.backup.replaceText', { date }),
      buttons: [
        { text: t('profiles.cancel'), role: 'cancel' },
        { text: t('profiles.backup.replaceConfirm'), role: 'destructive' },
      ],
    })
    await alert.present()
    return (await alert.onDidDismiss()).role === 'destructive'
  }

  /** true — профиль восстановлен и стал активным. */
  async function restoreFrom(file: File): Promise<boolean> {
    if (busy()) return false
    restoring.value = true
    try {
      let source: string
      try {
        source = await file.text()
      } catch {
        void showToast(t('profiles.backup.errors.read_failed'))
        return false
      }
      const plan = profiles.planRestore(source)
      if (!plan.ok) {
        void showToast(t(`profiles.backup.errors.${plan.error}`))
        return false
      }
      if (plan.kind === 'replace' && !(await confirmReplace(plan))) return false
      await profiles.applyRestore(plan)
      void showToast(t('profiles.backup.restored', { name: plan.profile.name }))
      return true
    } catch {
      void showToast(t('profiles.saveFailed'))
      return false
    } finally {
      restoring.value = false
    }
  }

  return { exporting, restoring, exportToFile, restoreFrom }
}
