import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

import { loadManifest } from './scripts/lib/manifest.mjs'

const manifest = loadManifest()

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_NAME__: JSON.stringify(manifest.identity.displayName),
    __APP_ID__: JSON.stringify(manifest.identity.appId),
    __APP_VERSION__: JSON.stringify(manifest.identity.version),
    __API_BASE_URL__: JSON.stringify(manifest.api.baseUrl ?? ''),
    __DEEP_LINK_SCHEME__: JSON.stringify(manifest.deepLink?.scheme ?? ''),
    __CAPABILITIES__: JSON.stringify(manifest.capabilities),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'scripts/lib/**/*.spec.mjs'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
