import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { collectShell, renderServiceWorker } from './service-worker.mjs'

const sha256 = (text) => createHash('sha256').update(text).digest('hex')

const created = []

function dist(files) {
  const dir = mkdtempSync(join(tmpdir(), 'app-shell-dist-'))
  created.push(dir)
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  return dir
}

afterEach(() => {
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true })
})

const BUILD = {
  'index.html': '<html></html>',
  'assets/index-a1.js': 'console.log(1)',
  'assets/index-a1.js.map': '{}',
  'manifest.webmanifest': '{"name":"App"}',
  'sw.js': 'old worker',
  'mockServiceWorker.js': 'msw',
}

describe('collectShell', () => {
  it('берёт файлы сборки с sha256, кроме воркеров и карт исходников', () => {
    const shell = collectShell(dist(BUILD))

    expect(shell.files).toEqual({
      '/assets/index-a1.js': sha256('console.log(1)'),
      '/index.html': sha256('<html></html>'),
      '/manifest.webmanifest': sha256('{"name":"App"}'),
    })
    expect(shell).toMatchObject({ index: '/index.html', assets: '/assets/' })
  })

  it('версия зависит только от файлов оболочки', () => {
    const version = collectShell(dist(BUILD)).version
    const reversed = Object.fromEntries(Object.entries(BUILD).reverse())

    expect(collectShell(dist(reversed)).version).toBe(version)
    expect(collectShell(dist({ ...BUILD, 'assets/index-a1.js': 'console.log(2)' })).version).not.toBe(
      version,
    )
    expect(collectShell(dist({ ...BUILD, 'sw.js': 'new worker' })).version).toBe(version)
  })

  it('пути и каталог ассетов — от base и assetsDir сборки', () => {
    const shell = collectShell(dist({ 'index.html': 'x', 'static/app.js': 'y' }), {
      base: '/app/',
      assetsDir: 'static',
    })

    expect(Object.keys(shell.files)).toEqual(['/app/index.html', '/app/static/app.js'])
    expect(shell).toMatchObject({ index: '/app/index.html', assets: '/app/static/' })
  })
})

describe('renderServiceWorker', () => {
  const shell = { version: 'v1', index: '/index.html', assets: '/assets/', files: { '/index.html': 'abc' } }

  it('подставляет оболочку JSON-ом', () => {
    expect(renderServiceWorker('const SHELL = __SHELL_MANIFEST__\n', shell)).toBe(
      `const SHELL = ${JSON.stringify(shell)}\n`,
    )
  })

  it('исходник без места подстановки или с двумя — ошибка сборки', () => {
    expect(() => renderServiceWorker('const SHELL = {}', shell)).toThrow()
    expect(() => renderServiceWorker('__SHELL_MANIFEST__ __SHELL_MANIFEST__', shell)).toThrow()
  })
})
