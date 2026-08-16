<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">

        <h1 class="text-center mb-3">
          User Information Form / Credentials
        </h1>

        <form @submit.prevent="submitForm">

          <!-- Username + Password -->
          <div class="row">
            <div class="col-12 col-md-6 mb-3">
              <label for="username" class="form-label">
                Username:
              </label>

              <input
                type="text"
                class="form-control"
                id="username"
                v-model="formData.username"
                  @blur="() => validateName(true)"
                  @input="() => validateName(false)"
              >
              <div v-if="errors.username" class="text-danger">
                {{ errors.username }}
              </div>
            </div>

            <div class="col-12 col-md-6 mb-3">
              <label for="password" class="form-label">
                Password:
              </label>

              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                  @blur="() => validatePassword(true)"
                  @input="() => validatePassword(false)"
              >
              <div v-if="errors.password" class="text-danger">
                {{ errors.password }}
              </div>
            </div>
          </div>

          <!-- Australian Resident + Gender -->
          <div class="row">

            <div class="col-12 col-md-6 mb-3">
              <div class="form-check mt-4">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  @change="() => validateResident(true)"
                >
                <div v-if="errors.resident" class="text-danger">
                  {{ errors.resident }}
                </div>

                <label
                  class="form-check-label"
                  for="isAustralian"
                >
                  Australian Resident?
                </label>
              </div>
            </div>

            <div class="col-12 col-md-6 mb-3">
              <label for="gender" class="form-label">
                Gender
              </label>

              <select
                class="form-select"
                id="gender"
                v-model="formData.gender"
                @change="() => validateGender(true)"
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger">
                {{ errors.gender }}
              </div>
            </div>

          </div>

          <!-- Reason -->
          <div class="mb-3">
            <label for="reason" class="form-label">
              Reason For Joining:
            </label>

            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model="formData.reason"
              @blur="() => validateReason(true)"
              @input="() => validateReason(false)"
            ></textarea>
            <div v-if="errors.reason" class="text-danger">
              {{ errors.reason }}
            </div>
          </div>

          <!-- Buttons -->
          <div class="text-center">
            <button
              type="submit"
              class="btn btn-primary me-2"
            >
              Submit
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="clearForm"
            >
              Clear
            </button>
          </div>

        </form>

        <!-- Submitted User Cards -->
        <div
          class="row mt-5"
          v-if="submittedCards.length"
        >
          <div class="d-flex flex-wrap justify-content-start">

            <div
              v-for="(card, index) in submittedCards"
              :key="index"
              class="card m-2"
              style="width: 18rem;"
            >

              <div class="card-header">
                User Information
              </div>

              <ul class="list-group list-group-flush">

                <li class="list-group-item">
                  Username: {{ card.username }}
                </li>

                <li class="list-group-item">
                  Password: {{ card.password }}
                </li>

                <li class="list-group-item">
                  Australian Resident:
                  {{ card.isAustralian ? 'Yes' : 'No' }}
                </li>

                <li class="list-group-item">
                  Gender: {{ card.gender }}
                </li>

                <li class="list-group-item">
                  Reason: {{ card.reason }}
                </li>

              </ul>

            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

const submittedCards = ref([])

const errors = ref({
  username: null,
  password: null,
  resident: null,
  gender: null,
  reason: null
})

const validateName = (blur) => {
  const username = formData.value.username.trim()

  if (username.length < 3) {
    if (blur) errors.value.username = "Name must be at least 3 characters"
  } else if (!/^[A-Za-z\s]+$/.test(username)) {
    if (blur) errors.value.username = "Name can only contain letters and spaces"
  } else {
    errors.value.username = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasSpace = /\s/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = "Password must contain at least one uppercase letter."
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least one lowercase letter."
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least one number."
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least one special character."
  } else if (hasSpace) {
    if (blur) errors.value.password = "Password must not contain spaces."
  } else {
    errors.value.password = null
  }
}

const validateResident = (blur) => {
  if (!formData.value.isAustralian) {
    if (blur) errors.value.resident = "Please confirm Australian residency"
  } else {
    errors.value.resident = null
  }
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) errors.value.gender = "Please select a gender"
  } else {
    errors.value.gender = null
  }
}

const validateReason = (blur) => {
  if (formData.value.reason.trim().length < 10) {
    if (blur) errors.value.reason = "Reason must be at least 10 characters"
  } else {
    errors.value.reason = null
  }
}

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateResident(true)
  validateGender(true)
  validateReason(true)

  if (
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.resident &&
    !errors.value.gender &&
    !errors.value.reason
  ) {
    submittedCards.value.push({
      ...formData.value
    })
  }
}

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
  }

  submittedCards.value = []
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #275FDA;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.list-group-item {
  padding: 10px;
}
</style>