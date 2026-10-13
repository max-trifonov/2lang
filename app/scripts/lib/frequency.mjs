// Частотный каркас словаря из wordhoard (LNG-S1-012, D-24): CSV источника → топ-списки
// по частям речи. Алиасы и стоп-лист — данные конфига content/frequency/config.json,
// выверяются автором; каждое решение импорта попадает в отчёт.

/** Части речи UD → списки словаря; AUX — к глаголам (be, can, ser, estar). */
export const POS_MAP = { VERB: 'verb', AUX: 'verb', NOUN: 'noun', ADJ: 'adj', ADV: 'adv' }

/** Правило id статьи словаря (D-19): строчные буквы любого алфавита, цифры, дефис. */
const WORD_ID_RE = /^[\p{Ll}\p{Lo}\p{N}]+(-[\p{Ll}\p{Lo}\p{N}]+)*$/u

/** Минимальный разбор CSV (RFC 4180): кавычки, экранирование "", запятые в полях. */
export function parseCsv(text) {
  const records = []
  let field = ''
  let record = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      record.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      record.push(field)
      if (record.some((f) => f !== '')) records.push(record)
      record = []
      field = ''
    } else field += ch
  }
  if (field !== '' || record.length) {
    record.push(field)
    records.push(record)
  }
  const [head, ...rows] = records
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])))
}

/** Значение по ключу «часть_речи:лемма», иначе по «лемма». */
const lookup = (table, pos, lemma) => table?.[`${pos}:${lemma}`] ?? table?.[lemma]

/**
 * Топ-списки языка. Порядок шагов важен: алиас → стоп-лист → id → слияние дублей →
 * род (ES) → отбор. Ранг — по порядку в источнике (frequency_rank), внутри части речи.
 */
export function buildLists(rows, lang, config) {
  const report = []
  const note = (lemma, pos, sourceRank, action, detail = '') =>
    report.push({ lemma, pos, sourceRank, action, detail })
  const byPos = { verb: [], noun: [], adj: [], adv: [] }
  const seen = new Map()

  const sorted = [...rows].sort((a, b) => Number(a.frequency_rank) - Number(b.frequency_rank))
  for (const row of sorted) {
    const pos = POS_MAP[row.pos]
    if (!pos) continue
    const sourceRank = Number(row.frequency_rank)
    const original = row.lemma.normalize('NFC').trim()
    const alias = lookup(config.aliases?.[lang], pos, original)
    const lemma = alias ?? original
    if (alias) note(original, pos, sourceRank, 'alias', alias)

    const reason = lookup(config.deny?.[lang], pos, lemma)
    if (reason) {
      note(lemma, pos, sourceRank, 'deny', reason)
      continue
    }
    if (!WORD_ID_RE.test(lemma)) {
      note(lemma, pos, sourceRank, 'bad-id')
      continue
    }
    const key = `${pos}:${lemma}`
    const first = seen.get(key)
    if (first) {
      // Дубль (VERB/AUX, алиас на существующую лемму): остаётся лучший ранг, род — первый известный.
      if (!first.gender && row.gender) first.gender = row.gender
      note(original, pos, sourceRank, 'merge', lemma)
      continue
    }
    const entry = { lemma, gender: row.gender ?? '', sourceRank, cefr: row.cefr_estimate ?? '' }
    seen.set(key, entry)
    byPos[pos].push(entry)
  }

  const lists = {}
  for (const [pos, entries] of Object.entries(byPos)) {
    const size = config.sizes[pos]
    const picked = []
    for (const e of entries) {
      if (picked.length >= size) break
      if (lang === 'es' && pos === 'noun' && !e.gender) {
        note(e.lemma, pos, e.sourceRank, 'no-gender')
        continue
      }
      picked.push(e)
    }
    lists[pos] = picked.map((e, i) => ({ rank: i + 1, ...e }))
  }
  // Поправки рода — после отбора: источник ошибается в роде (fin/f) и не знает «mf» (estudiante).
  for (const e of lists.noun) {
    const fixed = config.genders?.[lang]?.[e.lemma]
    if (fixed && fixed !== e.gender) {
      note(e.lemma, 'noun', e.sourceRank, 'gender', `${e.gender || '—'} → ${fixed}`)
      e.gender = fixed
    }
  }
  return { lists, report }
}

export function toCsv(list) {
  const lines = list.map((e) => [e.rank, e.lemma, e.gender, e.sourceRank, e.cefr].join(','))
  return ['rank,lemma,gender,source_rank,cefr', ...lines].join('\n') + '\n'
}

/** Отчёт для выверки автором: что и почему не вошло или изменилось. */
export function toReport(lang, report) {
  const titles = {
    alias: 'Алиасы (форма → лемма)',
    merge: 'Слиты дубли',
    deny: 'Стоп-лист',
    'no-gender': 'Существительные без рода (не вошли)',
    'bad-id': 'Лемма не по правилу id (не вошла)',
    gender: 'Поправки рода',
  }
  const out = [`# Импорт частотности — ${lang}`, '']
  for (const [action, title] of Object.entries(titles)) {
    const items = report.filter((r) => r.action === action)
    if (!items.length) continue
    out.push(`## ${title}: ${items.length}`, '')
    for (const r of items.slice(0, 200)) {
      out.push(
        `- ${r.lemma} (${r.pos}, ранг источника ${r.sourceRank})${r.detail ? ` → ${r.detail}` : ''}`,
      )
    }
    if (items.length > 200) out.push(`- … ещё ${items.length - 200}`)
    out.push('')
  }
  return out.join('\n')
}
