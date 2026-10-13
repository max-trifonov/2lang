import { Capacitor } from '@capacitor/core'

import { onResume } from './lifecycle'

// Воркер приложения один на scope «/» (D-16): офлайн-оболочку PWA и Web Push
// обслуживает один sw.js — второй воркер на том же scope вытеснил бы первый.
export const SERVICE_WORKER_URL = '/sw.js'

let pending: Promise<ServiceWorkerRegistration | null> | null = null

export function __resetServiceWorkerForTests(): void {
  pending = null
}

// registerServiceWorker — одна регистрация на всё приложение, её делят
// оболочка и webPush. На Android и iOS воркера нет: оболочка лежит в самой
// сборке, push идёт через FCM/APNs. Отказ не запоминается — следующий вызов
// пробует снова.
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (Capacitor.getPlatform() !== 'web' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null)
  }
  pending ??= navigator.serviceWorker.register(SERVICE_WORKER_URL).catch((error: unknown) => {
    pending = null
    throw error
  })
  return pending
}

// startOfflineShell — офлайн-оболочка PWA: регистрирует воркер и при каждом
// возврате в приложение просит браузер сверить sw.js. Сам браузер сверяет его
// только на навигации, а открытая PWA живёт без навигаций сутками. Только
// production-сборка: в dev оболочки нет, а scope «/» может занимать MSW.
export function startOfflineShell(): void {
  if (!import.meta.env.PROD) return
  void registerServiceWorker()
    .then((registration) => {
      if (!registration) return
      void onResume(() => {
        void registration.update().catch(() => undefined)
      })
    })
    // Без воркера приложение работает как раньше — только не стартует без сети.
    .catch(() => undefined)
}
