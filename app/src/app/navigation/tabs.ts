import {
  bookOutline,
  homeOutline,
  musicalNotesOutline,
  personOutline,
  schoolOutline,
} from 'ionicons/icons'

import type { TabDescriptor } from './types'

/** Единственный каталог нижней навигации. Скилл переписывает состав при копировании. */
export const appTabs: readonly TabDescriptor[] = [
  {
    id: 'home',
    path: 'home',
    labelKey: 'tabs.home',
    icon: homeOutline,
    component: () => import('@/pages/home/HomePage.vue'),
  },
  {
    id: 'lessons',
    path: 'lessons',
    labelKey: 'tabs.lessons',
    icon: schoolOutline,
    component: () => import('@/pages/lessons/LessonsPage.vue'),
  },
  {
    id: 'texts',
    path: 'texts',
    labelKey: 'tabs.texts',
    icon: musicalNotesOutline,
    component: () => import('@/pages/texts/TextsPage.vue'),
  },
  {
    id: 'dictionary',
    path: 'dictionary',
    labelKey: 'tabs.dictionary',
    icon: bookOutline,
    component: () => import('@/pages/dictionary/DictionaryPage.vue'),
  },
  {
    id: 'profile',
    path: 'profile',
    labelKey: 'tabs.profile',
    icon: personOutline,
    component: () => import('@/pages/profile/ProfilePage.vue'),
  },
]
