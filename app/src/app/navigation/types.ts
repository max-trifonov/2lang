export interface TabDescriptor {
  id: string
  path: string
  labelKey: string
  icon: string
  component: () => Promise<unknown>
}
