import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  // Mark this route as admin-only so access can be enforced by the router guard.
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: {
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Redirect non-admin users away from routes that require the admin role.
router.beforeEach((to) => {
  const { isAdmin } = useAuth()

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'home' }
  }
})

export default router