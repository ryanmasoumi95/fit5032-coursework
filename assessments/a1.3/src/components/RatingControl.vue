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

const { currentUser, isAuthenticated } = useAuth()

const {
  getAverageRating,
  getRatingCount,
  getUserRating,
  submitRating
} = useRatings()

const selectedRating = ref(0)
const ratingMessage = ref('')

const averageRating = computed(() =>
  getAverageRating(props.serviceId)
)

const ratingCount = computed(() =>
  getRatingCount(props.serviceId)
)

watch(
  () => currentUser.value?.id,
  (userId) => {
    ratingMessage.value = ''

    selectedRating.value = userId
      ? getUserRating(props.serviceId, userId)
      : 0
  },
  {
    immediate: true
  }
)

function handleRatingSubmit() {
  ratingMessage.value = ''

  if (!currentUser.value) {
    return
  }

  const success = submitRating(
    props.serviceId,
    currentUser.value.id,
    selectedRating.value
  )

  if (success) {
    ratingMessage.value = 'Your rating has been saved.'
  }
}
</script>

<template>
  <div class="rating-control">
    <div class="rating-summary">
      <strong>
        {{ averageRating > 0 ? `${averageRating} / 5` : 'Not yet rated' }}
      </strong>

      <span>
        {{
          ratingCount === 1
            ? '1 rating'
            : `${ratingCount} ratings`
        }}
      </span>
    </div>

    <div
      v-if="isAuthenticated"
      class="rating-form"
    >
      <label :for="`rating-${serviceId}`">
        Your rating
      </label>

      <select
        :id="`rating-${serviceId}`"
        v-model.number="selectedRating"
      >
        <option :value="0">
          Select a rating
        </option>

        <option :value="1">1 - Poor</option>
        <option :value="2">2 - Fair</option>
        <option :value="3">3 - Good</option>
        <option :value="4">4 - Very good</option>
        <option :value="5">5 - Excellent</option>
      </select>

      <button
        type="button"
        :disabled="selectedRating === 0"
        @click="handleRatingSubmit"
      >
        Save rating
      </button>

      <p
        v-if="ratingMessage"
        class="form-success"
      >
        {{ ratingMessage }}
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