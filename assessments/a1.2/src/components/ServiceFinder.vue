<script setup>
import { computed, ref, watch } from 'vue'
import ServiceCard from './ServiceCard.vue'
import services from '../data/services.json'

const searchTerm = ref(localStorage.getItem('serviceSearch') || '')
const selectedCategory = ref('All')

watch(searchTerm, (newSearchTerm) => {
  localStorage.setItem('serviceSearch', newSearchTerm)
})

const categories = [
  'All',
  ...new Set(services.map((service) => service.category))
]

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()

  return services.filter((service) => {
    const matchesSearch =
      !term ||
      service.name.toLowerCase().includes(term) ||
      service.suburb.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term)

    const matchesCategory =
      selectedCategory.value === 'All' ||
      service.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <section id="services">
    <h2>Find a Service</h2>

    <label for="service-search">Search services</label>

    <input
      id="service-search"
      v-model="searchTerm"
      type="search"
      placeholder="Search by name, suburb or category"
    >

    <label for="category-filter">Filter by category</label>

    <select
      id="category-filter"
      v-model="selectedCategory"
    >
      <option
        v-for="category in categories"
        :key="category"
        :value="category"
      >
        {{ category }}
      </option>
    </select>

    <p>{{ filteredServices.length }} service(s) found</p>

    <p v-if="filteredServices.length === 0">
      No services match your search. Try another suburb, category or service name.
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