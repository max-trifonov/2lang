import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

export function loadManifest(base = root) {
  const raw = readFileSync(join(base, 'app.manifest.json'), 'utf8')
  return JSON.parse(raw)
}
