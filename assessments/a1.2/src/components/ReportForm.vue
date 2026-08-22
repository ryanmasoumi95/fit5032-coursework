<script setup>
import { ref } from 'vue'

const serviceName = ref('')
const issueType = ref('')
const description = ref('')
const email = ref('')

const errors = ref({})
const successMessage = ref('')

function validateForm() {
  errors.value = {}
  successMessage.value = ''

  if (!serviceName.value.trim()) {
    errors.value.serviceName = 'Service name is required.'
  }

  if (!issueType.value) {
    errors.value.issueType = 'Please select an issue type.'
  }

  if (description.value.trim().length < 20) {
    errors.value.description = 'Description must be at least 20 characters.'
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email.value.trim()) {
    errors.value.email = 'Email is required.'
  } else if (!emailPattern.test(email.value)) {
    errors.value.email = 'Please enter a valid email address.'
  }

  return Object.keys(errors.value).length === 0
}

function submitForm() {
  if (!validateForm()) {
    return
  }

  successMessage.value = 'Report submitted successfully.'

  serviceName.value = ''
  issueType.value = ''
  description.value = ''
  email.value = ''
}
</script>

<template>
  <section>
    <h2>Report Incorrect Information</h2>

    <form @submit.prevent="submitForm" novalidate>
      <div>
        <label for="service-name">Service name</label>

        <input
          id="service-name"
          v-model="serviceName"
          type="text"
        >

        <p
          v-if="errors.serviceName"
          class="form-error"
        >
          {{ errors.serviceName }}
        </p>
      </div>

      <div>
        <label for="issue-type">Issue type</label>

        <select
          id="issue-type"
          v-model="issueType"
        >
          <option value="">Select an issue</option>
          <option value="address">Incorrect address</option>
          <option value="hours">Incorrect opening hours</option>
          <option value="service">Service information</option>
        </select>

        <p
          v-if="errors.issueType"
          class="form-error"
        >
          {{ errors.issueType }}
        </p>
      </div>

      <div>
        <label for="description">Description</label>

        <textarea
          id="description"
          v-model="description"
        ></textarea>

        <p
          v-if="errors.description"
          class="form-error"
        >
          {{ errors.description }}
        </p>
      </div>

      <div>
        <label for="email">Email</label>

        <input
          id="email"
          v-model="email"
          type="email"
        >

        <p
          v-if="errors.email"
          class="form-error"
        >
          {{ errors.email }}
        </p>
      </div>

      <button type="submit">Submit report</button>

      <p
        v-if="successMessage"
        class="form-success"
      >
        {{ successMessage }}
      </p>
    </form>
  </section>
</template>