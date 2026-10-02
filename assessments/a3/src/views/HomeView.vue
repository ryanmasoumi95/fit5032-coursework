<script setup>
import HomeIntro from '../components/HomeIntro.vue'
import ServiceFinder from '../components/ServiceFinder.vue'
import RecyclingGuide from '../components/RecyclingGuide.vue'
import ServiceMap from '../components/ServiceMap.vue'
import ReportForm from '../components/ReportForm.vue'
import AuthPanel from '../components/AuthPanel.vue'
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
  >
    <HomeIntro />
    <ServiceFinder />
    <RecyclingGuide />
    <ServiceMap />
    <ReportForm />
    <AuthPanel />
  </main>
</template>