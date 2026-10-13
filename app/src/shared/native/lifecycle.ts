import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

type Unsubscribe = () => void

async function subscribe(active: boolean, callback: () => void): Promise<Unsubscribe> {
  if (Capacitor.getPlatform() === 'web') {
    const handler = (): void => {
      if ((document.visibilityState === 'visible') === active) callback()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }
  const listener = await App.addListener('appStateChange', (state) => {
    if (state.isActive === active) callback()
  })
  return () => {
    void listener.remove()
  }
}

export function onResume(callback: () => void): Promise<Unsubscribe> {
  return subscribe(true, callback)
}

export function onPause(callback: () => void): Promise<Unsubscribe> {
  return subscribe(false, callback)
}
