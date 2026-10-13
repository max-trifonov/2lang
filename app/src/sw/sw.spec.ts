// @vitest-environment node
// Воркер не трогает DOM; в jsdom webcrypto.digest отвергает Uint8Array из чужого realm.
import { createHash, webcrypto } from 'node:crypto'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderServiceWorker } from '../../scripts/lib/service-worker.mjs'

import SOURCE from './sw.js?raw'

// Воркер — классический скрипт: тест исполняет его с подменёнными self,
// caches и fetch, как это делает браузер.
const ORIGIN = 'https://app.test'
const COMPLETE_MARKER = '/__app-shell-complete__'

interface Shell {
  version: string
  index: string
  assets: string
  files: Record<string, string>
}

type Handler = (event: Record<string, unknown>) => void

const sha256 = (body: string): string => createHash('sha256').update(body).digest('hex')
const absolute = (url: string): string => new URL(url, ORIGIN).href

class FakeCache {
  private readonly entries = new Map<string, Response>()

  async put(url: string, response: Response): Promise<void> {
    this.entries.set(absolute(url), response)
  }

  async match(url: string): Promise<Response | undefined> {
    return this.entries.get(absolute(url))?.clone()
  }
}

class FakeCacheStorage {
  private readonly byName = new Map<string, FakeCache>()

  async open(name: string): Promise<FakeCache> {
    const cache = this.byName.get(name) ?? new FakeCache()
    this.byName.set(name, cache)
    return cache
  }

  async keys(): Promise<string[]> {
    return [...this.byName.keys()]
  }

  async delete(name: string): Promise<boolean> {
    return this.byName.delete(name)
  }

  async match(url: string): Promise<Response | undefined> {
    for (const cache of this.byName.values()) {
      const response = await cache.match(url)
      if (response) return response
    }
    return undefined
  }
}

// Request в Node требует абсолютный URL; в воркере относительный разрешается
// от его location.
class WorkerRequest extends Request {
  constructor(url: string, init?: RequestInit) {
    super(absolute(url), init)
  }
}

const BUILD = { '/index.html': '<html>v2</html>', '/assets/index-v2.js': 'app v2' }

function shellOf(files: Record<string, string>, version = 'v2'): Shell {
  return {
    version,
    index: '/index.html',
    assets: '/assets/',
    files: Object.fromEntries(Object.entries(files).map(([path, body]) => [path, sha256(body)])),
  }
}

function server(files: Record<string, string>) {
  return async (request: { url: string }): Promise<Response> => {
    const body = files[new URL(request.url).pathname]
    return body === undefined ? new Response('not found', { status: 404 }) : new Response(body)
  }
}

function startWorker(shell: Shell, network = server(BUILD)) {
  const handlers = new Map<string, Handler>()
  const cacheStorage = new FakeCacheStorage()
  const fetchMock = vi.fn(network)
  const self = {
    location: new URL(`${ORIGIN}/sw.js`),
    addEventListener: (type: string, handler: Handler) => {
      handlers.set(type, handler)
    },
    skipWaiting: vi.fn(async () => undefined),
    clients: {
      claim: vi.fn(async () => undefined),
      matchAll: vi.fn(async (): Promise<unknown[]> => []),
      openWindow: vi.fn(async (_url: string) => null),
    },
    registration: {
      showNotification: vi.fn(async (_title: string, _options: object) => undefined),
    },
  }
  new Function('self', 'caches', 'fetch', 'crypto', 'Request', renderServiceWorker(SOURCE, shell))(
    self,
    cacheStorage,
    fetchMock,
    webcrypto,
    WorkerRequest,
  )

  async function dispatch(type: string, event: Record<string, unknown> = {}): Promise<void> {
    let lifetime: Promise<unknown> = Promise.resolve()
    handlers.get(type)?.({
      ...event,
      waitUntil: (promise: Promise<unknown>) => {
        lifetime = promise
      },
    })
    await lifetime
  }

  function request(url: string, init: { mode?: string; method?: string } = {}) {
    let response: Promise<Response> | undefined
    handlers.get('fetch')?.({
      request: { url: absolute(url), method: init.method ?? 'GET', mode: init.mode ?? 'cors' },
      respondWith: (value: Promise<Response>) => {
        response = value
      },
    })
    return response
  }

  return { self, caches: cacheStorage, fetch: fetchMock, dispatch, request }
}

