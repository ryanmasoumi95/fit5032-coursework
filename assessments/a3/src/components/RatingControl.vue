<script setup>
import { computed, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRatings } from '../composables/useRatings'

const props = defineProps({
  serviceId: {
    type: Number,
    required: true
  }
})

const { currentUser } = useAuth()
const { getRatings, submitRating } = useRatings()

const selectedRating = ref(0)
const saved = ref(false)

const ratingInfo = computed(() =>
  getRatings(
    props.serviceId,
    currentUser.value?.id
  )
)

// Load the correct saved rating whenever the signed-in user changes.
watch(
  () => currentUser.value?.id,
  (userId) => {
    selectedRating.value = userId
      ? ratingInfo.value.userRating
      : 0

    saved.value = false
  },
  { immediate: true }
)

function saveRating() {
  submitRating(
    props.serviceId,
    currentUser.value.id,
    selectedRating.value
  )

  saved.value = true
}
</script>

<template>
  <div class="rating-control">
    <div class="rating-summary">
      <strong>
        {{
          ratingInfo.average
            ? `${ratingInfo.average} / 5`
            : 'Not yet rated'
        }}
      </strong>

      <span>
        {{ ratingInfo.count }}
        rating{{ ratingInfo.count === 1 ? '' : 's' }}
      </span>
    </div>

    <div v-if="currentUser" class="rating-form">
      <label :for="`rating-${serviceId}`">
        Your rating
      </label>

      <select
        :id="`rating-${serviceId}`"
        v-model.number="selectedRating"
      >
        <option :value="0">Select a rating</option>
        <option :value="1">1 - Poor</option>
        <option :value="2">2 - Fair</option>
        <option :value="3">3 - Good</option>
        <option :value="4">4 - Very good</option>
        <option :value="5">5 - Excellent</option>
      </select>

      <button
        :disabled="!selectedRating"
        @click="saveRating"
      >
        Save rating
      </button>

      <p
        v-if="saved"
        class="form-success"
        role="status"
      >
        Your rating has been saved.
      </p>
    </div>

    <p
      v-else
      class="rating-login-message"
    >
      Log in to rate this service.
    </p>
  </div>
</template>