// Блоки упражнения «собери фразу» и перемешивание (LNG-S1-017).

/** Генератор [0, 1): в рантайме Math.random, в тестах — детерминированный. */
export type Rng = () => number

/** Предложение режется по пробелам, знаки остаются при словах: «aquí.» — один блок. */
export const splitBlocks = (sentence: string): string[] => sentence.trim().split(/\s+/)

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Перемешать так, чтобы порядок не совпал с исходным (иначе задание решено заранее). */
export function scramble<T>(items: readonly T[], rng: Rng): T[] {
  if (new Set(items).size < 2) return [...items]
  for (let attempt = 0; attempt < 10; attempt++) {
    const out = shuffle(items, rng)
    if (out.some((x, i) => x !== items[i])) return out
  }
  return [...items.slice(1), items[0]!]
}

/** Детерминированный генератор для тестов и воспроизводимых сессий (mulberry32). */
export function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
