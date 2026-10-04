<template>
  <div class="container mt-4 text-center">
    <h1>WEATHER APP</h1>

    <div class="mb-3">
      <input
        v-model="city"
        type="text"
        placeholder="Enter city name"
      />

      <button
        type="button"
        @click="searchByCity"
      >
        Search
      </button>
    </div>

    <main>
      <div v-if="weatherData">
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>

        <div>
          <img
            :src="iconUrl"
            alt="Weather Icon"
          />

          <p>{{ temperature }} °C</p>
        </div>

        <span>
          {{ weatherData.weather[0].description }}
        </span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const apikey = import.meta.env.VITE_OPENWEATHER_API_KEY

const city = ref('')
const weatherData = ref(null)

const temperature = computed(() => {
  return weatherData.value
    ? Math.floor(weatherData.value.main.temp - 273.15)
    : null
})

const iconUrl = computed(() => {
  return weatherData.value
    ? `https://openweathermap.org/img/wn/${weatherData.value.weather[0].icon}@2x.png`
    : null
})

const fetchWeatherData = async (url) => {
  try {
    const response = await axios.get(url)
    weatherData.value = response.data
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
}

const fetchCurrentLocationWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords

      const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`

      await fetchWeatherData(url)
    })
  }
}

const searchByCity = async () => {
  if (!city.value.trim()) return

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.value)}&appid=${apikey}`

  await fetchWeatherData(url)
}

onMounted(() => {
  fetchCurrentLocationWeather()
})
</script>