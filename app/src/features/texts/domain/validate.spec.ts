import { describe, expect, it } from 'vitest'

import type { Issue } from '@/features/content'
import { checkTextFile, validateText } from './validate'

function base(): Record<string, unknown> {
  return {
    format: '2lang/text',
    version: 1,
    id: 'arroz',
    kind: 'song',
    lang: 'es',
    license: 'own',
    title: { es: 'Arroz con leche' },
    stanzas: [
      {
        id: 'chorus',
        lines: [
          {
            es: 'Arroz con leche, me quiero casar',
            ru: 'Рис с молоком, я хочу жениться',
            phrases: [{ es: 'me quiero casar', ru: 'я хочу жениться' }],
            words: [{ es: 'quiero', lemma: 'querer', pos: 'verb' }],
          },
        ],
      },
    ],
  }
}

/** Текст с изменённым узлом: `edit` получает копию и правит её. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
function withEdit(edit: (doc: any) => void): Record<string, unknown> {
  const doc = structuredClone(base())
  edit(doc)
  return doc
}

const brief = (issues: Issue[]) => issues.map((i) => `${i.path}:${i.code}`)

describe('validateText — корректный текст', () => {
  it('принимает минимальный текст без проблем', () => {
    const result = validateText(base())
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.text?.id).toBe('arroz')
  })

  it('принимает необязательные поля и ext с любым содержимым', () => {
    const result = validateText(
      withEdit((d) => {
        Object.assign(d, {
          author: 'народная',
          performer: 'кто-то',
          year: 1900,
          level: 'A1',
          tags: ['kids'],
          links: [{ type: 'youtube', url: 'https://youtu.be/x' }],
          note: { ru: 'заметка' },
          ext: { anything: [1, { deep: true }] },
        })
        d.stanzas[0].type = 'chorus'
        d.stanzas[0].ext = { x: 1 }
        const line = d.stanzas[0].lines[0]
        Object.assign(line, { lit: { ru: 'дословно' }, note: { ru: 'н' }, t: 1.5, ext: { y: 2 } })
        line.phrases[0].note = { ru: 'n' }
        line.phrases[0].ext = {}
        line.words[0].ext = {}
        d.stanzas.push({ ref: 'chorus' })
      }),
    )
    expect(brief(result.errors)).toEqual([])
    expect(result.text).not.toBeNull()
  })
})

describe('validateText — структура (правило 1)', () => {
  it.each([
    ['не объект', [], '', 'not_object'],
    ['нет id', withEdit((d) => delete d.id), 'id', 'required'],
    ['неверный format', withEdit((d) => (d.format = '2lang/song')), 'format', 'bad_value'],
    ['неверная version', withEdit((d) => (d.version = 2)), 'version', 'bad_value'],
    ['неизвестный kind', withEdit((d) => (d.kind = 'film')), 'kind', 'bad_value'],
    ['опечатка в ключе', withEdit((d) => (d.titel = 'x')), 'titel', 'unknown_key'],
    ['год строкой', withEdit((d) => (d.year = '1806')), 'year', 'wrong_type'],
    ['год дробью', withEdit((d) => (d.year = 1806.5)), 'year', 'wrong_type'],
    ['id не slug', withEdit((d) => (d.id = 'Arroz Con')), 'id', 'bad_slug'],
    ['lang не код', withEdit((d) => (d.lang = 'esp')), 'lang', 'bad_lang'],
    ['пустой title', withEdit((d) => (d.title = {})), 'title', 'empty'],
    ['пустая строка в title', withEdit((d) => (d.title = { es: '' })), 'title.es', 'empty'],
    ['нет строф', withEdit((d) => (d.stanzas = [])), 'stanzas', 'empty'],
    ['повтор тега', withEdit((d) => (d.tags = ['kids', 'kids'])), 'tags[1]', 'duplicate_tag'],
    ['see не массив', withEdit((d) => (d.see = 'es-grammar-01')), 'see', 'wrong_type'],
    ['пустая тема в see', withEdit((d) => (d.see = [''])), 'see[0]', 'empty'],
    [
      'плохая ссылка',
      withEdit((d) => (d.links = [{ type: 'youtube', url: 'не ссылка' }])),
      'links[0].url',
      'bad_url',
    ],
    [
      'неизвестный ключ в строке',
      withEdit((d) => (d.stanzas[0].lines[0].transl = 'x')),
      'stanzas[0].lines[0].transl',
      'unknown_key',
    ],
    [
      'неизвестная часть речи',
      withEdit((d) => (d.stanzas[0].lines[0].words[0].pos = 'noun-ish')),
      'stanzas[0].lines[0].words[0].pos',
      'bad_value',
    ],
    [
      'отрицательный t',
      withEdit((d) => (d.stanzas[0].lines[0].t = -1)),
      'stanzas[0].lines[0].t',
      'bad_value',
    ],
  ])('%s → ошибка с путём', (_name, doc, path, code) => {
    const result = validateText(doc)
    expect(brief(result.errors)).toContain(`${path}:${code}`)
    expect(result.text).toBeNull()
  })
})

describe('validateText — межполевые правила', () => {
  it('title без оригинала (правило 2)', () => {
    const result = validateText(withEdit((d) => (d.title = { ru: 'Рис' })))
    expect(brief(result.errors)).toEqual(['title:missing_original'])
  })

  it('строка, фраза и слово без оригинала (правило 2)', () => {
    const result = validateText(
      withEdit((d) => {
        const line = d.stanzas[0].lines[0]
        line.phrases[0] = { ru: 'я хочу жениться', en: 'I want to marry' }
        line.words[0] = { ru: 'хочу' }
        d.stanzas[0].lines.push({ ru: 'только перевод' })
      }),
    )
    expect(brief(result.errors)).toEqual([
      'stanzas[0].lines[0].phrases[0]:missing_original',
      'stanzas[0].lines[0].words[0]:missing_original',
      'stanzas[0].lines[1]:missing_original',
    ])
  })

  it('фраза без перевода (правило 3)', () => {
    const result = validateText(
      withEdit(
        (d) => (d.stanzas[0].lines[0].phrases[0] = { es: 'me quiero casar', note: { ru: 'n' } }),
      ),
    )
    expect(brief(result.errors)).toEqual(['stanzas[0].lines[0].phrases[0]:phrase_no_translation'])
  })

  it('фраза и слово не входят в строку (правило 4), с цитатой', () => {
    const result = validateText(
      withEdit((d) => {
        d.stanzas[0].lines[0].phrases[0].es = 'me quiero ir'
        d.stanzas[0].lines[0].words[0].es = 'quise'
      }),
    )
    expect(result.errors).toEqual([
      {
        severity: 'error',
        code: 'phrase_not_in_line',
        path: 'stanzas[0].lines[0].phrases[0]',
        params: { fragment: 'me quiero ir', line: 'Arroz con leche, me quiero casar' },
      },
      {
        severity: 'error',
        code: 'word_not_in_line',
        path: 'stanzas[0].lines[0].words[0]',
        params: { fragment: 'quise', line: 'Arroz con leche, me quiero casar' },
      },
    ])
  })

  it('вхождение без учёта регистра и формы записи Unicode (NFC/NFD)', () => {
    const result = validateText(
      withEdit((d) => {
        const line = d.stanzas[0].lines[0]
        line.es = 'Mañana, ME QUIERO CASAR'
        line.phrases[0].es = 'me quiero casar'
        line.words[0] = { es: 'mañana' } // «ñ» составным символом
      }),
    )
    expect(brief(result.errors)).toEqual([])
  })

  it('ref на необъявленную строфу и на строфу ниже (правило 5)', () => {
    const result = validateText(
      withEdit((d) => {
        d.stanzas.unshift({ ref: 'chorus' })
        d.stanzas.push({ ref: 'bridge' })
      }),
    )
    expect(brief(result.errors)).toEqual([
      'stanzas[0].ref:ref_unknown',
      'stanzas[2].ref:ref_unknown',
    ])
  })

  it('строфа с lines и ref или без обоих (правило 5)', () => {
    const result = validateText(
      withEdit((d) => {
        d.stanzas.push({ ref: 'chorus', lines: d.stanzas[0].lines })
        d.stanzas.push({ type: 'chorus' })
      }),
    )
    expect(brief(result.errors)).toEqual([
      'stanzas[1]:stanza_lines_and_ref',
      'stanzas[2]:stanza_no_content',
    ])
  })

  it('повторяющийся id строфы (правило 6)', () => {
    const result = validateText(withEdit((d) => d.stanzas.push({ ...d.stanzas[0] })))
    expect(brief(result.errors)).toEqual(['stanzas[1].id:duplicate_stanza_id'])
  })

  it('на структурно битом узле межполевые правила молчат', () => {
    const result = validateText(withEdit((d) => (d.stanzas[0].lines[0].phrases = 'me quiero')))
    expect(brief(result.errors)).toEqual(['stanzas[0].lines[0].phrases:wrong_type'])
  })
})

describe('validateText — предупреждения', () => {
  it('строка без перевода: предупреждение, текст принят', () => {
    const result = validateText(
      withEdit((d) => d.stanzas[0].lines.push({ es: 'con una señorita' })),
    )
    expect(result.errors).toEqual([])
    expect(brief(result.warnings)).toEqual(['stanzas[0].lines[1]:line_no_translation'])
    expect(result.text).not.toBeNull()
  })

  it('строке не хватает языков, которые есть в других строках', () => {
    const result = validateText(
      withEdit((d) => {
        d.stanzas[0].lines[0].en = 'Rice pudding, I want to get married'
        d.stanzas[0].lines.push({ es: 'con una señorita', ru: 'на сеньорите' })
      }),
    )
    expect(result.warnings).toEqual([
      {
        severity: 'warning',
        code: 'line_missing_langs',
        path: 'stanzas[0].lines[1]',
        params: { langs: 'en' },
      },
    ])
    expect(result.text).not.toBeNull()
  })
})

describe('checkTextFile', () => {
  it('битый JSON — одна ошибка со строкой и столбцом, без исключения', () => {
    const result = checkTextFile('{\n  "id": "x",\n  "kind" "song"\n}')
    expect(result.text).toBeNull()
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({
      code: 'json_syntax',
      path: '',
      params: { line: 3, column: 10 },
    })
  })

  it('корректный файл разбирается и проверяется', () => {
    const result = checkTextFile(JSON.stringify(base()))
    expect(result.errors).toEqual([])
    expect(result.text?.stanzas).toHaveLength(1)
  })
})
