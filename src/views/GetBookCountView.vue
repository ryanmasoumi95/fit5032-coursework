<template>
  <div class="container mt-5">
    <h1>Book Counter</h1>

    <button
      class="btn btn-primary mt-3"
      @click="getBookCount"
    >
      Get Book Count
    </button>

    <p
      v-if="count !== null"
      class="mt-3"
    >
      Total number of books: {{ count }}
    </p>

    <p
      v-if="error"
      class="text-danger mt-3"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const count = ref(null)
const error = ref('')

const getBookCount = async () => {
  try {
    error.value = ''

    const response = await axios.get(
      'http://127.0.0.1:5001/fit5032-a09e2/us-central1/countBooks'
    )

    count.value = response.data.count
  } catch (err) {
    console.error('Error getting book count:', err)

    count.value = null
    error.value = 'Error getting book count'
  }
}
</script>