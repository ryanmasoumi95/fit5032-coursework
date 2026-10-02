<script setup>
import { computed, ref, watch } from 'vue'
import ServiceCard from './ServiceCard.vue'
import services from '../data/services.json'
import { useSavedServices } from '../composables/useSavedServices'

const search = ref(
  localStorage.getItem('serviceSearch') || ''
)

const category = ref('')
const showSavedOnly = ref(false)

const {
  savedServiceIds,
  savedServiceCount,
  clearSavedServices
} = useSavedServices()

const categories = [
  ...new Set(services.map(service => service.category))
]

// Keep the user's service search after the page is refreshed.
watch(search, value => {
  localStorage.setItem('serviceSearch', value)
})

const filteredServices = computed(() => {
  const term = search.value.trim().toLowerCase()

  return services.filter(service => {
    const matchesCategory =
      !category.value ||
      service.category === category.value

    const matchesSearch =
      `${service.name} ${service.suburb} ${service.category}`
        .toLowerCase()
        .includes(term)

    const matchesSaved =
      !showSavedOnly.value ||
      savedServiceIds.value.includes(service.id)

    return (
      matchesCategory &&
      matchesSearch &&
      matchesSaved
    )
  })
})

function clearSaved() {
  clearSavedServices()

  if (showSavedOnly.value) {
    showSavedOnly.value = false
  }
}
</script>

<template>
  <section id="services">
    <div class="service-finder-heading">
      <div>
        <h2>Find a Service</h2>

        <p>
          Search, filter and save useful services
          for later.
        </p>
      </div>

      <div class="saved-service-summary">
        <strong>
          {{ savedServiceCount }}
        </strong>

        <span>
          saved
          service{{ savedServiceCount === 1 ? '' : 's' }}
        </span>
      </div>
    </div>

    <div class="service-finder-controls">
      <div>
        <label for="service-search">
          Search services
        </label>

        <input
          id="service-search"
          v-model="search"
          type="search"
          placeholder="Search by name, suburb or category"
        >
      </div>

      <div>
        <label for="service-category">
          Filter by category
        </label>

        <select
          id="service-category"
          v-model="category"
        >
          <option value="">All</option>

          <option
            v-for="item in categories"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </div>
    </div>

    <div class="saved-service-controls">
      <button
        type="button"
        :class="{ active: showSavedOnly }"
        :aria-pressed="showSavedOnly"
        :disabled="!savedServiceCount"
        @click="
          showSavedOnly = !showSavedOnly
        "
      >
        {{
          showSavedOnly
            ? 'Show all services'
            : 'Show saved services'
        }}
      </button>

      <button
        type="button"
        class="secondary-button"
        :disabled="!savedServiceCount"
        @click="clearSaved"
      >
        Clear saved services
      </button>
    </div>

    <p aria-live="polite">
      {{ filteredServices.length }} service(s) found
    </p>

    <p v-if="!filteredServices.length">
      {{
        showSavedOnly
          ? 'No saved services match your current filters.'
          : 'No services match your search.'
      }}
    </p>

    <div class="service-grid">
      <ServiceCard
        v-for="service in filteredServices"
        :key="service.id"
        :service="service"
      />
    </div>
  </section>
</template>

<style scoped>
.service-finder-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.service-finder-heading h2 {
  margin: 0 0 8px;
}

.service-finder-heading p {
  margin: 0;
  color: #5d756b;
}

.saved-service-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #d9e6df;
  border-radius: 10px;
  background: white;
  white-space: nowrap;
}

.saved-service-summary strong {
  color: #1f6f50;
  font-size: 1.4rem;
}

.service-finder-controls {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.service-finder-controls > div {
  display: grid;
  gap: 8px;
}

.service-finder-controls label {
  font-weight: 600;
}

.saved-service-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.saved-service-controls .active {
  background: #173f32;
}

.secondary-button {
  background: #d9e6df;
  color: #173f32;
}

@media (max-width: 600px) {
  .service-finder-heading {
    flex-direction: column;
  }

  .saved-service-summary {
    width: 100%;
  }
}
</style>