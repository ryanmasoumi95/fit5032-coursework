<script setup>
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ServiceCard from './components/ServiceCard.vue'
import ReportForm from './components/ReportForm.vue'
import services from './data/services.json'

const searchTerm = ref('')

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()

  if (!term) {
    return services
  }

  return services.filter((service) =>
    service.name.toLowerCase().includes(term) ||
    service.suburb.toLowerCase().includes(term) ||
    service.category.toLowerCase().includes(term)
  )
})
</script>

<template>
  <AppHeader />

  <main>
    <p>Basic Application Development: Version 1</p>

    <section>
      <h2>Find a Service</h2>

      <label for="service-search">Search services</label>

      <input
        id="service-search"
        v-model="searchTerm"
        type="search"
        placeholder="Search by name, suburb or category"
      >

      <p>{{ filteredServices.length }} service(s) found</p>

      <div class="service-grid">
        <ServiceCard
          v-for="service in filteredServices"
          :key="service.id"
          :service="service"
        />
      </div>
    </section>

    <ReportForm />
  </main>
</template>