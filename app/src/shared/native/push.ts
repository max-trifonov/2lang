import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

import * as webPush from './webPush'

export type PushPermission = 'granted' | 'denied' | 'prompt' | 'unsupported'

function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web'
}

// pushProvider — D-15: 'web' больше не значит «нет пуша» (D-533 у первого
// потомка, курьер Delivery) — Web Push/VAPID через webPush.ts. 'WEBPUSH'
// только когда браузер умеет и ключ настроен (webPush.supported());
// сигнатура функций (не только тип) осталась прежней ради потомков,
// которые уже вызывают эти пять экспортов как есть.
export function pushProvider(): 'FCM' | 'APNS' | 'WEBPUSH' | null {
  switch (Capacitor.getPlatform()) {
    case 'android':
      return 'FCM'
    case 'ios':
      return 'APNS'
    default:
      return webPush.supported() ? 'WEBPUSH' : null
  }
}

export async function checkPushPermission(): Promise<PushPermission> {
  if (isWeb()) return webPush.checkPermission()
  try {
    const status = await PushNotifications.checkPermissions()
    return status.receive === 'granted'
      ? 'granted'
      : status.receive === 'denied'
        ? 'denied'
        : 'prompt'
  } catch {
    return 'unsupported'
  }
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (isWeb()) return webPush.requestPermission()
  try {
    const status = await PushNotifications.requestPermissions()
    return status.receive === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'unsupported'
  }
}

export async function onPushToken(callback: (token: string) => void): Promise<() => void> {
  if (isWeb()) return webPush.onToken(callback)
  const listener = await PushNotifications.addListener('registration', (token) =>
    callback(token.value),
  )
  return () => {
    void listener.remove()
  }
}

export async function onPushTokenError(callback: (reason: string) => void): Promise<() => void> {
  if (isWeb()) return webPush.onTokenError(callback)
  const listener = await PushNotifications.addListener('registrationError', (error) =>
    callback(String(error.error)),
  )
  return () => {
    void listener.remove()
  }
}

export async function registerForPush(): Promise<void> {
  if (isWeb()) return webPush.subscribe()
  await PushNotifications.register()
}
