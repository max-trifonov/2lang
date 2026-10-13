import type { TabDescriptor } from './types'

/** Единственный каталог нижней навигации. Скилл переписывает состав при копировании. */
export const appTabs: readonly TabDescriptor[] = [
  {
    id: 'home',
    path: 'home',
    labelKey: 'tabs.home',
    icon: 'home-outline',
    component: () => import('@/pages/home/HomePage.vue'),
  },
  {
    id: 'lessons',
    path: 'lessons',
    labelKey: 'tabs.lessons',
    icon: 'school-outline',
    component: () => import('@/pages/lessons/LessonsPage.vue'),
  },
  {
    id: 'texts',
    path: 'texts',
    labelKey: 'tabs.texts',
    icon: 'musical-notes-outline',
    component: () => import('@/pages/texts/TextsPage.vue'),
  },
  {
    id: 'dictionary',
    path: 'dictionary',
    labelKey: 'tabs.dictionary',
    icon: 'book-outline',
    component: () => import('@/pages/dictionary/DictionaryPage.vue'),
  },
  {
    id: 'profile',
    path: 'profile',
    labelKey: 'tabs.profile',
    icon: 'person-outline',
    component: () => import('@/pages/profile/ProfilePage.vue'),
  },
]
