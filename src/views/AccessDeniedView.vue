<template>
  <div class="container mt-5 text-center">
    <h1>Access Denied</h1>

    <p class="mt-3">
      You must be logged in to access this page.
    </p>

    <router-link
      to="/login"
      class="btn btn-primary mt-2"
    >
      Go to Login
    </router-link>
  </div>
</template>

<script setup>
// No script needed for this page
</script>