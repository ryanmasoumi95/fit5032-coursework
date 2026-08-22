<script setup>
import AppHeader from './components/AppHeader.vue'
import ServiceFinder from './components/ServiceFinder.vue'
import ReportForm from './components/ReportForm.vue'
</script>

<template>
  <AppHeader id="home" />

  <main>
    <p>Basic Application Development: Version 1</p>

    <ServiceFinder />

    <ReportForm id="report" />
  </main>
</template>