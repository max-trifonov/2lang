import { describe, expect, it } from 'vitest'

import type { Task } from './practice'
import { answer, current, finished, score, startPractice } from './session'

const task = (n: number): Task => ({ kind: 'translate', prompt: `t${n}`, accepted: [`a${n}`] })

describe('очередь практики (AC-5)', () => {
  it('всё верно — конец после последнего, оценка 1', () => {
    let p = startPractice([task(1), task(2)])
    p = answer(answer(p, true), true)
    expect(finished(p)).toBe(true)
    expect(score(p)).toBe(1)
  })

  it('ошибка — задание в конце один раз, оценка его не засчитывает', () => {
    let p = startPractice([task(1), task(2)])
    p = answer(p, false)
    p = answer(p, true)
    expect(current(p)).toEqual({ task: task(1), retry: true })
    p = answer(p, false) // повтор снова неверно — больше не возвращается
    expect(finished(p)).toBe(true)
    expect(p.queue).toHaveLength(3)
    expect(score(p)).toBe(0.5)
  })

  it('верный повтор не повышает оценку', () => {
    let p = startPractice([task(1)])
    p = answer(answer(p, false), true)
    expect(finished(p)).toBe(true)
    expect(score(p)).toBe(0)
  })

  it('ответ после конца ничего не меняет', () => {
    const p = answer(startPractice([task(1)]), true)
    expect(answer(p, false)).toBe(p)
  })
})
