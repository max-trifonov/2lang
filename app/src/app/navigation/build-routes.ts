import type { RouteComponent, RouteRecordRaw } from 'vue-router'

import type { TabDescriptor } from './types'

const FALLBACK_PATH = '/:pathMatch(.*)*'

export function buildRoutes(tabs: readonly TabDescriptor[]): RouteRecordRaw[] {
  assertUniqueIds(tabs)

  const first = tabs[0]
  if (!first) {
    return [{ path: FALLBACK_PATH, redirect: '/' }]
  }

  const firstTabPath = `/${first.path}`

  return [
    {
      path: '/',
      component: () => import('@/app/layouts/TabsLayout.vue'),
      children: [
        { path: '', redirect: firstTabPath },
        ...tabs.map<RouteRecordRaw>((tab) => ({
          path: tab.path,
          name: tab.id,
          component: tab.component as () => Promise<RouteComponent>,
        })),
      ],
    },
    { path: FALLBACK_PATH, redirect: firstTabPath },
  ]
}

function assertUniqueIds(tabs: readonly TabDescriptor[]): void {
  const seen = new Set<string>()
  for (const tab of tabs) {
    if (seen.has(tab.id)) {
      throw new Error(`Дублирующийся идентификатор вкладки: ${tab.id}`)
    }
    seen.add(tab.id)
  }
}
