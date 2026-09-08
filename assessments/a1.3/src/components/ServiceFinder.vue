<script setup>
import { computed, ref, watch } from 'vue'
import ServiceCard from './ServiceCard.vue'
import services from '../data/services.json'

const search = ref(
  localStorage.getItem('serviceSearch') || ''
)

const category = ref('')

const categories = [
  ...new Set(services.map(service => service.category))
]

// Keep the user's service search after the page is refreshed.
watch(search, value => {
  localStorage.setItem('serviceSearch', value)
})

const filteredServices = computed(() => {
  const term = search.value.trim().toLowerCase()

  return services.filter(service =>
    (!category.value || service.category === category.value) &&
    `${service.name} ${service.suburb} ${service.category}`
      .toLowerCase()
      .includes(term)
  )
})
</script>

<template>
  <section id="services">
    <h2>Find a Service</h2>

    <label for="service-search">
      Search services
    </label>

    <input
      id="service-search"
      v-model="search"
      placeholder="Search by name, suburb or category"
    >

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

    <p>
      {{ filteredServices.length }} service(s) found
    </p>

    <p v-if="!filteredServices.length">
      No services match your search.
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