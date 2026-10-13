// Тексты (песни и стихи), формат v1 — .flow/content-format.md, LNG-S1-001; загрузка — LNG-S1-003.
export type { PhraseDiff } from './domain/import-plan'
export type { Issue, IssueCode } from '@/features/content'
export { phraseKey } from './domain/phrase-key'
export {
  textIn,
  type Line,
  type Localized,
  type Phrase,
  type Stanza,
  type TextDoc,
  type Word,
} from './domain/types'
export { checkTextFile, validateText, type CheckResult } from './domain/validate'
export { issueMessage } from '@/features/content'
export {
  filterLibrary,
  loadBundledTexts,
  mergeLibrary,
  type LibraryFilter,
  type LibraryItem,
} from './catalog'
export { phraseCardKey, songPhraseOfDay, textPhrases, type TextPhrase } from './domain/phrases'
export { expandStanzas, findEntry, lineWords, translationOf, type ReadStanza } from './domain/read'
export type { TextRecord } from './storage'
export {
  useTextsStore,
  type ImportFile,
  type ImportOutcome,
  type ImportStatus,
  type ReplacePlan,
} from './store'
export { default as ImportResults } from './ui/ImportResults.vue'
