// Словарь, формат v1 — .flow/dictionary-format.md, LNG-S1-007; экран — LNG-S1-014.
export {
  LISTS,
  article,
  byList,
  keyOf,
  search,
  searchKey,
  type CatalogEntry,
  type ListId,
} from './catalog'
export {
  DICT_POS,
  TOPICS,
  wordKey,
  type DictionaryFile,
  type DictPos,
  type Entry,
  type Topic,
} from './domain/types'
export {
  checkDictionaryFile,
  validateDictionary,
  validateDictionarySet,
  type DictCheckResult,
  type NamedDictionary,
} from './domain/validate'
export { audioKey, canHearWords, say, wordAudioUrl } from './audio'
export { wordForms, type TenseTable, type WordForms } from './forms'
export { loadLanguage } from './loader'
export {
  useWordStatusStore,
  type WordStatus,
  type WordStatusRecord,
  type WordStatusSource,
} from './known'
export { useSavedWordsStore, type SavedWord } from './saved'
export { default as SpeakButton } from './ui/SpeakButton.vue'
export { default as WordArticle } from './ui/WordArticle.vue'
