<script setup>
import AppHeader from './components/AppHeader.vue'
import ServiceCard from './components/ServiceCard.vue'
import services from './data/services.json'
</script>

<template>
  <AppHeader />

  <main>
    <p>Basic Application Development: Version 1</p>

    <section>
      <h2>Services</h2>

      <ServiceCard
        v-for="service in services"
        :key="service.id"
        :service="service"
      />
    </section>
  </main>
</template>