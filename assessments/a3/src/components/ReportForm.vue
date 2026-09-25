<script setup>
import { reactive, ref } from 'vue'
import { auth } from '../firebase'
import { containsUnsafeMarkup } from '../utils/security'

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

const form = reactive({
  serviceName: '',
  issueType: '',
  description: '',
  email: ''
})

const errors = ref({})
const success = ref(false)
const sending = ref(false)
const submitError = ref('')
const attachment = ref(null)
const attachmentName = ref('')
const fileInput = ref(null)

const markupError = 'HTML or script markup is not allowed.'

function handleAttachment(event) {
  errors.value.attachment = ''
  attachment.value = null
  attachmentName.value = ''

  const file = event.target.files?.[0]

  if (!file) return

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]

  if (!allowedTypes.includes(file.type)) {
    errors.value.attachment =
      'Only PDF, JPG and PNG files are allowed.'
    event.target.value = ''
    return
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    errors.value.attachment =
      'Attachment must be 5 MB or smaller.'
    event.target.value = ''
    return
  }

  attachment.value = file
  attachmentName.value = file.name
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      const base64 = result.includes(',')
        ? result.split(',')[1]
        : result

      resolve(base64)
    }

    reader.onerror = () => {
      reject(new Error('Unable to read the attachment.'))
    }

    reader.readAsDataURL(file)
  })
}

async function submitForm() {
  form.serviceName = form.serviceName.trim()
  form.description = form.description.trim()
  form.email = form.email.trim().toLowerCase()

  errors.value = {}
  success.value = false
  submitError.value = ''

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
    errors.value.description =
      'Description must be at least 20 characters.'
  }

  if (!form.email) {
    errors.value.email = 'Email is required.'
  } else if (
    containsUnsafeMarkup(form.email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    errors.value.email = 'Please enter a valid email address.'
  }

  if (errors.value.attachment) return

  if (Object.keys(errors.value).length) return

  const firebaseUser = auth.currentUser

  if (!firebaseUser) {
    submitError.value =
      'You must be signed in to submit a report.'
    return
  }

  sending.value = true

  try {
    const idToken = await firebaseUser.getIdToken()

    let attachmentData = null

    if (attachment.value) {
      attachmentData = {
        name: attachment.value.name,
        type: attachment.value.type,
        content: await fileToBase64(attachment.value)
      }
    }

    const response = await fetch('/api/send-report', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceName: form.serviceName,
        issueType: form.issueType,
        description: form.description,
        email: form.email,
        attachment: attachmentData
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'The report could not be sent.'
      )
    }

    success.value = true

    Object.assign(form, {
      serviceName: '',
      issueType: '',
      description: '',
      email: ''
    })

    attachment.value = null
    attachmentName.value = ''

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    submitError.value =
      error instanceof Error
        ? error.message
        : 'The report could not be sent.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section id="report">
    <h2>Report Incorrect Information</h2>

    <form @submit.prevent="submitForm" novalidate>
      <div>
        <label for="service-name">Service name</label>
        <input
          id="service-name"
          v-model="form.serviceName"
          maxlength="80"
        >
        <p
          v-if="errors.serviceName"
          class="form-error"
          role="alert"
        >
          {{ errors.serviceName }}
        </p>
      </div>

      <div>
        <label for="issue-type">Issue type</label>
        <select
          id="issue-type"
          v-model="form.issueType"
        >
          <option value="">Select an issue</option>
          <option value="address">Incorrect address</option>
          <option value="hours">Incorrect opening hours</option>
          <option value="service">Service information</option>
        </select>
        <p
          v-if="errors.issueType"
          class="form-error"
          role="alert"
        >
          {{ errors.issueType }}
        </p>
      </div>

      <div>
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          maxlength="500"
        ></textarea>
        <p
          v-if="errors.description"
          class="form-error"
          role="alert"
        >
          {{ errors.description }}
        </p>
      </div>

      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          maxlength="120"
        >
        <p
          v-if="errors.email"
          class="form-error"
          role="alert"
        >
          {{ errors.email }}
        </p>
      </div>

      <div>
        <label for="attachment">
          Attachment (optional)
        </label>
        <input
          id="attachment"
          ref="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          @change="handleAttachment"
        >
        <p v-if="attachmentName">
          Selected: {{ attachmentName }}
        </p>
        <p
          v-if="errors.attachment"
          class="form-error"
          role="alert"
        >
          {{ errors.attachment }}
        </p>
      </div>

      <button :disabled="sending">
        {{ sending ? 'Sending report...' : 'Submit report' }}
      </button>

      <p
        v-if="submitError"
        class="form-error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <p
        v-if="success"
        class="form-success"
        role="status"
      >
        Report emailed successfully.
      </p>
    </form>
  </section>
</template>