<script setup>
import AppHeader from './components/AppHeader.vue'
import HomeIntro from './components/HomeIntro.vue'
import ServiceFinder from './components/ServiceFinder.vue'
import ReportForm from './components/ReportForm.vue'
</script>

<template>
  <AppHeader />

  <main>
    <HomeIntro />

    <p>Basic Application Development: Version 1</p>

    <ServiceFinder />

    <ReportForm id="report" />
  </main>
</template>