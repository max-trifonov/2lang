export const WELCOME_PATH = '/welcome'

/**
 * Куда вести навигацию по состоянию профилей (AC-1): без профиля — только экран
 * первого запуска, с профилем экран первого запуска не нужен. undefined — пропустить.
 */
export function profileRedirect(path: string, hasProfiles: boolean): string | undefined {
  if (!hasProfiles && path !== WELCOME_PATH) return WELCOME_PATH
  if (hasProfiles && path === WELCOME_PATH) return '/'
  return undefined
}
