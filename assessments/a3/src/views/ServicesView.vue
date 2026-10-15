
<script setup>
import ServiceFinder from '../components/ServiceFinder.vue'
import ServiceComparison from '../components/ServiceComparison.vue'
import RecyclingGuide from '../components/RecyclingGuide.vue'
import ServiceMap from '../components/ServiceMap.vue'
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
  >
    <ServiceFinder />
    <ServiceComparison />
    <RecyclingGuide />
    <ServiceMap />
  </main>
</template>
