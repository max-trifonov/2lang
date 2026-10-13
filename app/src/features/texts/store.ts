import { defineStore } from 'pinia'
import { ref } from 'vue'

import { appDb } from '@/db'

import {
  MAX_FILE_BYTES,
  planImport,
  tooLargePlan,
  type ImportPlan,
  type PhraseDiff,
} from './domain/import-plan'
import type { Issue } from '@/features/content'
import { idbTextRepository, type TextRecord, type TextRepository } from './storage'

/** То, что нужно от файла; `File` из `<input type="file">` подходит как есть. */
export interface ImportFile {
  name: string
  size: number
  text(): Promise<string>
}

export type ReplacePlan = Extract<ImportPlan, { kind: 'replace' }>

export type ImportStatus = 'added' | 'replaced' | 'unchanged' | 'declined' | 'rejected' | 'failed'

export interface ImportOutcome {
  fileName: string
  status: ImportStatus
  /** Название на языке оригинала, если файл разобран. */
  title?: string | undefined
  errors: Issue[]
  warnings: Issue[]
  phrases?: PhraseDiff
}

export interface ImportOptions {
  /** Замена текста с тем же id — только после явного «да» (AC-4). */
  confirmReplace: (plan: ReplacePlan, fileName: string) => Promise<boolean>
  addedBy: string | null
}

export const useTextsStore = defineStore('texts', () => {
  let repository: TextRepository | null = null
  let now = () => new Date()
  const repo = () => (repository ??= idbTextRepository(appDb))

  const texts = ref<TextRecord[]>([])
  const loaded = ref(false)
  let loading: Promise<void> | null = null

  /** Подменить хранилище и часы (тесты) — до первого обращения. */
  function configure(deps: { repository?: TextRepository; now?: () => Date }): void {
    if (deps.repository) repository = deps.repository
    if (deps.now) now = deps.now
  }

  function sort(list: TextRecord[]): TextRecord[] {
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  function ready(): Promise<void> {
    loading ??= repo()
      .list()
      .then((list) => {
        texts.value = sort(list)
      })
      .finally(() => {
        loaded.value = true
      })
    return loading
  }

  const find = (id: string) => texts.value.find((r) => r.id === id)

  async function importOne(file: ImportFile, options: ImportOptions): Promise<ImportOutcome> {
    const base = { fileName: file.name, errors: [] as Issue[], warnings: [] as Issue[] }
    let plan: ImportPlan
    try {
      plan =
        file.size > MAX_FILE_BYTES
          ? tooLargePlan(file.size)
          : planImport(await file.text(), (id) => find(id)?.doc)
    } catch {
      return { ...base, status: 'failed' } // файл не прочитался (удалён, нет доступа)
    }
    if (plan.kind === 'invalid') {
      return { ...base, errors: plan.errors, warnings: plan.warnings, status: 'rejected' }
    }

    const title = plan.text.title[plan.text.lang]
    const result = { ...base, title, warnings: plan.warnings }
    if (plan.kind === 'unchanged') return { ...result, status: 'unchanged' }
    if (plan.kind === 'replace' && !(await options.confirmReplace(plan, file.name))) {
      return { ...result, status: 'declined', phrases: plan.phrases }
    }

    const stamp = now().toISOString()
    const record: TextRecord = {
      id: plan.text.id,
      doc: plan.text,
      addedAt: find(plan.text.id)?.addedAt ?? stamp,
      updatedAt: stamp,
      addedBy: options.addedBy,
    }
    try {
      await repo().put(record)
    } catch {
      return { ...result, status: 'failed' }
    }
    texts.value = sort([...texts.value.filter((r) => r.id !== record.id), record])
    return plan.kind === 'replace'
      ? { ...result, status: 'replaced', phrases: plan.phrases }
      : { ...result, status: 'added' }
  }

  /** По очереди: второй файл с тем же id в одной пачке уже видит первый. */
  async function importFiles(
    files: ImportFile[],
    options: ImportOptions,
  ): Promise<ImportOutcome[]> {
    await ready()
    const outcomes: ImportOutcome[] = []
    for (const file of files) outcomes.push(await importOne(file, options))
    return outcomes
  }

  return { texts, loaded, configure, ready, importFiles }
})
