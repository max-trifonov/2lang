import type { CapacitorConfig } from '@capacitor/cli'

import { loadManifest } from './scripts/lib/manifest.mjs'

const manifest = loadManifest()

const config: CapacitorConfig = {
  appId: manifest.identity.appId,
  appName: manifest.identity.displayName,
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
