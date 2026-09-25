import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import { useAuth } from '../composables/useAuth'

const { isAdmin, waitForAuth } = useAuth()

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    }
  ]
})

// Wait for Firebase to restore the user's session before checking whether they can access the administrator page.
router.beforeEach(async (to) => {
  await waitForAuth()

  if (to.name === 'admin' && !isAdmin.value) {
    return { name: 'home' }
  }
})

export default router