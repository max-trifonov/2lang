import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'
import { Preferences } from '@capacitor/preferences'

const DEVICE_ID_KEY = 'twolang.device_id'

export type NativePlatform = 'ios' | 'android' | 'web'

export interface DeviceIdentity {
  deviceId: string
  platform: NativePlatform
  osVersion?: string | undefined
  model?: string | undefined
  locale: string
  timezone: string
}

let pending: Promise<DeviceIdentity> | null = null

export function __resetDeviceIdentityForTests(): void {
  pending = null
}

function fallbackId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

async function resolveDeviceId(): Promise<string> {
  const stored = await Preferences.get({ key: DEVICE_ID_KEY }).catch(() => ({ value: null }))
  if (stored.value) return stored.value
  const fresh = await Device.getId()
    .then((id) => id.identifier)
    .catch(() => fallbackId())
  await Preferences.set({ key: DEVICE_ID_KEY, value: fresh }).catch(() => undefined)
  return fresh
}

async function collect(): Promise<DeviceIdentity> {
  const [deviceId, info, language] = await Promise.all([
    resolveDeviceId(),
    Device.getInfo().catch(() => null),
    Device.getLanguageTag().catch(() => null),
  ])
  return {
    deviceId,
    platform: Capacitor.getPlatform() as NativePlatform,
    osVersion: info?.osVersion,
    model: info?.model,
    locale: language?.value ?? navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export function getDeviceIdentity(): Promise<DeviceIdentity> {
  pending ??= collect()
  return pending
}
