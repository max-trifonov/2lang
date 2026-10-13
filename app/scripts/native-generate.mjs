#!/usr/bin/env node
/**
 * Генерирует ios/ и android/ поверх Capacitor и накатывает native-overlay.
 * Нативные каталоги в git не хранятся.
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { loadManifest } from './lib/manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = loadManifest(root)

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: false })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function patchAndroid(appId, appName) {
  const gradle = join(root, 'android/app/build.gradle')
  if (!existsSync(gradle)) return
  let text = readFileSync(gradle, 'utf8')
  text = text.replace(/applicationId\s+"[^"]+"/, `applicationId "${appId}"`)
  text = text.replace(/namespace\s+"[^"]+"/, `namespace "${appId}"`)
  writeFileSync(gradle, text)

  const strings = join(root, 'android/app/src/main/res/values/strings.xml')
  if (existsSync(strings)) {
    let xml = readFileSync(strings, 'utf8')
    xml = xml.replace(
      /<string name="app_name">[^<]*<\/string>/,
      `<string name="app_name">${escapeXml(appName)}</string>`,
    )
    xml = xml.replace(
      /<string name="title_activity_main">[^<]*<\/string>/,
      `<string name="title_activity_main">${escapeXml(appName)}</string>`,
    )
    writeFileSync(strings, xml)
  }
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function overlay() {
  const overlayRoot = join(root, 'native-overlay')
  for (const platform of ['android', 'ios']) {
    const from = join(overlayRoot, platform)
    const to = join(root, platform)
    if (!existsSync(from) || !existsSync(to)) continue
    cpSync(from, to, { recursive: true })
  }
}

if (!existsSync(join(root, 'node_modules/@capacitor/cli'))) {
  console.error('Сначала npm ci')
  process.exit(1)
}

if (manifest.platforms?.android && !existsSync(join(root, 'android'))) {
  run('npx', ['cap', 'add', 'android'])
}
if (manifest.platforms?.ios && !existsSync(join(root, 'ios'))) {
  run('npx', ['cap', 'add', 'ios'])
}

overlay()
if (manifest.platforms?.android) {
  patchAndroid(manifest.identity.appId, manifest.identity.displayName)
}

run('npx', ['cap', 'sync'])
console.log('native:generate done', manifest.identity.appId)
