import type { Task } from './practice'

// Очередь практики (LNG-S1-017, D-4): ошибка — задание в конец очереди ровно один раз,
// оценка — верно с первого раза.

export interface Queued<T = Task> {
  task: T
  retry: boolean
}

export interface Practice<T = Task> {
  queue: Queued<T>[]
  pos: number
  /** Заданий в плане — знаменатель оценки; повторы не считаются. */
  total: number
  firstTry: number
}

export const startPractice = <T = Task>(tasks: readonly T[]): Practice<T> => ({
  queue: tasks.map((task) => ({ task, retry: false })),
  pos: 0,
  total: tasks.length,
  firstTry: 0,
})

export const current = <T>(p: Practice<T>): Queued<T> | null => p.queue[p.pos] ?? null

export const finished = <T>(p: Practice<T>): boolean => p.pos >= p.queue.length

export function answer<T>(p: Practice<T>, correct: boolean): Practice<T> {
  const item = current(p)
  if (!item) return p
  return {
    ...p,
    pos: p.pos + 1,
    queue: !correct && !item.retry ? [...p.queue, { task: item.task, retry: true }] : p.queue,
    firstTry: p.firstTry + (correct && !item.retry ? 1 : 0),
  }
}

/** Доля верных с первого раза, 0…1; пустая практика — 1. */
export const score = <T>(p: Practice<T>): number => (p.total ? p.firstTry / p.total : 1)
