import { createRouter, createWebHistory } from '@ionic/vue-router'

import { buildRoutes } from '@/app/navigation/build-routes'
import { appTabs } from '@/app/navigation/tabs'
import { WELCOME_PATH, profileRedirect, useProfilesStore } from '@/features/profiles'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...buildRoutes(appTabs),
    { path: WELCOME_PATH, component: () => import('@/pages/welcome/WelcomePage.vue') },
    { path: '/profiles/new', component: () => import('@/pages/profile/ProfileEditPage.vue') },
    { path: '/profiles/:id/edit', component: () => import('@/pages/profile/ProfileEditPage.vue') },
    { path: '/dictionary/:lang/:id', component: () => import('@/pages/dictionary/WordPage.vue') },
    { path: '/texts/:id', component: () => import('@/pages/texts/TextPage.vue') },
    { path: '/lessons/:id', component: () => import('@/pages/lessons/LessonPage.vue') },
    { path: '/sounds/:id', component: () => import('@/pages/lessons/SoundLessonPage.vue') },
    { path: '/grammar/:id', component: () => import('@/pages/lessons/GrammarLessonPage.vue') },
    { path: '/songs/:id', component: () => import('@/pages/lessons/SongLessonPage.vue') },
    { path: '/rules', component: () => import('@/pages/lessons/RulesPage.vue') },
    { path: '/alphabet', component: () => import('@/pages/lessons/AlphabetPage.vue') },
    { path: '/rules/:id', component: () => import('@/pages/lessons/RulePage.vue') },
    { path: '/review', component: () => import('@/pages/review/ReviewPage.vue') },
    { path: '/train', component: () => import('@/pages/train/TrainPage.vue') },
    { path: '/placement/:lang', component: () => import('@/pages/placement/PlacementPage.vue') },
  ],
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/dev/')) return true
  const profiles = useProfilesStore()
  await profiles.ready()
  return profileRedirect(to.path, profiles.profiles.length > 0) ?? true
})

if (import.meta.env.DEV) {
  router.addRoute({
    path: '/dev/tokens',
    name: 'dev-tokens',
    component: () => import('@/pages/dev/TokensPage.vue'),
  })
  router.addRoute({
    path: '/dev/ui-kit',
    name: 'dev-ui-kit',
    component: () => import('@/pages/dev/UiKitPage.vue'),
  })
}
