import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import { loadManifest } from './scripts/lib/manifest.mjs'
import { serviceWorker } from './scripts/lib/service-worker.mjs'

const manifest = loadManifest()

export default defineConfig({
  // D-16: sw.js с офлайн-оболочкой рядом с index.html (без PWA — только push).
  plugins: [vue(), serviceWorker({ source: 'src/sw/sw.js', precache: manifest.platforms.pwa })],
  define: {
    __APP_NAME__: JSON.stringify(manifest.identity.displayName),
    __APP_ID__: JSON.stringify(manifest.identity.appId),
    __APP_VERSION__: JSON.stringify(manifest.identity.version),
    __API_BASE_URL__: JSON.stringify(process.env.API_BASE_URL ?? manifest.api.baseUrl ?? ''),
    __VAPID_PUBLIC_KEY__: JSON.stringify(process.env.VAPID_PUBLIC_KEY ?? ''),
    __DEEP_LINK_SCHEME__: JSON.stringify(manifest.deepLink?.scheme ?? ''),
    __CAPABILITIES__: JSON.stringify(manifest.capabilities),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Контент (словари) лежит рядом с приложением — в content/ монорепо (D-15).
    fs: { allow: ['..'] },
  },
})
