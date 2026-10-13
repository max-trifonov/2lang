// service-worker.mjs — сборка sw.js (D-16). В исходник воркера подставляется
// оболочка PWA: пути файлов сборки с sha256 содержимого и версия оболочки.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

export const SERVICE_WORKER_FILE = 'sw.js'

const PLACEHOLDER = '__SHELL_MANIFEST__'
// Не входят в оболочку: сам воркер (его сверяет браузер), воркер MSW из
// public/ и карты исходников.
const EXCLUDED = new Set([SERVICE_WORKER_FILE, 'mockServiceWorker.js'])

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

export function emptyShell({ base = '/', assetsDir = 'assets' } = {}) {
  return { version: 'empty', index: `${base}index.html`, assets: `${base}${assetsDir}/`, files: {} }
}

export function collectShell(outDir, options = {}) {
  const shell = emptyShell(options)
  const base = options.base ?? '/'
  const paths = listFiles(outDir)
    .map((file) => relative(outDir, file).split(sep).join('/'))
    .filter((path) => !EXCLUDED.has(path) && !path.endsWith('.map'))
    .sort()
  for (const path of paths) {
    shell.files[`${base}${path}`] = sha256(readFileSync(join(outDir, path)))
  }
  shell.version = sha256(
    Object.entries(shell.files)
      .map(([path, revision]) => `${path} ${revision}`)
      .join('\n'),
  ).slice(0, 16)
  return shell
}

export function renderServiceWorker(source, shell) {
  const parts = source.split(PLACEHOLDER)
  if (parts.length !== 2) {
    throw new Error(`service worker: ${PLACEHOLDER} должен встречаться в исходнике ровно один раз`)
  }
  return parts.join(JSON.stringify(shell))
}

// serviceWorker — плагин Vite. Сборка кладёт sw.js с оболочкой рядом с
// index.html; precache: false (приложение без PWA) — воркер без оболочки,
// только push. dev-сервер отдаёт sw.js с пустой оболочкой: в dev кэшировать
// нечего, а Web Push проверяется. Исходника нет (скаффолд вырезал и PWA, и
// push) — плагин ничего не делает.
export function serviceWorker({ source, precache = true }) {
  let config
  let sourcePath
  const render = (shell) => renderServiceWorker(readFileSync(sourcePath, 'utf8'), shell)
  const shellOptions = () => ({ base: config.base, assetsDir: config.build.assetsDir })

  return {
    name: 'app-service-worker',
    configResolved(resolved) {
      config = resolved
      sourcePath = resolve(config.root, source)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== `${config.base}${SERVICE_WORKER_FILE}` || !existsSync(sourcePath)) return next()
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(render(emptyShell(shellOptions())))
      })
    },
    // writeBundle, а не closeBundle: тот зовётся и на упавшей сборке и оставил
    // бы в dist sw.js с неполной оболочкой.
    writeBundle() {
      if (!existsSync(sourcePath)) return
      const outDir = resolve(config.root, config.build.outDir)
      const shell = precache ? collectShell(outDir, shellOptions()) : emptyShell(shellOptions())
      writeFileSync(join(outDir, SERVICE_WORKER_FILE), render(shell))
    },
  }
}
