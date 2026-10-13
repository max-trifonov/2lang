import { describe, expect, it } from 'vitest'

import type { Issue } from '@/features/content'

import { checkDictionaryFile, validateDictionary, validateDictionarySet } from './validate'

function tener(): Record<string, unknown> {
  return {
    id: 'tener',
    lemma: 'tener',
    pos: 'verb',
    rank: 4,
    irregular: true,
    translations: { ru: 'иметь' },
    pair: 'en:have',
    forms: {
      present: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      imperative: ['ten', 'tenga', 'tengamos', 'tened', 'tengan'],
      gerund: 'teniendo',
      participle: 'tenido',
    },
    examples: [{ es: 'Tengo una reserva.', ru: 'У меня бронь.', topic: 'travel' }],
  }
}

function file(entries: unknown[] = [tener()], patch: Record<string, unknown> = {}) {
  return { format: '2lang/dictionary', version: 1, lang: 'es', license: 'own', entries, ...patch }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
const entry = (edit: (e: any) => void, base = tener()) => {
  const e = structuredClone(base)
  edit(e)
  return e
}

const brief = (issues: Issue[]) => issues.map((i) => `${i.path}:${i.code}`)

describe('словарь: корректный файл', () => {
  it('без ошибок и предупреждений', () => {
    const result = validateDictionary(file())
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.file?.entries).toHaveLength(1)
  })

  it('все необязательные поля, id с буквами любого алфавита', () => {
    const año = {
      id: 'año',
      lemma: 'año',
      pos: 'noun',
      rank: 12,
      gender: 'm',
      ipa: 'ˈaɲo',
      rules: ['es-n-tilde'],
      translations: { ru: 'год', en: 'year' },
      forms: { plural: 'años' },
      topics: ['daily'],
      level: 'A1',
      note: { ru: 'не путать с ano' },
      examples: [
        { es: 'Este año viajo a México.', ru: 'В этом году еду в Мексику.', topic: 'travel' },
      ],
      ext: { anything: 1 },
    }
    const result = validateDictionary(file([tener(), año], { source: 'own', ext: {} }))
    expect(brief(result.errors)).toEqual([])
  })
})

describe('словарь: структура и поля (правила 2–9)', () => {
  it.each([
    ['не тот формат', file([], { format: '2lang/text' }), 'format:bad_value'],
    ['нет статей', file([]), 'entries:empty'],
    ['лицензия', file(undefined, { license: 'gpl' }), 'license:bad_value'],
    ['cc-by без source', file(undefined, { license: 'cc-by' }), 'source:required'],
    ['опечатка в ключе', file([entry((e) => (e.lema = 'x'))]), 'entries[0].lema:unknown_key'],
    ['id с пробелом', file([entry((e) => (e.id = 'tener que'))]), 'entries[0].id:bad_word_id'],
    ['id с заглавной', file([entry((e) => (e.id = 'Tener'))]), 'entries[0].id:bad_word_id'],
    ['ранг 0', file([entry((e) => (e.rank = 0))]), 'entries[0].rank:bad_value'],
    ['ранг дробный', file([entry((e) => (e.rank = 1.5))]), 'entries[0].rank:wrong_type'],
    ['часть речи', file([entry((e) => (e.pos = 'verbo'))]), 'entries[0].pos:bad_value'],
    [
      'irregular строкой',
      file([entry((e) => (e.irregular = 'yes'))]),
      'entries[0].irregular:wrong_type',
    ],
    [
      'тема примера',
      file([entry((e) => (e.examples[0].topic = 'food'))]),
      'entries[0].examples[0].topic:bad_value',
    ],
    [
      'пример без темы',
      file([entry((e) => delete e.examples[0].topic)]),
      'entries[0].examples[0].topic:required',
    ],
  ])('%s', (_name, doc, expected) => {
    const result = validateDictionary(doc)
    expect(brief(result.errors)).toContain(expected)
    expect(result.file).toBeNull()
  })

  it('повтор id и ранга в файле (правила 3–4)', () => {
    const dup = entry((e) => (e.rank = 5))
    const sameRank = entry((e) => {
      e.id = 'ser'
      e.lemma = 'ser'
      delete e.forms
      e.examples = [{ es: 'Soy de Rusia.', ru: 'Я из России.', topic: 'daily' }]
    })
    expect(brief(validateDictionary(file([tener(), dup, sameRank])).errors)).toEqual([
      'entries[1].id:duplicate_id',
      'entries[2].rank:duplicate_rank',
    ])
  })

  it('род: обязателен у существительного ES, запрещён у прочих (правило 5)', () => {
    const casa = { id: 'casa', lemma: 'casa', pos: 'noun', rank: 1, translations: { ru: 'дом' } }
    const result = validateDictionary(file([casa, entry((e) => (e.gender = 'm'))]))
    expect(brief(result.errors)).toEqual([
      'entries[0]:gender_required',
      'entries[1].gender:gender_not_allowed',
    ])
    const en = validateDictionary(
      file([{ id: 'house', lemma: 'house', pos: 'noun', rank: 1, translations: { ru: 'дом' } }], {
        lang: 'en',
      }),
    )
    expect(en.errors).toEqual([])
  })

  it('формы: чужой ключ, число лиц, неправильный глагол EN (правило 6)', () => {
    const es = validateDictionary(
      file([
        entry((e) => {
          e.forms.past = 'tuve'
          e.forms.present = ['tengo', 'tienes']
          e.forms.imperative = ['ten']
        }),
      ]),
    )
    expect(brief(es.errors)).toEqual([
      'entries[0].forms.present:form_persons',
      'entries[0].forms.imperative:form_persons',
      'entries[0].forms.past:unknown_key',
    ])
    const go = {
      id: 'go',
      lemma: 'go',
      pos: 'verb',
      rank: 3,
      irregular: true,
      translations: { ru: 'идти' },
      forms: { past: 'went' },
    }
    expect(brief(validateDictionary(file([go], { lang: 'en' })).errors)).toEqual([
      'entries[0].forms.participle:required',
    ])
    const adv = {
      id: 'aqui',
      lemma: 'aquí',
      pos: 'adv',
      rank: 1,
      translations: { ru: 'здесь' },
      forms: { x: 'y' },
    }
    expect(brief(validateDictionary(file([adv])).errors)).toEqual([
      'entries[0].forms:forms_not_allowed',
    ])
  })

  it('переводы: нет перевода, перевод на язык статьи (правило 7)', () => {
    const result = validateDictionary(
      file([
        entry((e) => {
          e.translations = { es: 'tener' }
          e.examples[0] = { es: 'Tengo una reserva.', topic: 'travel' }
        }),
      ]),
    )
    expect(brief(result.errors)).toEqual([
      'entries[0].translations.es:translation_own_lang',
      'entries[0].translations:no_translation',
      'entries[0].examples[0]:no_translation',
    ])
  })

  it('пара: формат и язык (правило 8)', () => {
    const bad = validateDictionary(file([entry((e) => (e.pair = 'have'))]))
    expect(brief(bad.errors)).toEqual(['entries[0].pair:bad_pair'])
    const self = validateDictionary(file([entry((e) => (e.pair = 'es:haber'))]))
    expect(brief(self.errors)).toEqual(['entries[0].pair:bad_pair'])
  })
})