async function installedWorker() {
  const worker = startWorker(shellOf(BUILD))
  await worker.dispatch('install')
  await worker.dispatch('activate')
  worker.fetch.mockClear()
  return worker
}

async function text(pending: Promise<Response | undefined> | undefined): Promise<string> {
  const response = await pending
  if (!response) throw new Error('ответа нет')
  return response.text()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('установка оболочки', () => {
  it('кладёт файлы сборки и маркер полноты и берёт управление, не дожидаясь закрытия вкладок', async () => {
    const worker = startWorker(shellOf(BUILD))

    await worker.dispatch('install')

    const cache = await worker.caches.open('app-shell:v2')
    expect(await text(cache.match('/index.html'))).toBe('<html>v2</html>')
    expect(await text(cache.match('/assets/index-v2.js'))).toBe('app v2')
    expect(await cache.match(COMPLETE_MARKER)).toBeDefined()
    expect(worker.self.skipWaiting).toHaveBeenCalledOnce()
    // HTTP-кэш браузера лишь подтверждает файл у сервера, а не подсовывает прошлую сборку.
    expect(worker.fetch.mock.calls.map(([request]) => (request as Request).cache)).toEqual([
      'no-cache',
      'no-cache',
    ])
  })

  it('файл другой сборки на сервере (выкатка в процессе) валит установку', async () => {
    const worker = startWorker(
      shellOf(BUILD),
      server({ ...BUILD, '/assets/index-v2.js': 'app v3' }),
    )

    await expect(worker.dispatch('install')).rejects.toThrow('/assets/index-v2.js')
    expect(await (await worker.caches.open('app-shell:v2')).match(COMPLETE_MARKER)).toBeUndefined()
    expect(worker.self.skipWaiting).not.toHaveBeenCalled()
  })

  it('ошибка сервера валит установку', async () => {
    const worker = startWorker(shellOf(BUILD), server({ '/index.html': '<html>v2</html>' }))

    await expect(worker.dispatch('install')).rejects.toThrow('HTTP 404')
    expect(worker.self.skipWaiting).not.toHaveBeenCalled()
  })

  it('пустая оболочка (dev, сборка без PWA) ничего не скачивает', async () => {
    const worker = startWorker(shellOf({}))

    await worker.dispatch('install')

    expect(worker.fetch).not.toHaveBeenCalled()
    expect(worker.self.skipWaiting).toHaveBeenCalledOnce()
  })
})

describe('активация', () => {
  it('оставляет текущую оболочку и последнюю полную из прошлых, чужие кэши не трогает', async () => {
    const worker = startWorker(shellOf(BUILD))
    for (const name of ['app-shell:v0', 'app-shell:v1']) {
      await (await worker.caches.open(name)).put(COMPLETE_MARKER, new Response(name))
    }
    await worker.caches.open('app-shell:v3') // прерванная установка: маркера нет
    await worker.caches.open('images')

    await worker.dispatch('install')
    await worker.dispatch('activate')

    expect(await worker.caches.keys()).toEqual(['app-shell:v1', 'images', 'app-shell:v2'])
    expect(worker.self.clients.claim).toHaveBeenCalledOnce()
  })
})

describe('запросы', () => {
  it('навигация на связи — ответ сервера: свежая сборка сразу, а не запуском позже', async () => {
    const worker = await installedWorker()
    worker.fetch.mockImplementation(server({ '/shift': '<html>v3</html>' }))

    expect(await text(worker.request('/shift', { mode: 'navigate' }))).toBe('<html>v3</html>')
  })

  it('навигация без сети или с ошибкой сервера — index.html из оболочки', async () => {
    const worker = await installedWorker()

    worker.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    expect(await text(worker.request('/orders/7', { mode: 'navigate' }))).toBe('<html>v2</html>')

    worker.fetch.mockResolvedValueOnce(new Response('bad gateway', { status: 502 }))
    expect(await text(worker.request('/shift', { mode: 'navigate' }))).toBe('<html>v2</html>')
  })

  it('сеть молчит — index.html из оболочки через 3 секунды, а не по таймауту браузера', async () => {
    const worker = await installedWorker()
    vi.useFakeTimers()
    worker.fetch.mockReturnValueOnce(new Promise<Response>(() => undefined))
    let settled = false

    const response = worker.request('/shift', { mode: 'navigate' })
    void response?.then(() => {
      settled = true
    })

    await vi.advanceTimersByTimeAsync(2999)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(await text(response)).toBe('<html>v2</html>')
  })

  it('без оболочки и без сети навигация падает сетевой ошибкой, а не пустым ответом', async () => {
    const worker = startWorker(shellOf(BUILD))
    worker.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(worker.request('/shift', { mode: 'navigate' })).rejects.toThrow('Failed to fetch')
  })

  it('файл оболочки — из кэша, без сети', async () => {
    const worker = await installedWorker()

    expect(await text(worker.request('/assets/index-v2.js'))).toBe('app v2')
    expect(worker.fetch).not.toHaveBeenCalled()
  })

  it('чанк прошлой сборки — из прошлой оболочки: открытая до выкатки страница не ломается', async () => {
    const worker = startWorker(shellOf(BUILD))
    const previous = await worker.caches.open('app-shell:v1')
    await previous.put('/assets/HistoryPage-v1.js', new Response('history v1'))
    await previous.put(COMPLETE_MARKER, new Response('v1'))
    await worker.dispatch('install')
    await worker.dispatch('activate')
    worker.fetch.mockClear()

    expect(await text(worker.request('/assets/HistoryPage-v1.js'))).toBe('history v1')
    expect(worker.fetch).not.toHaveBeenCalled()
  })

  it('чужой origin, не GET и файлы вне оболочки идут мимо воркера', async () => {
    const worker = await installedWorker()

    expect(worker.request('https://api.test/v1/me')).toBeUndefined()
    expect(worker.request('/assets/index-v2.js', { method: 'POST' })).toBeUndefined()
    expect(worker.request('/mockServiceWorker.js')).toBeUndefined()
  })

  it('пустая оболочка на запросы не отвечает', () => {
    const worker = startWorker(shellOf({}))

    expect(worker.request('/shift', { mode: 'navigate' })).toBeUndefined()
    expect(worker.request('/assets/index-v2.js')).toBeUndefined()
  })
})

// CAPABILITY:push
describe('push', () => {
  it('показывает уведомление из payload, без payload — по умолчанию', async () => {
    const worker = startWorker(shellOf({}))
    const { showNotification } = worker.self.registration

    await worker.dispatch('push', {
      data: { json: () => ({ title: 'Hello', body: 'World', url: '/inbox' }) },
    })
    expect(showNotification).toHaveBeenLastCalledWith(
      'Hello',
      expect.objectContaining({ body: 'World', data: { url: '/inbox' } }),
    )

    await worker.dispatch('push', { data: null })
    expect(showNotification).toHaveBeenLastCalledWith(
      'New notification',
      expect.objectContaining({ body: '', data: { url: '/' } }),
    )
  })

  it('клик по уведомлению ведёт в открытое окно, а без него открывает новое', async () => {
    const worker = startWorker(shellOf({}))
    const client = { focus: vi.fn(async () => undefined), postMessage: vi.fn() }
    const click = { notification: { close: vi.fn(), data: { url: '/inbox' } } }

    worker.self.clients.matchAll.mockResolvedValueOnce([client])
    await worker.dispatch('notificationclick', click)
    expect(client.postMessage).toHaveBeenCalledWith({
      type: 'push-notification-click',
      url: '/inbox',
    })
    expect(client.focus).toHaveBeenCalledOnce()

    await worker.dispatch('notificationclick', click)
    expect(worker.self.clients.openWindow).toHaveBeenCalledWith('/inbox')
  })
})
// /CAPABILITY:push
