<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const {
  currentUser,
  authError,
  isAuthenticated,
  register,
  login,
  logout,
  clearAuthError
} = useAuth()

const mode = ref('login')

const name = ref('')
const email = ref('')
const password = ref('')

const formError = ref('')

function switchMode(newMode) {
  mode.value = newMode
  formError.value = ''
  clearAuthError()
}

function validateForm() {
  formError.value = ''

  if (mode.value === 'register' && !name.value.trim()) {
    formError.value = 'Name is required.'
    return false
  }

  if (!email.value.trim()) {
    formError.value = 'Email is required.'
    return false
  }

  if (!password.value) {
    formError.value = 'Password is required.'
    return false
  }

  if (password.value.length < 8) {
    formError.value = 'Password must be at least 8 characters.'
    return false
  }

  return true
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  let success = false

  if (mode.value === 'register') {
    success = await register(
      name.value,
      email.value,
      password.value
    )
  } else {
    success = await login(
      email.value,
      password.value
    )
  }

  if (success) {
    name.value = ''
    email.value = ''
    password.value = ''
    formError.value = ''
  }
}

function handleLogout() {
  logout()

  name.value = ''
  email.value = ''
  password.value = ''
  formError.value = ''
}
</script>

<template>
  <section id="account" class="auth-panel">
    <div v-if="isAuthenticated">
      <h2>My Account</h2>

      <p>
        Signed in as
        <strong>{{ currentUser.name }}</strong>
      </p>

      <p>{{ currentUser.email }}</p>

      <p>
        Role:
        <strong>{{ currentUser.role }}</strong>
      </p>

      <button
        type="button"
        @click="handleLogout"
      >
        Log out
      </button>
    </div>

    <div v-else>
      <h2>
        {{ mode === 'login' ? 'Log in' : 'Create an account' }}
      </h2>

      <div class="auth-mode-buttons">
        <button
          type="button"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >
          Log in
        </button>

        <button
          type="button"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >
          Register
        </button>
      </div>

      <form
        class="auth-form"
        @submit.prevent="submitForm"
        novalidate
      >
        <div v-if="mode === 'register'">
          <label for="auth-name">Name</label>

          <input
            id="auth-name"
            v-model="name"
            type="text"
            autocomplete="name"
          >
        </div>

        <div>
          <label for="auth-email">Email</label>

          <input
            id="auth-email"
            v-model="email"
            type="email"
            autocomplete="email"
          >
        </div>

        <div>
          <label for="auth-password">Password</label>

          <input
            id="auth-password"
            v-model="password"
            type="password"
            :autocomplete="
              mode === 'login'
                ? 'current-password'
                : 'new-password'
            "
          >
        </div>

        <p
          v-if="formError"
          class="form-error"
        >
          {{ formError }}
        </p>

        <p
          v-if="authError"
          class="form-error"
        >
          {{ authError }}
        </p>

        <button type="submit">
          {{ mode === 'login' ? 'Log in' : 'Create account' }}
        </button>
      </form>
    </div>
  </section>
</template>