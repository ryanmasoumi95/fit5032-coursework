import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import { useAuth } from '../composables/useAuth'

const { isAdmin } = useAuth()

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

// Redirect non-admin users away from the administrator page.
router.beforeEach((to) => {
  if (to.name === 'admin' && !isAdmin.value) {
    return { name: 'home' }
  }
})

export default router