import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNetworkStore = defineStore('network', () => {
  const online = ref(true)
  const connectionType = ref<string>('unknown')

  function apply(status: { connected: boolean; connectionType?: string }): void {
    online.value = status.connected
    connectionType.value = status.connectionType ?? 'unknown'
  }

  return { online, connectionType, apply }
})

let started = false

export function __resetNetworkWatchForTests(): void {
  started = false
}

export async function startNetworkWatch(): Promise<void> {
  if (started) return
  started = true
  const store = useNetworkStore()

  if (Capacitor.getPlatform() === 'web') {
    store.apply({ connected: navigator.onLine, connectionType: 'unknown' })
    window.addEventListener('online', () => store.apply({ connected: true }))
    window.addEventListener('offline', () => store.apply({ connected: false }))
    return
  }

  try {
    store.apply(await Network.getStatus())
    await Network.addListener('networkStatusChange', (status) => store.apply(status))
  } catch {
    store.apply({ connected: true })
  }
}
