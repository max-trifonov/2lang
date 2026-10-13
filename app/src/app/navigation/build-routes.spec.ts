import { describe, expect, it } from 'vitest'

import { buildRoutes } from './build-routes'
import type { TabDescriptor } from './types'

const stub = (): Promise<unknown> => Promise.resolve({})

function tab(id: string): TabDescriptor {
  return { id, path: id, labelKey: `tabs.${id}`, icon: 'home-outline', component: stub }
}

describe('buildRoutes', () => {
  it('редиректит корень на первую вкладку', () => {
    const routes = buildRoutes([tab('home'), tab('profile')])
    const root = routes[0]
    expect(root?.path).toBe('/')
    const children = root && 'children' in root ? root.children : []
    expect(children?.[0]).toMatchObject({ path: '', redirect: '/home' })
  })

  it('бросает на дубликате id', () => {
    expect(() => buildRoutes([tab('home'), tab('home')])).toThrow(/Дублирующийся/)
  })
})
