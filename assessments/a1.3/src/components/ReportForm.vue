<script setup>
import { ref } from 'vue'
import {
  cleanPlainText,
  containsUnsafeMarkup
} from '../utils/security'

const serviceName = ref('')
const issueType = ref('')
const description = ref('')
const email = ref('')

const errors = ref({})
const successMessage = ref('')

// Accept only known issue types instead of trusting arbitrary client input.
const allowedIssueTypes = [
  'address',
  'hours',
  'service'
]

// Clean and validate user input before accepting the report.
function validateForm() {
  errors.value = {}
  successMessage.value = ''

  const cleanServiceName = cleanPlainText(
    serviceName.value,
    80
  )

  const cleanDescription = cleanPlainText(
    description.value,
    500
  )

  const cleanEmail = cleanPlainText(
    email.value,
    120
  )

  if (!cleanServiceName) {
    errors.value.serviceName = 'Service name is required.'
  } else if (containsUnsafeMarkup(serviceName.value)) {
    errors.value.serviceName =
      'HTML or script markup is not allowed.'
  }

  if (!allowedIssueTypes.includes(issueType.value)) {
    errors.value.issueType =
      'Please select a valid issue type.'
  }

  if (cleanDescription.length < 20) {
    errors.value.description =
      'Description must be at least 20 characters.'
  } else if (containsUnsafeMarkup(description.value)) {
    errors.value.description =
      'HTML or script markup is not allowed.'
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!cleanEmail) {
    errors.value.email = 'Email is required.'
  } else if (
    containsUnsafeMarkup(email.value) ||
    !emailPattern.test(cleanEmail)
  ) {
    errors.value.email =
      'Please enter a valid email address.'
  }

  if (Object.keys(errors.value).length > 0) {
    return false
  }

  serviceName.value = cleanServiceName
  description.value = cleanDescription
  email.value = cleanEmail.toLowerCase()

  return true
}

function submitForm() {
  if (!validateForm()) {
    return
  }

  successMessage.value =
    'Report submitted successfully.'

  serviceName.value = ''
  issueType.value = ''
  description.value = ''
  email.value = ''
}
</script>

<template>
  <section id="report">
    <h2>Report Incorrect Information</h2>

    <form
      @submit.prevent="submitForm"
      novalidate
    >
      <div>
        <label for="service-name">
          Service name
        </label>

        <input
          id="service-name"
          v-model="serviceName"
          type="text"
          maxlength="80"
          autocomplete="off"
        >

        <p
          v-if="errors.serviceName"
          class="form-error"
        >
          {{ errors.serviceName }}
        </p>
      </div>

      <div>
        <label for="issue-type">
          Issue type
        </label>

        <select
          id="issue-type"
          v-model="issueType"
        >
          <option value="">
            Select an issue
          </option>

          <option value="address">
            Incorrect address
          </option>

          <option value="hours">
            Incorrect opening hours
          </option>

          <option value="service">
            Service information
          </option>
        </select>

        <p
          v-if="errors.issueType"
          class="form-error"
        >
          {{ errors.issueType }}
        </p>
      </div>

      <div>
        <label for="description">
          Description
        </label>

        <textarea
          id="description"
          v-model="description"
          maxlength="500"
        ></textarea>

        <p
          v-if="errors.description"
          class="form-error"
        >
          {{ errors.description }}
        </p>
      </div>

      <div>
        <label for="email">
          Email
        </label>

        <input
          id="email"
          v-model="email"
          type="email"
          maxlength="120"
          autocomplete="email"
        >

        <p
          v-if="errors.email"
          class="form-error"
        >
          {{ errors.email }}
        </p>
      </div>

      <button type="submit">
        Submit report
      </button>

      <p
        v-if="successMessage"
        class="form-success"
      >
        {{ successMessage }}
      </p>
    </form>
  </section>
</template>