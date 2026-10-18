export interface TabDescriptor {
  id: string
  path: string
  labelKey: string
  /** Иконка из `ionicons/icons` (именованный импорт) — так в бандл попадают только нужные. */
  icon: string
  component: () => Promise<unknown>
}
