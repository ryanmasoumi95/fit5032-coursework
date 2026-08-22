<script setup>
import HomeIntro from '../components/HomeIntro.vue'
import ServiceFinder from '../components/ServiceFinder.vue'
import ReportForm from '../components/ReportForm.vue'
import AuthPanel from '../components/AuthPanel.vue'
</script>

<template>
  <main>
    <HomeIntro />

    <p>Basic Application Development: Version 2</p>

    <ServiceFinder />

    <ReportForm id="report" />

    <AuthPanel />
  </main>
</template>