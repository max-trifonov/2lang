// FSRS-5 (LNG-S1-023, D-1): стабильность S — через сколько дней запоминаемость упадёт до 0,9;
// сложность D — 1…10. Параметры по умолчанию, без краткосрочных повторов в тот же день.

export const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
  1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898,
] as const

/** Оценка ответа: 1 — забыл, 2 — трудно, 3 — хорошо, 4 — легко. */
export type Grade = 1 | 2 | 3 | 4

const DECAY = -0.5
const FACTOR = 19 / 81
export const DESIRED_RETENTION = 0.9
export const MAX_INTERVAL = 36500
const MIN_STABILITY = 0.1

const clampD = (d: number) => Math.min(10, Math.max(1, d))

/** Запоминаемость через `days` дней после повторения. */
export const retrievability = (days: number, stability: number): number =>
  (1 + (FACTOR * Math.max(0, days)) / stability) ** DECAY

/** Интервал в целых днях, не меньше 1. */
export function nextInterval(stability: number, retention = DESIRED_RETENTION): number {
  const days = (stability / FACTOR) * (retention ** (1 / DECAY) - 1)
  return Math.min(MAX_INTERVAL, Math.max(1, Math.round(days)))
}

export const initialStability = (g: Grade): number => Math.max(MIN_STABILITY, W[g - 1]!)

export const initialDifficulty = (g: Grade): number => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1)

export function nextDifficulty(d: number, g: Grade): number {
  const damped = d + (-W[6] * (g - 3) * (10 - d)) / 9
  // Возврат к среднему: сложность не «залипает» на краях.
  return clampD(W[7] * initialDifficulty(4) + (1 - W[7]) * damped)
}

export function recallStability(d: number, s: number, r: number, g: Grade): number {
  const hard = g === 2 ? W[15] : 1
  const easy = g === 4 ? W[16] : 1
  const growth =
    Math.exp(W[8]) * (11 - d) * s ** -W[9] * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy
  return s * (1 + growth)
}

export function forgetStability(d: number, s: number, r: number): number {
  const next = W[11] * d ** -W[12] * ((s + 1) ** W[13] - 1) * Math.exp(W[14] * (1 - r))
  // После провала память не бывает крепче прежней.
  return Math.max(MIN_STABILITY, Math.min(s, next))
}
