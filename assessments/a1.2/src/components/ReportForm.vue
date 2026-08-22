<script setup>
import { ref } from 'vue'

const serviceName = ref('')
const issueType = ref('')
const description = ref('')
const email = ref('')
</script>

<template>
  <section>
    <h2>Report Incorrect Information</h2>

    <form>
      <div>
        <label for="service-name">Service name</label>
        <input
          id="service-name"
          v-model="serviceName"
          type="text"
        >
      </div>

      <div>
        <label for="issue-type">Issue type</label>
        <select
          id="issue-type"
          v-model="issueType"
        >
          <option value="">Select an issue</option>
          <option value="address">Incorrect address</option>
          <option value="hours">Incorrect opening hours</option>
          <option value="service">Service information</option>
        </select>
      </div>

      <div>
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="description"
        ></textarea>
      </div>

      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
        >
      </div>

      <button type="submit">Submit report</button>
    </form>
  </section>
</template>