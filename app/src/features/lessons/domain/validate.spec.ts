import { describe, expect, it } from 'vitest'

import type { Issue } from '@/features/content'
import type { DictionaryFile } from '@/features/dictionary'

import { checkLessonFile, validateLesson, validateLessonSet } from './validate'
import type { Lesson } from './types'

function lesson(patch: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    format: '2lang/lesson',
    version: 1,
    id: 'es-travel-01',
    lang: 'es',
    kind: 'words',
    topic: 'travel',
    order: 1,
    title: { ru: 'В отеле' },
    words: ['tener', 'reserva', 'aquí'],
    phrase: { es: 'Tengo una reserva a nombre de Ana.', ru: 'У меня бронь на имя Анны.' },
    rule: {
      text: { ru: 'tener — «иметь».' },
      examples: [{ es: 'Tengo tiempo.', ru: 'У меня есть время.' }],
    },
    exercises: [
      { type: 'fill', es: '___ una reserva.', answer: 'Tengo', ru: 'У меня бронь.' },
      {
        type: 'build',
        es: 'Tengo una reserva aquí.',
        ru: 'У меня здесь бронь.',
        extra: ['tienes'],
      },
      { type: 'translate', ru: 'У меня нет брони.', answer: ['No tengo reserva.'] },
    ],
    ...patch,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
const edit = (fn: (d: any) => void) => {
  const d = structuredClone(lesson())
  fn(d)
  return d
}

const brief = (issues: Issue[]) => issues.map((i) => `${i.path}:${i.code}`)

describe('урок: файл', () => {
  it('корректный урок — без проблем', () => {
    const result = validateLesson(lesson())
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.lesson?.id).toBe('es-travel-01')
  })

  it.each([
    ['чужой формат', lesson({ format: '2lang/text' }), 'format:bad_value'],
    ['незнакомый вид', lesson({ kind: 'video' }), 'kind:bad_value'],
    ['тема', lesson({ topic: 'food' }), 'topic:bad_value'],
    ['место 0', lesson({ order: 0 }), 'order:bad_value'],
    ['id не slug', lesson({ id: 'ES travel' }), 'id:bad_slug'],
    ['нет слов', lesson({ words: [] }), 'words:empty'],
    ['нет фразы', edit((d) => delete d.phrase), 'phrase:required'],
    ['опечатка', lesson({ excercises: [] }), 'excercises:unknown_key'],
    ['повтор слова', lesson({ words: ['tener', 'tener', 'aquí'] }), 'words[1]:duplicate_word'],
    ['фраза без оригинала', edit((d) => delete d.phrase.es), 'phrase:missing_original'],
    ['фраза без перевода', edit((d) => delete d.phrase.ru), 'phrase:no_translation'],
    [
      'пример правила без перевода',
      edit((d) => delete d.rule.examples[0].ru),
      'rule.examples[0]:no_translation',
    ],
    ['правило без текста', edit((d) => delete d.rule.text), 'rule.text:required'],
    ['тип упражнения', edit((d) => (d.exercises[0].type = 'match')), 'exercises[0].type:bad_value'],
    [
      'fill без пропуска',
      edit((d) => (d.exercises[0].es = 'Tengo una reserva.')),
      'exercises[0]:gap_count',
    ],
    [
      'fill с двумя пропусками',
      edit((d) => (d.exercises[0].es = '___ una ___.')),
      'exercises[0]:gap_count',
    ],
    ['fill без ответа', edit((d) => delete d.exercises[0].answer), 'exercises[0].answer:required'],
    ['build без перевода', edit((d) => delete d.exercises[1].ru), 'exercises[1]:no_translation'],
    ['translate без задания', edit((d) => delete d.exercises[2].ru), 'exercises[2]:no_translation'],
    [
      'translate на языке урока',
      edit((d) => (d.exercises[2].es = 'x')),
      'exercises[2].es:translation_own_lang',
    ],
    [
      'translate без ответа',
      edit((d) => delete d.exercises[2].answer),
      'exercises[2].answer:required',
    ],
    ['ссылка на себя', lesson({ requires: ['es-travel-01'] }), 'requires[0]:self_require'],
  ])('%s', (_name, doc, expected) => {
    const result = validateLesson(doc)
    expect(brief(result.errors)).toContain(expected)
    expect(result.lesson).toBeNull()
  })

  it('битый JSON — строка и столбец', () => {
    expect(checkLessonFile('{\n "id": ,').errors[0]).toMatchObject({
      code: 'json_syntax',
      params: { line: 2, column: 8 },
    })
  })

  it('нет русского у фразы — предупреждение', () => {
    const result = validateLesson(
      edit((d) => (d.phrase = { es: d.phrase.es, en: 'I have a booking.' })),
    )
    expect(result.errors).toEqual([])
    expect(brief(result.warnings)).toEqual(['phrase:no_ru'])
  })
})

