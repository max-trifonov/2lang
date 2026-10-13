export type ColorScheme = 'light' | 'dark'

const QUERY = '(prefers-color-scheme: dark)'

function schemeFromQuery(query: MediaQueryList | MediaQueryListEvent): ColorScheme {
  return query.matches ? 'dark' : 'light'
}

export function watchColorScheme(callback: (scheme: ColorScheme) => void): () => void {
  const query = window.matchMedia(QUERY)
  callback(schemeFromQuery(query))
  const listener = (event: MediaQueryListEvent) => callback(schemeFromQuery(event))
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
