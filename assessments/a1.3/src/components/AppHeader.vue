<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isAdmin } = useAuth()

async function goToSection(sectionId) {
  await router.push({ name: 'home' })

  requestAnimationFrame(() => {
    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}
</script>

<template>
  <header class="site-header">
    <div class="brand">
      <div class="brand-mark">CM</div>

      <div>
        <h1 class="brand-name">Circular Melbourne</h1>
        <p class="brand-tagline">Reuse more. Waste less.</p>
      </div>
    </div>

    <nav class="main-nav" aria-label="Main navigation">
      <a
        href="#home"
        @click.prevent="goToSection('home')"
      >
        Home
      </a>

      <a
        href="#services"
        @click.prevent="goToSection('services')"
      >
        Find a Service
      </a>

      <a
        href="#report"
        @click.prevent="goToSection('report')"
      >
        Report Information
      </a>

      <RouterLink
        v-if="isAdmin"
        :to="{ name: 'admin' }"
      >
        Admin Dashboard
      </RouterLink>
    </nav>
  </header>
</template>