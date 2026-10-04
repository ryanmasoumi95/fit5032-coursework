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
const confirmPassword = ref('')
const formError = ref('')

function switchMode(value) {
  registering.value = value
  formError.value = ''
  authError.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function validateForm() {
  if (
    registering.value &&
    !name.value.trim()
  ) {
    return 'Name is required.'
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.value.trim()
    )
  ) {
    return 'Please enter a valid email address.'
  }

  if (!password.value) {
    return 'Password is required.'
  }

  if (password.value.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (
    registering.value &&
    !confirmPassword.value
  ) {
    return 'Please confirm your password.'
  }

  if (
    registering.value &&
    password.value !== confirmPassword.value
  ) {
    return 'Passwords do not match.'
  }

  return ''
}

async function submitForm() {
  formError.value = validateForm()

  if (formError.value) {
    return
  }

  const success = registering.value
    ? await register(
        name.value,
        email.value,
        password.value
      )
    : await login(
        email.value,
        password.value
      )

  if (success) {
    name.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  }
}
</script>

<template>
  <section
    id="account"
    class="auth-panel"
    aria-labelledby="account-heading"
  >
    <div v-if="currentUser">
      <h2 id="account-heading">
        My Account
      </h2>

      <p>
        Signed in as
        <strong>{{ currentUser.name }}</strong>
      </p>

      <p>
        {{ currentUser.email }}
      </p>

      <p>
        Role:
        <strong>{{ currentUser.role }}</strong>
      </p>

      <button
        type="button"
        @click="logout"
      >
        Log out
      </button>
    </div>

    <div v-else>
      <h2 id="account-heading">
        {{
          registering
            ? 'Create an account'
            : 'Log in'
        }}
      </h2>

      <p>
        {{
          registering
            ? 'Create your Circular Melbourne account.'
            : 'Log in to access your account features.'
        }}
      </p>

      <div class="auth-mode-buttons">
        <button
          type="button"
          :class="{ active: !registering }"
          :aria-pressed="!registering"
          @click="switchMode(false)"
        >
          Log in
        </button>

        <button
          type="button"
          :class="{ active: registering }"
          :aria-pressed="registering"
          @click="switchMode(true)"
        >
          Register
        </button>
      </div>

      <form
        @submit.prevent="submitForm"
        novalidate
      >
        <div v-if="registering">
          <label for="auth-name">
            Name
          </label>

          <input
            id="auth-name"
            v-model="name"
            type="text"
            autocomplete="name"
            required
          >
        </div>

        <div>
          <label for="auth-email">
            Email
          </label>

          <input
            id="auth-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
          >
        </div>

        <div>
          <label for="auth-password">
            Password
          </label>

          <input
            id="auth-password"
            v-model="password"
            type="password"
            :autocomplete="
              registering
                ? 'new-password'
                : 'current-password'
            "
            minlength="8"
            required
          >
        </div>

        <div v-if="registering">
          <label for="auth-confirm-password">
            Confirm password
          </label>

          <input
            id="auth-confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          >
        </div>

        <p
          v-if="formError || authError"
          class="form-error"
          role="alert"
        >
          {{ formError || authError }}
        </p>

        <button type="submit">
          {{
            registering
              ? 'Create account'
              : 'Log in'
          }}
        </button>
      </form>
    </div>
  </section>
</template>