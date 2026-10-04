<script setup>
import { computed } from 'vue'
import RatingControl from './RatingControl.vue'
import { useSavedServices } from '../composables/useSavedServices'
import { useServiceComparison } from '../composables/useServiceComparison'

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

const {
  comparisonIsFull,
  isServiceCompared,
  toggleComparedService
} = useServiceComparison()

const saved = computed(() =>
  isServiceSaved(props.service.id)
)

const compared = computed(() =>
  isServiceCompared(props.service.id)
)

const compareDisabled = computed(
  () =>
    comparisonIsFull.value &&
    !compared.value
)

function toggleSaved() {
  toggleSavedService(props.service.id)
}

function toggleCompared() {
  toggleComparedService(props.service.id)
}
</script>

<template>
  <article class="service-card">
    <div class="service-card-heading">
      <div>
        <p>{{ service.category }}</p>
        <h3>{{ service.name }}</h3>
      </div>

      <div class="service-card-actions">
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

        <button
          type="button"
          class="compare-service-button"
          :class="{ compared }"
          :aria-pressed="compared"
          :aria-label="
            compared
              ? `Remove ${service.name} from comparison`
              : `Add ${service.name} to comparison`
          "
          :disabled="compareDisabled"
          @click="toggleCompared"
        >
          {{
            compared
              ? 'Compared'
              : 'Compare'
          }}
        </button>
      </div>
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

.service-card-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
  gap: 8px;
}

.save-service-button,
.compare-service-button {
  min-width: 112px;
  padding: 8px 12px;
}

.save-service-button {
  background: #d9e6df;
  color: #173f32;
}

.save-service-button.saved {
  background: #1f6f50;
  color: white;
}

.compare-service-button {
  background: white;
  color: #173f32;
  border: 1px solid #1f6f50;
}

.compare-service-button.compared {
  background: #173f32;
  color: white;
}

@media (max-width: 480px) {
  .service-card-heading {
    flex-direction: column;
  }

  .service-card-actions {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>