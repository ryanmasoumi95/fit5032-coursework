<template>
  <div class="container mt-5">
    <h1>Count Book API</h1>

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

const getBookCountAPI = async () => {
  try {
    error.value = ''

    const response = await axios.get(
      'http://127.0.0.1:5001/fit5032-a09e2/us-central1/countBooks'
    )

    jsondata.value = response.data
  } catch (err) {
    console.error('Error getting book count API data:', err)

    jsondata.value = null
    error.value = 'Error getting book count API data'
  }
}

onMounted(() => {
  getBookCountAPI()
})
</script>