
<script setup>
import { useAuth } from '../composables/useAuth'

const {
  currentUser,
  isAdmin
} = useAuth()
</script>

<template>
  <header class="site-header">
    <div class="brand">
      <div class="brand-mark">
        CM
      </div>

      <div>
        <h1 class="brand-name">
          Circular Melbourne
        </h1>

        <p class="brand-tagline">
          Reuse more. Waste less.
        </p>
      </div>
    </div>

    <nav
      class="main-nav"
      aria-label="Main navigation"
    >
      <RouterLink to="/">
        Home
      </RouterLink>

      <RouterLink to="/services">
        Find a Service
      </RouterLink>

      <RouterLink to="/report">
        Report Information
      </RouterLink>

      <RouterLink to="/account">
        {{
          currentUser
            ? 'My Account'
            : 'Log in / Register'
        }}
      </RouterLink>

      <RouterLink
        v-if="isAdmin"
        to="/admin"
      >
        Admin Dashboard
      </RouterLink>
    </nav>
  </header>
</template>
