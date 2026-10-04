<script setup>
import AuthPanel from '../components/AuthPanel.vue'
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="auth-page"
  >
    <section class="auth-page-intro">
      <h2>
        Account Access
      </h2>

      <p>
        Log in to your Circular Melbourne account
        or create a new account.
      </p>
    </section>

    <AuthPanel />
  </main>
</template>

<style scoped>
.auth-page {
  display: grid;
  justify-items: center;
}

.auth-page-intro {
  width: min(600px, 100%);
  margin-top: 0;
}

.auth-page-intro h2 {
  margin-bottom: 8px;
}

.auth-page-intro p {
  margin-top: 0;
  color: #5d756b;
}

.auth-page :deep(.auth-panel) {
  width: min(600px, 100%);
}
</style>