import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetServiceWorkerForTests,
  registerServiceWorker,
  startOfflineShell,
} from './serviceWorker'

const state = vi.hoisted(() => ({ platform: 'web', resume: [] as Array<() => void> }))

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => state.platform },
}))

vi.mock('./lifecycle', () => ({
  onResume: async (callback: () => void) => {
    state.resume.push(callback)
    return () => undefined
  },
}))

const register = vi.fn()

beforeEach(() => {
  state.platform = 'web'
  state.resume = []
  register.mockReset()
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } })
  __resetServiceWorkerForTests()
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'serviceWorker')
  vi.unstubAllEnvs()
})

describe('registerServiceWorker', () => {
  it('одна регистрация /sw.js на оболочку и push', async () => {
    const registration = { update: vi.fn() }
    register.mockResolvedValue(registration)

    const [first, second] = await Promise.all([registerServiceWorker(), registerServiceWorker()])

    expect(first).toBe(registration)
    expect(second).toBe(registration)
    expect(register).toHaveBeenCalledOnce()
    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('на Android воркер не регистрируется: оболочка в самой сборке', async () => {
    state.platform = 'android'

    expect(await registerServiceWorker()).toBeNull()
    expect(register).not.toHaveBeenCalled()
  })

  it('браузер без service worker — null', async () => {
    Reflect.deleteProperty(navigator, 'serviceWorker')

    expect(await registerServiceWorker()).toBeNull()
  })

  it('отказ регистрации не запоминается: следующий вызов пробует снова', async () => {
    register
      .mockRejectedValueOnce(new Error('insecure context'))
      .mockResolvedValueOnce({ update: vi.fn() })

    await expect(registerServiceWorker()).rejects.toThrow('insecure context')
    await expect(registerServiceWorker()).resolves.toBeTruthy()
    expect(register).toHaveBeenCalledTimes(2)
  })
})

describe('startOfflineShell', () => {
  it('в dev воркер оболочки не регистрируется', async () => {
    vi.stubEnv('PROD', false)

    startOfflineShell()
    await Promise.resolve()

    expect(register).not.toHaveBeenCalled()
  })

  it('production-сборка регистрирует воркер и сверяет sw.js при возврате в приложение', async () => {
    vi.stubEnv('PROD', true)
    const registration = { update: vi.fn(async () => undefined) }
    register.mockResolvedValue(registration)

    startOfflineShell()
    await vi.waitFor(() => expect(state.resume).toHaveLength(1))
    state.resume[0]?.()

    expect(register).toHaveBeenCalledWith('/sw.js')
    expect(registration.update).toHaveBeenCalledOnce()
  })
  it('смена воркера у открытой страницы — обновление, первая установка — нет', async () => {
    vi.stubEnv('PROD', true)
    register.mockResolvedValue({ update: vi.fn(async () => undefined) })
    const listeners: Array<() => void> = []
    const sw = (controller: object | null) => ({
      register,
      controller,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    })
    const onUpdate = vi.fn()

    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw(null) })
    startOfflineShell(onUpdate)
    expect(listeners).toHaveLength(0)

    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw({}) })
    startOfflineShell(onUpdate)
    listeners[0]?.()
    expect(onUpdate).toHaveBeenCalledOnce()
  })
})
