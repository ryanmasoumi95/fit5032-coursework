
<script setup>
import { reactive, ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { auth } from '../firebase'
import { containsUnsafeMarkup } from '../utils/security'

// Load TinyMCE locally from the installed npm package.
import 'tinymce/tinymce'
import 'tinymce/models/dom'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'

// TinyMCE editor appearance.
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.js'
import 'tinymce/skins/content/default/content.js'

// Free TinyMCE plugins for bullet and numbered lists.
import 'tinymce/plugins/lists'
import 'tinymce/plugins/advlist'

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const MAX_DESCRIPTION_HTML_LENGTH = 15000

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

const editorConfig = {
  height: 300,
  menubar: false,
  license_key: 'gpl',

  plugins: 'lists advlist',

  toolbar:
    'undo redo | blocks | bold italic underline | ' +
    'bullist numlist | removeformat',

  block_formats:
    'Paragraph=p;Heading 2=h2;Heading 3=h3',

  // The editor skin is included in the application bundle.
  skin: false,
  content_css: false,

  content_style:
    'body { font-family: Arial, sans-serif; ' +
    'font-size: 14px; line-height: 1.6; }',

  aria_label: 'Report description',

  branding: false,
  promotion: false
}

// Read the actual text typed in TinyMCE instead of
// counting the HTML tags added by the editor.
function getDescriptionText(html) {
  const documentObject = new DOMParser().parseFromString(
    html,
    'text/html'
  )

  documentObject
    .querySelectorAll('script, style, iframe, object, embed')
    .forEach((element) => element.remove())

  return (documentObject.body.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

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

  // Preserve any existing attachment validation error.
  const attachmentError = errors.value.attachment

  errors.value = {}
  success.value = false
  submitError.value = ''

  if (attachmentError) {
    errors.value.attachment = attachmentError
  }

  if (!form.serviceName) {
    errors.value.serviceName = 'Service name is required.'
  } else if (containsUnsafeMarkup(form.serviceName)) {
    errors.value.serviceName = markupError
  }

  if (!['address', 'hours', 'service'].includes(form.issueType)) {
    errors.value.issueType =
      'Please select a valid issue type.'
  }

  const descriptionText = getDescriptionText(
    form.description
  )

  // TinyMCE stores formatting as HTML. Validate its
  // visible text instead of rejecting all HTML.
  if (
    descriptionText.length < 20 ||
    descriptionText.length > 500
  ) {
    errors.value.description =
      'Description must contain between 20 and 500 characters.'
  } else if (
    form.description.length > MAX_DESCRIPTION_HTML_LENGTH
  ) {
    errors.value.description =
      'Description contains too much formatting.'
  }

  if (!form.email) {
    errors.value.email = 'Email is required.'
  } else if (
    containsUnsafeMarkup(form.email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    errors.value.email =
      'Please enter a valid email address.'
  }

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

        // Send the formatted HTML to the backend.
        // The backend sanitises it before emailing.
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
          required
          :aria-invalid="Boolean(errors.serviceName)"
          :aria-describedby="
            errors.serviceName
              ? 'service-name-error'
              : undefined
          "
        >

        <p
          v-if="errors.serviceName"
          id="service-name-error"
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
          required
          :aria-invalid="Boolean(errors.issueType)"
          :aria-describedby="
            errors.issueType
              ? 'issue-type-error'
              : undefined
          "
        >
          <option value="">Select an issue</option>
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
          id="issue-type-error"
          class="form-error"
          role="alert"
        >
          {{ errors.issueType }}
        </p>
      </div>

      <div>
        <label for="description">Description</label>

        <p id="description-help">
          Describe what needs correcting (20–500 characters).
          You can use headings, bold text, italic text,
          and bullet points.
        </p>

        <Editor
          id="description"
          v-model="form.description"
          license-key="gpl"
          :init="editorConfig"
          :disabled="sending"
          :aria-invalid="Boolean(errors.description)"
          :aria-describedby="
            errors.description
              ? 'description-help description-error'
              : 'description-help'
          "
        />

        <p
          v-if="errors.description"
          id="description-error"
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
          required
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="
            errors.email
              ? 'email-error'
              : undefined
          "
        >

        <p
          v-if="errors.email"
          id="email-error"
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
          :aria-invalid="Boolean(errors.attachment)"
          :aria-describedby="
            errors.attachment
              ? 'attachment-error'
              : undefined
          "
          @change="handleAttachment"
        >

        <p v-if="attachmentName">
          Selected: {{ attachmentName }}
        </p>

        <p
          v-if="errors.attachment"
          id="attachment-error"
          class="form-error"
          role="alert"
        >
          {{ errors.attachment }}
        </p>
      </div>

      <button type="submit" :disabled="sending">
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
