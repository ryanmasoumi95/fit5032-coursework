<script setup>
import { computed } from 'vue'
import RatingControl from './RatingControl.vue'
import { useSavedServices } from '../composables/useSavedServices'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const {
  isServiceSaved,
  toggleSavedService
} = useSavedServices()

const saved = computed(() =>
  isServiceSaved(props.service.id)
)

function toggleSaved() {
  toggleSavedService(props.service.id)
}
</script>

<template>
  <article class="service-card">
    <div class="service-card-heading">
      <div>
        <p>{{ service.category }}</p>
        <h3>{{ service.name }}</h3>
      </div>

      <button
        type="button"
        class="save-service-button"
        :class="{ saved }"
        :aria-pressed="saved"
        :aria-label="
          saved
            ? `Remove ${service.name} from saved services`
            : `Save ${service.name}`
        "
        @click="toggleSaved"
      >
        {{
          saved
            ? 'Saved'
            : 'Save service'
        }}
      </button>
    </div>

    <p>{{ service.suburb }}</p>
    <p>{{ service.description }}</p>

    <RatingControl :service-id="service.id" />
  </article>
</template>

<style scoped>
.service-card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.service-card-heading p {
  margin-top: 0;
}

.service-card-heading h3 {
  margin: 6px 0 0;
}

.save-service-button {
  flex-shrink: 0;
  padding: 8px 12px;
  background: #d9e6df;
  color: #173f32;
}

.save-service-button.saved {
  background: #1f6f50;
  color: white;
}

@media (max-width: 480px) {
  .service-card-heading {
    flex-direction: column;
  }
}
</style>