<script setup>
import { useAuth } from '../composables/useAuth'

const { currentUser, isAdmin } = useAuth()
</script>

<template>
  <section
    v-if="isAdmin"
    id="admin"
    class="admin-panel"
  >
    <p class="eyebrow">Administrator access</p>

    <h2>Admin Dashboard</h2>

    <p>
      Welcome,
      <strong>{{ currentUser.name }}</strong>.
    </p>

    <p>
      This area is restricted to users with the
      <strong>admin</strong> role.
    </p>

    <div class="admin-summary">
      <article>
        <h3>Service management</h3>
        <p>
          Review Circular Melbourne service information and maintain
          accurate community listings.
        </p>
      </article>

      <article>
        <h3>Report management</h3>
        <p>
          Review incorrect-information reports submitted by community
          users.
        </p>
      </article>
    </div>
  </section>
</template>