const dict: DictionaryFile = {
  format: '2lang/dictionary',
  version: 1,
  lang: 'es',
  license: 'own',
  entries: [
    {
      id: 'tener',
      lemma: 'tener',
      pos: 'verb',
      rank: 1,
      translations: { ru: 'иметь' },
      forms: { present: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'] },
    },
    {
      id: 'reserva',
      lemma: 'reserva',
      pos: 'noun',
      rank: 1,
      gender: 'f',
      translations: { ru: 'бронь' },
    },
    { id: 'aquí', lemma: 'aquí', pos: 'adv', rank: 1, translations: { ru: 'здесь' } },
    { id: 'casa', lemma: 'casa', pos: 'noun', rank: 2, gender: 'f', translations: { ru: 'дом' } },
  ],
}

const named = (doc: Record<string, unknown>, name = `${doc.id as string}.json`) => ({
  name,
  lesson: validateLesson(doc).lesson as Lesson,
})

describe('набор уроков со словарём', () => {
  it('корректный набор — без проблем', () => {
    const result = validateLessonSet(
      [
        named(lesson()),
        named(lesson({ id: 'es-travel-02', order: 2, requires: ['es-travel-01'] })),
      ],
      [dict],
    )
    expect(result).toEqual({ errors: [], warnings: [] })
  })

  it('повтор id, места в пути, неизвестная предпосылка, имя файла (правило 5)', () => {
    const result = validateLessonSet(
      [
        named(lesson()),
        named(lesson(), 'copy.json'),
        named(lesson({ id: 'es-travel-03', requires: ['es-travel-99'] })),
        named(lesson({ id: 'es-it-01', topic: 'it' })),
      ],
      [dict],
    )
    expect(brief(result.errors)).toEqual([
      'copy.json › id:duplicate_id',
      'copy.json › id:file_name',
      'es-travel-03.json › order:duplicate_order',
      'es-travel-03.json › requires[0]:unknown_lesson',
    ])
  })

  it('слово не из словаря (правило 6)', () => {
    const result = validateLessonSet(
      [named(lesson({ words: ['tener', 'reserva', 'hotel'] }))],
      [dict],
    )
    expect(brief(result.errors)).toEqual(['es-travel-01.json › words[2]:word_not_in_dictionary'])
  })

  it('состав урока и ответ fill — предупреждения', () => {
    const result = validateLessonSet(
      [
        named(
          edit((d) => {
            d.words = ['reserva', 'casa']
            d.exercises[0].answer = 'Quiero'
          }),
        ),
      ],
      [dict],
    )
    expect(result.errors).toEqual([])
    expect(brief(result.warnings)).toEqual([
      'es-travel-01.json › words:lesson_word_count',
      'es-travel-01.json › words:lesson_composition',
      'es-travel-01.json › exercises[0].answer:fill_answer_unknown',
    ])
    expect(result.warnings[1]!.params).toEqual({ missing: 'verb, adj/adv' })
  })

  it('ответ fill — форма слова урока без учёта регистра', () => {
    const result = validateLessonSet(
      [named(edit((d) => (d.exercises[0].answer = ['TIENES', 'tengo'])))],
      [dict],
    )
    expect(result.warnings).toEqual([])
  })
})

function sound(patch: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    format: '2lang/lesson',
    version: 1,
    id: 'es-sound-03',
    lang: 'es',
    kind: 'sound',
    code: 'ES-P3',
    order: 3,
    title: { ru: 'c, z, qu' },
    letters: [{ letter: 'ñ', name: 'eñe', ipa: 'ɲ', audio: 'audio/es/letters/n-tilde.mp3' }],
    rules: [
      {
        id: 'es-c-before-e-i',
        title: { ru: 'c перед e, i' },
        text: { ru: 'c перед e и i — [θ] / [s].' },
        ipa: 'θ / s',
        examples: [{ es: 'cena', ru: 'ужин' }, { es: 'cine' }],
      },
    ],
    exercises: [
      {
        type: 'pairs',
        items: [
          ['casa', 'caza'],
          ['pero', 'perro'],
        ],
      },
      { type: 'read', items: ['cena'] },
      { type: 'dictation', items: ['ciudad'] },
      { type: 'spell', items: ['ana.garcia@mail.com'] },
    ],
    ...patch,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
const editSound = (fn: (d: any) => void) => {
  const d = structuredClone(sound())
  fn(d)
  return d
}

describe('урок звучания: файл', () => {
  it('корректный урок — без проблем; topic не нужен', () => {
    const result = validateLesson(sound())
    expect(brief(result.errors)).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it.each([
    ['topic у звучания', sound({ topic: 'travel' }), 'topic:topic_not_allowed'],
    [
      'нет ни букв, ни правил',
      editSound((d) => (delete d.letters, delete d.rules)),
      ':sound_empty',
    ],
    [
      'упражнение чужого вида',
      editSound((d) => (d.exercises[0] = { type: 'fill', es: '___', answer: 'x' })),
      'exercises[0].type:bad_value',
    ],
    [
      'пара из одного слова',
      editSound((d) => (d.exercises[0].items[0] = ['casa'])),
      'exercises[0].items[0]:pair_size',
    ],
    [
      'пара из одинаковых',
      editSound((d) => (d.exercises[0].items[0] = ['casa', 'Casa'])),
      'exercises[0].items[0]:pair_size',
    ],
    ['пустые items', editSound((d) => (d.exercises[1].items = [])), 'exercises[1].items:empty'],
    [
      'правило без примеров',
      editSound((d) => (d.rules[0].examples = [])),
      'rules[0].examples:empty',
    ],
    ['правило без id', editSound((d) => delete d.rules[0].id), 'rules[0].id:required'],
    [
      'повтор id правила',
      editSound((d) => d.rules.push({ ...d.rules[0] })),
      'rules[1].id:duplicate_rule',
    ],
    [
      'кривой путь аудио',
      editSound((d) => (d.letters[0].audio = '/tmp/n.wav')),
      'letters[0].audio:bad_audio',
    ],
    ['буква без названия', editSound((d) => delete d.letters[0].name), 'letters[0].name:required'],
    [
      'пример правила без оригинала',
      editSound((d) => (d.rules[0].examples[1] = { ru: 'кино' })),
      'rules[0].examples[1]:missing_original',
    ],
    ['поля урока слов у звучания', sound({ words: ['tener'] }), 'words:unknown_key'],
  ])('%s', (_name, doc, expected) => {
    const result = validateLesson(doc)
    expect(brief(result.errors)).toContain(expected)
    expect(result.lesson).toBeNull()
  })

  it('урок слов без topic — ошибка (AC-4)', () => {
    expect(brief(validateLesson(edit((d) => delete d.topic)).errors)).toEqual(['topic:required'])
  })
})

describe('набор: звучание и словарь', () => {
  const withRules: DictionaryFile = {
    ...dict,
    entries: [
      { ...dict.entries[0]!, rules: ['es-c-before-e-i', 'es-h-silent'] },
      ...dict.entries.slice(1),
    ],
  }

  it('трек звучания отдельно от тем слов: одинаковый order не конфликтует', () => {
    const result = validateLessonSet([named(lesson()), named(sound({ order: 1 }))], [dict])
    expect(result).toEqual({ errors: [], warnings: [] })
  })

  it('повтор id правила между уроками; ссылка словаря на неизвестное правило (AC-3)', () => {
    const result = validateLessonSet(
      [named(sound()), named(sound({ id: 'es-sound-04', order: 4 }))],
      [withRules],
    )
    expect(brief(result.errors)).toEqual(['es-sound-04.json › rules[0].id:duplicate_rule'])
    expect(brief(result.warnings)).toEqual(['dictionary es › tener › rules[1]:rule_not_found'])
  })
})

describe('набор: трек звучания', () => {
  it('два урока звучания с одним order в языке — повтор места', () => {
    const result = validateLessonSet(
      [named(sound()), named(editSound((d) => ((d.id = 'es-sound-x'), (d.rules[0].id = 'es-x'))))],
      [dict],
    )
    expect(brief(result.errors)).toEqual(['es-sound-x.json › order:duplicate_order'])
    expect(result.errors[0]!.params).toMatchObject({ topic: 'sound' })
  })
})

function grammar(patch: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    format: '2lang/lesson',
    version: 1,
    id: 'es-grammar-06',
    lang: 'es',
    kind: 'grammar',
    code: 'ES-6',
    order: 6,
    title: { ru: 'tener que + инфинитив' },
    words: ['tener'],
    pattern: [
      { es: 'Tengo que trabajar mañana.', ru: 'Мне нужно работать завтра.' },
      { es: 'Tenemos que hacer un deploy.', ru: 'Нам нужно сделать деплой.' },
      { es: 'Tienes que ir al aeropuerto.', ru: 'Тебе нужно ехать в аэропорт.' },
    ],
    rule: {
      formula: 'tener que + инфинитив',
      text: { ru: 'tener + que + глагол.' },
      table: {
        head: ['', 'tener que'],
        rows: [
          ['yo', 'tengo que'],
          ['tú', 'tienes que'],
        ],
      },
      timeline: [{ from: 'now', until: 'future', label: { ru: 'сейчас или впереди' } }],
    },
    bridge: [
      {
        lang: 'en',
        formula: 'have to + V',
        examples: [{ en: 'I have to work.', ru: 'Мне нужно работать.' }],
        note: { ru: '1:1' },
      },
    ],
    exercises: [
      {
        type: 'transform',
        es: 'Tengo que trabajar hoy.',
        into: [
          { form: 'negative', answer: 'No tengo que trabajar hoy.' },
          { form: 'question', answer: ['¿Tengo que trabajar hoy?'] },
        ],
      },
      {
        type: 'choose',
        es: 'Nosotros ___ que salir.',
        options: ['tengo', 'tenemos'],
        answer: 'tenemos',
        ru: 'Нам нужно выйти.',
      },
      { type: 'fill', es: '___ que pagar.', answer: 'Tengo' },
      { type: 'build', es: 'Tenemos que hacer un deploy.', ru: 'Нам нужно сделать деплой.' },
      {
        type: 'compose',
        prompt: { ru: 'Что вам нужно сделать завтра?' },
        template: '… tengo que …',
        sample: 'Mañana tengo que ir.',
      },
    ],
    ...patch,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- негативные фикстуры ломают узлы произвольно
const editGrammar = (fn: (d: any) => void) => {
  const d = structuredClone(grammar())
  fn(d)
  return d
}

describe('урок грамматики: файл', () => {
  it('корректный урок — без проблем', () => {
    const result = validateLesson(grammar())
    expect(brief(result.errors)).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it.each([
    ['нет паттерна', editGrammar((d) => delete d.pattern), 'pattern:required'],
    ['нет правила', editGrammar((d) => delete d.rule), 'rule:required'],
    ['правило без текста', editGrammar((d) => delete d.rule.text), 'rule.text:required'],
    [
      'пример паттерна без перевода',
      editGrammar((d) => delete d.pattern[0].ru),
      'pattern[0]:no_translation',
    ],
    [
      'строка таблицы не той ширины',
      editGrammar((d) => d.rule.table.rows.push(['él'])),
      'rule.table.rows[2]:table_shape',
    ],
    ['пустая шапка таблицы', editGrammar((d) => (d.rule.table.head = [])), 'rule.table.head:empty'],
    [
      'линия времени',
      editGrammar((d) => (d.rule.timeline[0].from = 'yesterday')),
      'rule.timeline[0].from:bad_value',
    ],
    [
      'мост на язык урока',
      editGrammar((d) => (d.bridge[0].lang = 'es')),
      'bridge[0].lang:bad_value',
    ],
    [
      'пример моста без оригинала',
      editGrammar((d) => (d.bridge[0].examples[0] = { ru: 'x' })),
      'bridge[0].examples[0]:missing_original',
    ],
    [
      'трансформер без форм',
      editGrammar((d) => (d.exercises[0].into = [])),
      'exercises[0].into:empty',
    ],
    [
      'повтор формы',
      editGrammar((d) => d.exercises[0].into.push({ form: 'negative', answer: 'x' })),
      'exercises[0].into[2].form:duplicate_form',
    ],
    [
      'незнакомая форма',
      editGrammar((d) => (d.exercises[0].into[0].form = 'conditional')),
      'exercises[0].into[0].form:bad_value',
    ],
    [
      'трансформер без утверждения',
      editGrammar((d) => delete d.exercises[0].es),
      'exercises[0]:missing_original',
    ],
    [
      'choose: ответ не из вариантов',
      editGrammar((d) => (d.exercises[1].answer = 'tienen')),
      'exercises[1].answer:answer_not_in_options',
    ],
    [
      'choose: один вариант',
      editGrammar((d) => (d.exercises[1].options = ['tenemos'])),
      'exercises[1].options:options_count',
    ],
    [
      'choose: повтор варианта',
      editGrammar((d) => (d.exercises[1].options = ['tenemos', 'Tenemos'])),
      'exercises[1].options[1]:duplicate_option',
    ],
    [
      'choose: без пропуска',
      editGrammar((d) => (d.exercises[1].es = 'Nosotros tenemos que salir.')),
      'exercises[1]:gap_count',
    ],
    [
      'fill без пропуска',
      editGrammar((d) => (d.exercises[2].es = 'Tengo que pagar.')),
      'exercises[2]:gap_count',
    ],
    [
      'compose без образца',
      editGrammar((d) => delete d.exercises[4].sample),
      'exercises[4].sample:required',
    ],
    [
      'compose без задания',
      editGrammar((d) => delete d.exercises[4].prompt),
      'exercises[4].prompt:required',
    ],
    [
      'упражнение звучания',
      editGrammar((d) => (d.exercises[0] = { type: 'pairs', items: [['a', 'b']] })),
      'exercises[0].type:bad_value',
    ],
    ['topic у грамматики', grammar({ topic: 'it' }), 'topic:topic_not_allowed'],
    ['фраза у грамматики', grammar({ phrase: { es: 'x', ru: 'y' } }), 'phrase:unknown_key'],
  ])('%s', (_name, doc, expected) => {
    const result = validateLesson(doc)
    expect(brief(result.errors)).toContain(expected)
    expect(result.lesson).toBeNull()
  })

  it('паттерн из 2 примеров — предупреждение', () => {
    const result = validateLesson(editGrammar((d) => d.pattern.pop()))
    expect(result.errors).toEqual([])
    expect(brief(result.warnings)).toEqual(['pattern:pattern_size'])
  })
})

describe('набор: грамматика', () => {
  it('слова-условие проверяются по словарю, состав — нет (AC-3)', () => {
    expect(validateLessonSet([named(grammar())], [dict])).toEqual({ errors: [], warnings: [] })
    const result = validateLessonSet([named(grammar({ words: ['tener', 'deber'] }))], [dict])
    expect(brief(result.errors)).toEqual(['es-grammar-06.json › words[1]:word_not_in_dictionary'])
    expect(result.warnings).toEqual([])
  })
})