describe('словарь: предупреждения', () => {
  it('пример без слова, нет примеров, нет русского перевода', () => {
    const result = validateDictionary(
      file([
        entry((e) => (e.examples[0].es = 'Una reserva para dos.')),
        { id: 'ser', lemma: 'ser', pos: 'verb', rank: 1, translations: { en: 'to be' } },
      ]),
    )
    expect(result.errors).toEqual([])
    expect(brief(result.warnings)).toEqual([
      'entries[0].examples[0]:example_without_word',
      'entries[1]:no_examples',
      'entries[1].translations:no_ru',
    ])
  })

  it('пример находит слово по форме без учёта регистра', () => {
    const result = validateDictionary(
      file([entry((e) => (e.examples[0].es = 'TENEMOS que irnos.'))]),
    )
    expect(result.warnings).toEqual([])
  })
})

describe('набор словарей', () => {
  const have = {
    format: '2lang/dictionary',
    version: 1,
    lang: 'en',
    license: 'own',
    entries: [
      {
        id: 'have',
        lemma: 'have',
        pos: 'verb',
        rank: 2,
        irregular: true,
        translations: { ru: 'иметь' },
        pair: 'es:tener',
        forms: { past: 'had', participle: 'had' },
        examples: [{ en: 'I have a reservation.', ru: 'У меня бронь.', topic: 'travel' }],
      },
    ],
  }
  const ok = (doc: unknown) => validateDictionary(doc).file!

  it('пары разрешаются между языками', () => {
    const result = validateDictionarySet([
      { name: 'es.verbs.json', file: ok(file()) },
      { name: 'en.verbs.json', file: ok(have) },
    ])
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('пара не найдена — предупреждение', () => {
    const result = validateDictionarySet([{ name: 'es.verbs.json', file: ok(file()) }])
    expect(brief(result.warnings)).toEqual(['es.verbs.json › entries[0].pair:pair_not_found'])
  })

  it('повтор id и ранга между файлами одного языка (AC-3)', () => {
    const other = file([
      entry((e) => (e.rank = 9)),
      { id: 'ser', lemma: 'ser', pos: 'verb', rank: 4, translations: { ru: 'быть' } },
    ])
    const result = validateDictionarySet([
      { name: 'es.a.json', file: ok(file()) },
      { name: 'es.b.json', file: ok(other) },
      { name: 'en.verbs.json', file: ok(have) },
    ])
    expect(brief(result.errors)).toEqual([
      'es.b.json › entries[0].id:duplicate_id',
      'es.b.json › entries[1].rank:duplicate_rank',
    ])
    expect(result.errors[0]!.params).toMatchObject({ id: 'tener', other: 'es.a.json' })
  })
})

describe('checkDictionaryFile', () => {
  it('битый JSON — строка и столбец', () => {
    expect(checkDictionaryFile('{\n "lang": }').errors[0]).toMatchObject({
      code: 'json_syntax',
      params: { line: 2, column: 10 },
    })
  })
})
