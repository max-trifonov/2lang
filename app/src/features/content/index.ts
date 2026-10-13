// Общее для форматов контента (тексты, словарь, уроки): проблемы, разбор JSON, базовые проверки.
export { Checker, LANG_RE, fold, isObj, join, type Obj } from './check'
export {
  ERROR_CODES,
  WARNING_CODES,
  type ErrorCode,
  type Issue,
  type IssueCode,
  type IssueParams,
  type WarningCode,
} from './issues'
export { issueMessage } from './issue-message'
export { locateSyntaxError, parseJson, type ParseResult } from './parse'
