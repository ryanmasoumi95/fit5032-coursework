<script setup>
import RatingControl from './RatingControl.vue'

defineProps({
  service: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="service-card">
    <p>{{ service.category }}</p>
    <h3>{{ service.name }}</h3>
    <p>{{ service.suburb }}</p>
    <p>{{ service.description }}</p>

    <RatingControl :service-id="service.id" />
  </article>
</template>