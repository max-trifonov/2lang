import { describe, expect, it } from 'vitest'

import { withRetry } from './retry'
import { ApiError } from './errors'

describe('withRetry', () => {
  it('не повторяет 4xx кроме 429', async () => {
    let calls = 0
    await expect(
      withRetry(async () => {
        calls += 1
        throw new ApiError(400, 'bad', 'bad')
      }),
    ).rejects.toMatchObject({ status: 400 })
    expect(calls).toBe(1)
  })

  it('повторяет сетевой сбой без status', async () => {
    let calls = 0
    const result = await withRetry(async () => {
      calls += 1
      if (calls < 2) throw new Error('offline')
      return 'ok'
    })
    expect(result).toBe('ok')
    expect(calls).toBe(2)
  })
})
