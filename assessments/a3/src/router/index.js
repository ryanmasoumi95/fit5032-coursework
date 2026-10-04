import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import AdminView from '../views/AdminView.vue'
import { useAuth } from '../composables/useAuth'

const {
  currentUser,
  isAdmin,
  waitForAuth
} = useAuth()

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/account',
      name: 'account',
      component: AuthView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    }
  ]
})

router.beforeEach(async (to) => {
  await waitForAuth()

  if (
    to.name === 'admin' &&
    !isAdmin.value
  ) {
    return { name: 'home' }
  }

  if (
    to.name === 'account' &&
    currentUser.value
  ) {
    return true
  }

  return true
})

export default router