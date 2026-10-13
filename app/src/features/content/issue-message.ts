import type { Issue } from './issues'

type Translate = (key: string, params?: Record<string, unknown>) => string

/** Текст проблемы на языке интерфейса: `issueMessage(issue, t)` из `useI18n()`. */
export function issueMessage(issue: Issue, t: Translate): string {
  const { expected, ...params } = issue.params
  return t(`content.issue.${issue.code}`, {
    ...params,
    ...(expected === undefined ? {} : { expected: t(`content.type.${expected}`) }),
  })
}
