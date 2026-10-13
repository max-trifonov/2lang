// sw.js — service worker приложения (D-16): офлайн-оболочка PWA и приём Web
// Push. Воркер на scope «/» один: второй, зарегистрированный на тот же scope,
// вытеснил бы первый.
//
// Оболочку — пути файлов сборки с sha256 содержимого и её версию — подставляет
// scripts/lib/service-worker.mjs. Новая сборка меняет байты sw.js, по ним
// браузер и находит обновление. Пустая оболочка (dev-сервер, сборка без PWA)
// оставляет только push: запросы идут в сеть мимо воркера.
const SHELL = __SHELL_MANIFEST__

const CACHE_PREFIX = 'app-shell:'
const CACHE_NAME = `${CACHE_PREFIX}${SHELL.version}`
// Кладётся после всех файлов: кэш оболочки без маркера — прерванная установка.
const COMPLETE_MARKER = '/__app-shell-complete__'
const NAVIGATION_TIMEOUT_MS = 3000
const shellPaths = new Set(Object.keys(SHELL.files))

self.addEventListener('install', (event) => {
  // Новая сборка берёт управление сразу, не дожидаясь закрытия всех вкладок:
  // установленную PWA целиком не закрывают неделями. Открытые страницы не
  // перезагружаются — их чанки остаются в прошлой оболочке (pruneShells).
  event.waitUntil(precacheShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(pruneShells().then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (shellPaths.size === 0 || request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request))
  } else if (shellPaths.has(url.pathname)) {
    event.respondWith(fromCurrentShell(url.pathname, request))
  } else if (url.pathname.startsWith(SHELL.assets)) {
    event.respondWith(fromAnyShell(url.pathname, request))
  }
})

async function precacheShell() {
  if (shellPaths.size === 0) return
  const cache = await caches.open(CACHE_NAME)
  await Promise.all(
    Object.entries(SHELL.files).map(([path, revision]) => precacheFile(cache, path, revision)),
  )
  await cache.put(COMPLETE_MARKER, new Response(SHELL.version))
}

async function precacheFile(cache, path, revision) {
  // no-cache: HTTP-кэш браузера может лишь подтвердить файл у сервера (304),
  // но не подсунуть копию, оставшуюся от прошлой сборки.
  const response = await fetch(new Request(path, { cache: 'no-cache' }))
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  // Сервер отдаёт файл другой сборки — выкатка идёт прямо сейчас. Такая
  // оболочка собрала бы index.html одной сборки с чанками другой, и старт без
  // сети кончился бы белым экраном. Установка падает, остаётся прежняя
  // оболочка, браузер повторит установку при следующей сверке sw.js.
  if ((await sha256(await response.clone().arrayBuffer())) !== revision) {
    throw new Error(`${path}: содержимое не совпадает со сборкой`)
  }
  await cache.put(path, response)
}

async function sha256(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// pruneShells оставляет текущую оболочку и последнюю полную из прошлых:
// страница, открытая на прошлой сборке, догружает из неё ленивые чанки,
// которых на сервере может уже не быть. keys() отдаёт кэши в порядке создания.
async function pruneShells() {
  const others = (await caches.keys()).filter(
    (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
  )
  let previous = null
  for (const name of others) {
    if (await (await caches.open(name)).match(COMPLETE_MARKER)) previous = name
  }
  await Promise.all(others.filter((name) => name !== previous).map((name) => caches.delete(name)))
}

// navigate — сеть первой: на связи пользователь сразу получает свежую сборку,
// а не ту, что застал прошлый запуск. Сеть упала, молчит дольше
// NAVIGATION_TIMEOUT_MS или ответила ошибкой — index.html из оболочки.
async function navigate(request) {
  const network = fetch(request)
  const response = await Promise.race([
    network.catch(() => null),
    new Promise((resolve) => setTimeout(resolve, NAVIGATION_TIMEOUT_MS, null)),
  ])
  if (response?.ok) return response
  const cached = await (await caches.open(CACHE_NAME)).match(SHELL.index)
  return cached ?? network
}

async function fromCurrentShell(path, request) {
  const cached = await (await caches.open(CACHE_NAME)).match(path)
  return cached ?? fetch(request)
}

// Хеш-чанк не из текущей оболочки: имя файла однозначно задаёт содержимое,
// поэтому годится копия из любой оболочки — обычно прошлой, на которой открыта
// страница.
async function fromAnyShell(path, request) {
  return (await caches.match(path)) ?? fetch(request)
}

// CAPABILITY:push
self.addEventListener('push', (event) => {
  let payload
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }
  const title = payload.title || 'New notification'
  const options = {
    body: payload.body || '',
    vibrate: [200, 100, 200],
    data: { url: payload.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          client.postMessage({ type: 'push-notification-click', url: targetUrl })
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
      return undefined
    }),
  )
})
// /CAPABILITY:push
