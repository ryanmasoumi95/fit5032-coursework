<script setup>
import { reactive, ref } from 'vue'
import { containsUnsafeMarkup } from '../utils/security'

const form = reactive({
  serviceName: '',
  issueType: '',
  description: '',
  email: ''
})

const errors = ref({})
const success = ref(false)
const markupError = 'HTML or script markup is not allowed.'

function submitForm() {
  form.serviceName = form.serviceName.trim()
  form.description = form.description.trim()
  form.email = form.email.trim().toLowerCase()

  errors.value = {}
  success.value = false
  
  // Plain text fields reject HTML-style markup to reduce XSS risk.
  if (!form.serviceName) {
    errors.value.serviceName = 'Service name is required.'  
  } else if (containsUnsafeMarkup(form.serviceName)) {
    errors.value.serviceName = markupError
  }

  if (!['address', 'hours', 'service'].includes(form.issueType)) {
    errors.value.issueType = 'Please select a valid issue type.'
  }

  if (containsUnsafeMarkup(form.description)) {
    errors.value.description = markupError
  } else if (form.description.length < 20) {
    errors.value.description = 'Description must be at least 20 characters.'
  }

  if (!form.email) {
    errors.value.email = 'Email is required.'
  } else if (
    containsUnsafeMarkup(form.email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    errors.value.email = 'Please enter a valid email address.'
  }

  if (Object.keys(errors.value).length) return

  success.value = true

  Object.assign(form, {
    serviceName: '',
    issueType: '',
    description: '',
    email: ''
  })
}
</script>

<template>
  <section id="report">
    <h2>Report Incorrect Information</h2>

    <form @submit.prevent="submitForm" novalidate>
      <div>
        <label for="service-name">Service name</label>
        <input id="service-name" v-model="form.serviceName" maxlength="80">
        <p v-if="errors.serviceName" class="form-error">{{ errors.serviceName }}</p>
      </div>

      <div>
        <label for="issue-type">Issue type</label>
        <select id="issue-type" v-model="form.issueType">
          <option value="">Select an issue</option>
          <option value="address">Incorrect address</option>
          <option value="hours">Incorrect opening hours</option>
          <option value="service">Service information</option>
        </select>
        <p v-if="errors.issueType" class="form-error">{{ errors.issueType }}</p>
      </div>

      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="form.description" maxlength="500"></textarea>
        <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
      </div>

      <div>
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" maxlength="120">
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <button>Submit report</button>
      <p v-if="success" class="form-success">Report submitted successfully.</p>
    </form>
  </section>
</template>