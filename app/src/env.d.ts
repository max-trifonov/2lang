/// <reference types="vite/client" />

declare const __APP_NAME__: string
declare const __APP_ID__: string
declare const __APP_VERSION__: string
declare const __API_BASE_URL__: string
declare const __VAPID_PUBLIC_KEY__: string
declare const __DEEP_LINK_SCHEME__: string
declare const __CAPABILITIES__: {
  geolocation: boolean
  push: boolean
  camera: boolean
  secureStorage: boolean
  offlineCache: boolean
  deepLinks: boolean
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, unknown>
  export default component
}
