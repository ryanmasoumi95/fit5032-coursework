<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const {
  currentUser,
  authError,
  register,
  login,
  logout
} = useAuth()

const registering = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')

function switchMode(value) {
  registering.value = value
  formError.value = ''
  authError.value = ''
}

function validateForm() {
  if (registering.value && !name.value.trim()) {
    return 'Name is required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return 'Please enter a valid email address.'
  }

  if (!password.value) {
    return 'Password is required.'
  }

  if (password.value.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
}

async function submitForm() {
  formError.value = validateForm()

  if (formError.value) {
    return
  }

  const success = registering.value
    ? await register(name.value, email.value, password.value)
    : await login(email.value, password.value)

  if (success) {
    name.value = ''
    email.value = ''
    password.value = ''
  }
}
</script>

<template>
  <section id="account" class="auth-panel">
    <div v-if="currentUser">
      <h2>My Account</h2>

      <p>
        Signed in as <strong>{{ currentUser.name }}</strong>
      </p>

      <p>{{ currentUser.email }}</p>

      <p>
        Role: <strong>{{ currentUser.role }}</strong>
      </p>

      <button @click="logout">
        Log out
      </button>
    </div>

    <div v-else>
      <h2>
        {{ registering ? 'Create an account' : 'Log in' }}
      </h2>

      <div class="auth-mode-buttons">
        <button
          :class="{ active: !registering }"
          @click="switchMode(false)"
        >
          Log in
        </button>

        <button
          :class="{ active: registering }"
          @click="switchMode(true)"
        >
          Register
        </button>
      </div>

      <form @submit.prevent="submitForm" novalidate>
        <div v-if="registering">
          <label for="auth-name">Name</label>
          <input
            id="auth-name"
            v-model="name"
          >
        </div>

        <div>
          <label for="auth-email">Email</label>
          <input
            id="auth-email"
            v-model="email"
            type="email"
          >
        </div>

        <div>
          <label for="auth-password">Password</label>
          <input
            id="auth-password"
            v-model="password"
            type="password"
          >
        </div>

        <p
          v-if="formError || authError"
          class="form-error"
        >
          {{ formError || authError }}
        </p>

        <button>
          {{ registering ? 'Create account' : 'Log in' }}
        </button>
      </form>
    </div>
  </section>
</template>