import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export const BACK_BUTTON_PRIORITY = -1

interface BackButtonDetail {
  register: (priority: number, handler: (processNextHandler: () => void) => void) => void
}

function canNavigateBack(): boolean {
  const position = window.history.state?.position
  return typeof position === 'number' && position > 0
}

export function registerBackButton(): () => void {
  const onIonBackButton = (event: Event): void => {
    const detail = (event as CustomEvent<BackButtonDetail>).detail
    detail.register(BACK_BUTTON_PRIORITY, (processNextHandler) => {
      if (Capacitor.getPlatform() !== 'android') {
        processNextHandler()
        return
      }
      if (canNavigateBack()) {
        processNextHandler()
        return
      }
      void App.exitApp()
    })
  }
  document.addEventListener('ionBackButton', onIonBackButton)
  return () => document.removeEventListener('ionBackButton', onIonBackButton)
}
