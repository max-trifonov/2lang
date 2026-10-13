import 'fake-indexeddb/auto'

import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import { openDb } from '@/db'

import { MAX_FILE_BYTES } from './domain/import-plan'
import type { TextDoc } from './domain/types'
import { idbTextRepository } from './storage'
import { useTextsStore, type ImportFile, type ImportOptions } from './store'

function doc(id: string, phrases: string[] = ['me quiero casar']): TextDoc {
  return {
    format: '2lang/text',
    version: 1,
    id,
    kind: 'song',
    lang: 'es',
    license: 'own',
    title: { es: `T-${id}` },
    stanzas: [
      {
        lines: [
          {
            es: 'me quiero casar con una señorita',
            ru: 'п',
            phrases: phrases.map((es) => ({ es, ru: 'ф' })),
          },
        ],
      },
    ],
  }
}

const file = (name: string, content: unknown, size?: number): ImportFile => {
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  return { name, size: size ?? text.length, text: async () => text }
}

let n = 0
/** Стор на настоящем IndexedDB (fake) — своя БД на тест; `reopen` — перезапуск приложения. */
function setup() {
  const name = `texts-${++n}`
  let conn = openDb(name)
  const make = () => {
    setActivePinia(createPinia())
    const store = useTextsStore()
    let tick = 0
    store.configure({
      repository: idbTextRepository(() => conn),
      now: () => new Date(Date.UTC(2026, 9, 1, 10, 0, tick++)),
    })
    return store
  }
  return {
    store: make(),
    reopen: async () => {
      ;(await conn).close()
      conn = openDb(name)
      return make()
    },
  }
}

const yes: ImportOptions = { confirmReplace: async () => true, addedBy: 'p1' }

describe('загрузка текстов', () => {
  it('новый текст сохраняется и переживает перезапуск (AC-1)', async () => {
    const { store, reopen } = setup()
    const [outcome] = await store.importFiles([file('a.json', doc('a'))], yes)
    expect(outcome).toMatchObject({ status: 'added', title: 'T-a', errors: [] })
    const again = await reopen()
    await again.ready()
    expect(again.texts.map((r) => [r.id, r.addedBy])).toEqual([['a', 'p1']])
  })

  it('пачка: ок, ошибка, предупреждение — итог по каждому (AC-2, AC-3, AC-5)', async () => {
    const { store } = setup()
    const warned = doc('w')
    warned.stanzas = [{ lines: [{ es: 'sin traducción' }] }]
    const outcomes = await store.importFiles(
      [file('ok.json', doc('ok')), file('bad.json', '{"id": '), file('w.json', warned)],
      yes,
    )
    expect(outcomes.map((o) => [o.fileName, o.status])).toEqual([
      ['ok.json', 'added'],
      ['bad.json', 'rejected'],
      ['w.json', 'added'],
    ])
    expect(outcomes[1]!.errors[0]).toMatchObject({ code: 'json_syntax' })
    expect(outcomes[2]!.warnings[0]).toMatchObject({ code: 'line_no_translation' })
    expect(store.texts.map((r) => r.id).sort()).toEqual(['ok', 'w'])
  })

  it('замена — только после подтверждения; отказ оставляет старое (AC-4)', async () => {
    const { store } = setup()
    await store.importFiles([file('a.json', doc('a'))], yes)
    const next = doc('a', ['me quiero casar', 'una señorita'])
    const confirm = vi.fn(async () => false)

    const [declined] = await store.importFiles([file('a2.json', next)], {
      ...yes,
      confirmReplace: confirm,
    })
    expect(declined).toMatchObject({
      status: 'declined',
      phrases: { kept: 1, added: 1, removed: 0 },
    })
    expect(confirm).toHaveBeenCalledOnce()
    expect(store.texts[0]!.doc.stanzas).toEqual(doc('a').stanzas)

    const [replaced] = await store.importFiles([file('a2.json', next)], yes)
    expect(replaced!.status).toBe('replaced')
    expect(store.texts).toHaveLength(1)
    expect(store.texts[0]!.doc).toEqual(next)
    expect(store.texts[0]!.addedAt < store.texts[0]!.updatedAt).toBe(true)
  })

  it('тот же файл ещё раз — без изменений и без вопроса', async () => {
    const { store } = setup()
    await store.importFiles([file('a.json', doc('a'))], yes)
    const confirm = vi.fn(async () => true)
    const [outcome] = await store.importFiles([file('a.json', doc('a'))], {
      ...yes,
      confirmReplace: confirm,
    })
    expect(outcome!.status).toBe('unchanged')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('слишком большой файл не читается', async () => {
    const { store } = setup()
    const huge: ImportFile = { name: 'big.json', size: MAX_FILE_BYTES + 1, text: vi.fn() }
    const [outcome] = await store.importFiles([huge], yes)
    expect(outcome).toMatchObject({ status: 'rejected', errors: [{ code: 'file_too_large' }] })
    expect(huge.text).not.toHaveBeenCalled()
  })

  it('файл не прочитался — failed, остальные грузятся', async () => {
    const { store } = setup()
    const broken: ImportFile = {
      name: 'x.json',
      size: 10,
      text: () => Promise.reject(new Error('gone')),
    }
    const outcomes = await store.importFiles([broken, file('a.json', doc('a'))], yes)
    expect(outcomes.map((o) => o.status)).toEqual(['failed', 'added'])
  })

  it('свежие — сверху', async () => {
    const { store } = setup()
    await store.importFiles([file('a.json', doc('a')), file('b.json', doc('b'))], yes)
    expect(store.texts.map((r) => r.id)).toEqual(['b', 'a'])
  })
})
