import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { openDb } from '@/db'
import { useWordStatusStore } from '@/features/dictionary'
import { idbWordStatusRepository } from '@/features/dictionary/known'
import { idbProfileRepository } from '@/features/profiles/storage'

import { idbPlacementRepository, usePlacementStore } from './store'

let n = 0
function setup() {
  const conn = openDb(`placement-${++n}`)
  setActivePinia(createPinia())
  const words = useWordStatusStore()
  const placement = usePlacementStore()
  const now = () => new Date('2026-10-01T10:00:00.000Z')
  words.configure({ repository: idbWordStatusRepository(() => conn), now })
  placement.configure({ repository: idbPlacementRepository(() => conn), now })
  return { words, placement, conn }
}

const profile = (id: string) => ({
  id,
  name: id,
  color: 'blue' as const,
  interfaceLocale: 'ru' as const,
  languages: ['en' as const],
  dailyGoal: 2,
  createdAt: '2026-10-01T00:00:00Z',
})

describe('статусы слов и проверка (AC-3, AC-6)', () => {
  it('статусы и завершение — свои у профиля и переживают перезапуск', async () => {
    const { words, placement, conn } = setup()
    await words.forProfile('a')
    await placement.forProfile('a')
    await words.setMany(
      [
        { key: 'word:en:be', status: 'known' },
        { key: 'word:en:time', status: 'unknown' },
      ],
      'placement',
    )
    await placement.finish('en')
    await words.forProfile('b')
    await placement.forProfile('b')
    expect(words.hasAny('en')).toBe(false)
    expect(placement.isFinished('en')).toBe(false)

    setActivePinia(createPinia())
    const w = useWordStatusStore()
    const p = usePlacementStore()
    w.configure({ repository: idbWordStatusRepository(() => conn) })
    p.configure({ repository: idbPlacementRepository(() => conn) })
    await w.forProfile('a')
    await p.forProfile('a')
    expect([...w.knownKeys()]).toEqual(['word:en:be'])
    expect(w.status('word:en:time')).toBe('unknown')
    expect(w.hasAny('en')).toBe(true)
    expect(p.isFinished('en')).toBe(true)
  })

  it('повторная отметка перезаписывает статус', async () => {
    const { words } = setup()
    await words.forProfile('a')
    await words.setMany([{ key: 'word:en:be', status: 'unknown' }], 'placement')
    await words.setMany([{ key: 'word:en:be', status: 'known' }], 'placement')
    expect(words.isKnown('word:en:be')).toBe(true)
  })

  it('попадают в резервную копию и удаляются вместе с профилем (D-18, К1)', async () => {
    const { words, placement, conn } = setup()
    const profiles = idbProfileRepository(() => conn)
    await profiles.save(profile('a'), true)
    await profiles.save(profile('b'))
    await words.forProfile('a')
    await placement.forProfile('a')
    await words.setMany([{ key: 'word:en:be', status: 'known' }], 'placement')
    await placement.finish('en')

    const copy = await profiles.exportData('a')
    expect(copy.word_status).toEqual([
      {
        profileId: 'a',
        key: 'word:en:be',
        status: 'known',
        source: 'placement',
        at: '2026-10-01T10:00:00.000Z',
      },
    ])
    expect(copy.placement).toEqual([
      { profileId: 'a', lang: 'en', finishedAt: '2026-10-01T10:00:00.000Z' },
    ])
    await profiles.remove('a', 'b')
    const gone = await profiles.exportData('a')
    expect(gone.word_status).toEqual([])
    expect(gone.placement).toEqual([])
  })
})
