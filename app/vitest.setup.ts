
// Спеки с `@vitest-environment node` (сервис-воркер) идут без window.
const win = typeof window === 'undefined' ? undefined : window

if (win && typeof win.matchMedia !== 'function') {
  Object.defineProperty(win, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

if (win && !win.ResizeObserver) {
  win.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
