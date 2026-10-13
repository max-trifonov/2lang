// Проблема = код + путь + параметры (D-2 задачи LNG-S1-001): текст сообщения
// собирает UI из i18n `texts.issue.<code>`, домен языка интерфейса не знает.

export const ERROR_CODES = [
  'json_syntax',
  'file_too_large',
  'not_object',
  'required',
  'unknown_key',
  'wrong_type',
  'empty',
  'bad_value',
  'bad_slug',
  'bad_lang',
  'bad_url',
  'duplicate_tag',
  'missing_original',
  'phrase_no_translation',
  'phrase_not_in_line',
  'word_not_in_line',
  'stanza_lines_and_ref',
  'stanza_no_content',
  'ref_unknown',
  'duplicate_stanza_id',
  // словарь — LNG-S1-007
  'bad_word_id',
  'duplicate_id',
  'duplicate_rank',
  'gender_required',
  'gender_not_allowed',
  'forms_not_allowed',
  'form_persons',
  'no_translation',
  'translation_own_lang',
  'bad_pair',
  // уроки — LNG-S1-008
  'duplicate_word',
  'gap_count',
  'duplicate_order',
  'unknown_lesson',
  'self_require',
  'word_not_in_dictionary',
  'file_name',
  // звучание — LNG-S1-009
  'topic_not_allowed',
  'sound_empty',
  'duplicate_rule',
  'pair_size',
  'bad_audio',
  // грамматика — LNG-S1-010
  'table_shape',
  'duplicate_form',
  'answer_not_in_options',
  'duplicate_option',
  'options_count',
] as const

export const WARNING_CODES = [
  'line_no_translation',
  'line_missing_langs',
  // словарь — LNG-S1-007
  'pair_not_found',
  'example_without_word',
  'no_examples',
  'no_ru',
  // уроки — LNG-S1-008
  'lesson_word_count',
  'lesson_composition',
  'fill_answer_unknown',
  // звучание — LNG-S1-009
  'rule_not_found',
  // грамматика — LNG-S1-010
  'pattern_size',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]
export type WarningCode = (typeof WARNING_CODES)[number]
export type IssueCode = ErrorCode | WarningCode

export type IssueParams = Record<string, string | number>

export interface Issue {
  severity: 'error' | 'warning'
  code: IssueCode
  /** Путь в нотации `stanzas[0].lines[2].phrases[0]`, индексы с нуля; '' — весь файл. */
  path: string
  params: IssueParams
}
