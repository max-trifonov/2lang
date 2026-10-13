import { describe, expect, it } from 'vitest'

import { wordForms } from './forms'

describe('wordForms', () => {
  it('глагол ES: времена по лицам в порядке, императив — 5 лиц, герундий и причастие отдельно', () => {
    const f = wordForms({
      forms: {
        participle: 'tenido',
        imperative: ['ten', 'tenga', 'tengamos', 'tened', 'tengan'],
        present: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
        gerund: 'teniendo',
      },
    })
    expect(f.tenses.map((t) => t.key)).toEqual(['present', 'imperative'])
    expect(f.tenses[0]!.rows[2]).toEqual({ person: 'él / ella / usted', form: 'tiene' })
    expect(f.tenses[1]!.rows[1]).toEqual({ person: 'usted', form: 'tenga' })
    expect(f.singles).toEqual([
      { key: 'participle', value: 'tenido' },
      { key: 'gerund', value: 'teniendo' },
    ])
  })

  it('глагол EN — подписанные формы в учебном порядке', () => {
    const f = wordForms({ forms: { ing: 'going', past: 'went', s: 'goes', participle: 'gone' } })
    expect(f.tenses).toEqual([])
    expect(f.singles.map((s) => s.key)).toEqual(['s', 'past', 'participle', 'ing'])
  })

  it('незнакомая форма не теряется; нет форм — пусто', () => {
    expect(wordForms({ forms: { plural: 'casas', dual: 'x' } }).singles.map((s) => s.key)).toEqual([
      'plural',
      'dual',
    ])
    expect(wordForms({})).toEqual({ tenses: [], singles: [] })
  })
})
