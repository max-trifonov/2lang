// Иконки PWA из assets/icon.svg (LNG-S1-004): `npm run icons`, нужен Google Chrome
// (путь — переменная CHROME). PNG коммитятся: шрифт и рендер на машине разработчика
// не должны влиять на иконку у пользователя.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'assets/icon.svg'), 'utf8')
const chrome = process.env.CHROME ?? 'google-chrome'
const work = mkdtempSync(join(tmpdir(), '2lang-icons-'))

// rounded — «обычная» иконка со скруглением; maskable — фон до краёв, знак в безопасной
// зоне (центральные 80 %): Android сам обрежет в круг или «каплю».
const variants = [
  { file: 'icons/icon-192.png', size: 192, radius: 96, scale: 1 },
  { file: 'icons/icon-512.png', size: 512, radius: 96, scale: 1 },
  { file: 'icons/maskable-512.png', size: 512, radius: 0, scale: 0.72 },
  { file: 'icons/apple-touch-icon.png', size: 180, radius: 0, scale: 0.86 },
  { file: 'icons/favicon-32.png', size: 32, radius: 96, scale: 1 },
]

for (const { file, size, radius, scale } of variants) {
  const variant = svg
    .replace('rx="0"', `rx="${radius}"`)
    .replace(
      '<g id="mark"',
      `<g id="mark" transform="translate(256 256) scale(${scale}) translate(-256 -256)"`,
    )
  const html = join(work, `${size}-${radius}-${scale}.html`)
  writeFileSync(
    html,
    `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${variant}`,
  )
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--window-size=${size},${size}`,
      `--screenshot=${join(root, 'public', file)}`,
      `file://${html}`,
    ],
    { stdio: 'ignore' },
  )
  console.log('✓', file)
}
