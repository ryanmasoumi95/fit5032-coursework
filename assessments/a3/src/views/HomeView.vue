<script setup>
import HomeIntro from '../components/HomeIntro.vue'
import ServiceFinder from '../components/ServiceFinder.vue'
import ServiceComparison from '../components/ServiceComparison.vue'
import RecyclingGuide from '../components/RecyclingGuide.vue'
import ServiceMap from '../components/ServiceMap.vue'
import ReportForm from '../components/ReportForm.vue'
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
  >
    <HomeIntro />
    <ServiceFinder />
    <ServiceComparison />
    <RecyclingGuide />
    <ServiceMap />
    <ReportForm />
  </main>
</template>