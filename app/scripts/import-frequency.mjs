// Частотный каркас словаря (LNG-S1-012): `npm run content:frequency -- --src <каталог>`,
// где каталог — распакованный wordhoard-csv-v0.1.0.zip (D-24). Пишет content/frequency/.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildLists, parseCsv, toCsv, toReport } from './lib/frequency.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../content/frequency')
const args = process.argv.slice(2)
const src = args[args.indexOf('--src') + 1]
if (!args.includes('--src') || !src) {
  console.error('Укажите каталог wordhoard: npm run content:frequency -- --src <каталог>')
  process.exit(1)
}

const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'))
for (const lang of config.langs) {
  const rows = parseCsv(readFileSync(join(src, `wordhoard-${lang}.csv`), 'utf8'))
  const { lists, report } = buildLists(rows, lang, config)
  for (const [pos, list] of Object.entries(lists)) {
    writeFileSync(join(root, `${lang}.${pos}.csv`), toCsv(list))
    console.log(`✓ ${lang}.${pos}.csv — ${list.length}`)
  }
  writeFileSync(join(root, `report.${lang}.md`), toReport(lang, report))
}
