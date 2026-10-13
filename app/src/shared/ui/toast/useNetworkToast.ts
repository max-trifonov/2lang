import { toastController } from '@ionic/vue'

export const NETWORK_TOAST_DURATION_MS = 3000

export async function showNetworkErrorToast(message: string): Promise<void> {
  const toast = await toastController.create({
    message,
    duration: NETWORK_TOAST_DURATION_MS,
    position: 'bottom',
    color: 'danger',
  })
  await toast.present()
}

export async function showToast(message: string): Promise<void> {
  const toast = await toastController.create({
    message,
    duration: NETWORK_TOAST_DURATION_MS,
    position: 'bottom',
  })
  await toast.present()
}
