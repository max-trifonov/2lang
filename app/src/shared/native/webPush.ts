// webPush — D-15 (templates-app): ветка платформы 'web' для push.ts (Web
// Push/VAPID) — приватный модуль, наружу торчит только push.ts с прежней
// сигнатурой (D-533 в журнале потомка `~/Projects/Menu/Delivery`).
import type { PushPermission } from './push'
import { registerServiceWorker } from './serviceWorker'

declare const __VAPID_PUBLIC_KEY__: string

type TokenCallback = (token: string) => void
type ErrorCallback = (reason: string) => void

const tokenCallbacks = new Set<TokenCallback>()
const errorCallbacks = new Set<ErrorCallback>()

// supported — не только возможности браузера (SW/PushManager/Notification),
// но и наличие настроенного VAPID-ключа: без него подписаться всё равно
// нельзя, честнее сразу отвечать 'unsupported', чем упасть при subscribe().
export function supported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'Notification' in window &&
    Boolean(__VAPID_PUBLIC_KEY__)
  )
}

function mapPermission(value: NotificationPermission): 'granted' | 'denied' | 'prompt' {
  if (value === 'granted') return 'granted'
  if (value === 'denied') return 'denied'
  return 'prompt'
}

export function checkPermission(): PushPermission {
  if (!supported()) return 'unsupported'
  return mapPermission(Notification.permission)
}

export async function requestPermission(): Promise<PushPermission> {
  if (!supported()) return 'unsupported'
  try {
    return mapPermission(await Notification.requestPermission())
  } catch {
    return 'unsupported'
  }
}

export function onToken(callback: TokenCallback): () => void {
  tokenCallbacks.add(callback)
  return () => {
    tokenCallbacks.delete(callback)
  }
}

export function onTokenError(callback: ErrorCallback): () => void {
  errorCallbacks.add(callback)
  return () => {
    errorCallbacks.delete(callback)
  }
}

// urlBase64ToUint8Array — стандартный конвертер VAPID-ключа (RFC 4648 §5,
// тот же приём, что в любом Web Push howto) под `applicationServerKey`.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes
}

// subscribe — эквивалент PushNotifications.register() для веба: берёт общую
// регистрацию воркера приложения (serviceWorker.ts, D-16), подписывается
// (переиспользует существующую подписку, если уже есть — AC-7 потомка:
// повторный вызов не плодит вторую), отдаёт токен теми же callback'ами, что
// onToken/onTokenError у нативной ветки.
export async function subscribe(): Promise<void> {
  if (!supported()) return
  try {
    const registration = await registerServiceWorker()
    if (!registration) throw new Error('service worker unavailable')
    await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(__VAPID_PUBLIC_KEY__) as BufferSource,
    })
    const token = JSON.stringify(subscription.toJSON())
    tokenCallbacks.forEach((cb) => cb(token))
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    errorCallbacks.forEach((cb) => cb(reason))
  }
}
