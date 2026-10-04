<template>
  <div class="container mt-5">
    <h1>Get All Book API</h1>

    <pre v-if="jsondata">{{ jsondata }}</pre>

    <p
      v-if="error"
      class="text-danger mt-3"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const jsondata = ref(null)
const error = ref('')

const getAllBooksAPI = async () => {
  try {
    error.value = ''

    const response = await axios.get(
      'http://127.0.0.1:5001/fit5032-a09e2/us-central1/getAllBooks'
    )

    jsondata.value = response.data
  } catch (err) {
    console.error('Error getting all books:', err)

    jsondata.value = null
    error.value = 'Error getting all books'
  }
}

onMounted(() => {
  getAllBooksAPI()
})
</script>