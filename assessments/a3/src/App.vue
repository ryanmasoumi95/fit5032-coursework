<script setup>
import AppHeader from './components/AppHeader.vue'

function skipToMainContent() {
  const mainContent = document.getElementById('main-content')

  if (mainContent) {
    mainContent.focus()
    mainContent.scrollIntoView()
  }
}
</script>

<template>
  <a
    class="skip-link"
    href="#main-content"
    @click.prevent="skipToMainContent"
  >
    Skip to main content
  </a>

  <AppHeader />
  <RouterView />
</template>