<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import L from 'leaflet'
import services from '../data/services.json'

const mapElement = ref(null)
const search = ref('')
const category = ref('')
const locationMessage = ref('')
const nearestService = ref(null)
const nearestDistance = ref(null)
const userCoordinates = ref(null)

let map = null
let serviceLayer = null
let userLayer = null
let routeLayer = null

const categories = [
  ...new Set(
    services
      .map(service => service.category)
      .sort()
  )
]

const filteredServices = computed(() => {
  const term = search.value
    .trim()
    .toLowerCase()

  return services.filter(service => {
    const matchesCategory =
      !category.value ||
      service.category === category.value

    const matchesSearch =
      !term ||
      `${service.name} ${service.suburb} ${service.category}`
        .toLowerCase()
        .includes(term)

    return matchesCategory && matchesSearch
  })
})

const directionsUrl = computed(() => {
  if (
    !userCoordinates.value ||
    !nearestService.value
  ) {
    return ''
  }

  const start =
    `${userCoordinates.value.latitude},${userCoordinates.value.longitude}`

  const end =
    `${nearestService.value.latitude},${nearestService.value.longitude}`

  return (
    'https://www.openstreetmap.org/directions' +
    '?engine=fossgis_osrm_foot' +
    `&route=${encodeURIComponent(start + ';' + end)}`
  )
})

function createServicePopup(service) {
  const wrapper = document.createElement('div')

  const title = document.createElement('strong')
  title.textContent = service.name

  const suburb = document.createElement('p')
  suburb.textContent = `Suburb: ${service.suburb}`

  const categoryText = document.createElement('p')
  categoryText.textContent =
    `Category: ${service.category}`

  const description = document.createElement('p')
  description.textContent = service.description

  wrapper.append(
    title,
    suburb,
    categoryText,
    description
  )

  return wrapper
}

function drawServiceMarkers() {
  if (!map || !serviceLayer) return

  serviceLayer.clearLayers()

  filteredServices.value.forEach(service => {
    const marker = L.circleMarker(
      [service.latitude, service.longitude],
      {
        radius: 8,
        weight: 2,
        fillOpacity: 0.8
      }
    )

    marker.bindPopup(
      createServicePopup(service)
    )

    marker.addTo(serviceLayer)
  })
}

function showFilteredServices() {
  if (
    !map ||
    !filteredServices.value.length
  ) {
    return
  }

  const bounds = L.latLngBounds(
    filteredServices.value.map(service => [
      service.latitude,
      service.longitude
    ])
  )

  map.fitBounds(bounds, {
    padding: [30, 30],
    maxZoom: 13
  })
}

function toRadians(value) {
  return value * Math.PI / 180
}

function distanceInKilometres(
  firstLatitude,
  firstLongitude,
  secondLatitude,
  secondLongitude
) {
  const earthRadiusKm = 6371

  const latitudeDifference =
    toRadians(
      secondLatitude - firstLatitude
    )

  const longitudeDifference =
    toRadians(
      secondLongitude - firstLongitude
    )

  const firstLatitudeRadians =
    toRadians(firstLatitude)

  const secondLatitudeRadians =
    toRadians(secondLatitude)

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitudeRadians) *
      Math.cos(secondLatitudeRadians) *
      Math.sin(longitudeDifference / 2) ** 2

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadiusKm * c
}

function findNearestService(
  latitude,
  longitude
) {
  let closest = null
  let closestDistance = Infinity

  filteredServices.value.forEach(service => {
    const distance =
      distanceInKilometres(
        latitude,
        longitude,
        service.latitude,
        service.longitude
      )

    if (distance < closestDistance) {
      closest = service
      closestDistance = distance
    }
  })

  nearestService.value = closest

  if (!closest) {
    nearestDistance.value = null
    return null
  }

  nearestDistance.value =
    Number(closestDistance.toFixed(1))

  return closest
}

function showUserLocation() {
  if (!navigator.geolocation) {
    locationMessage.value =
      'Geolocation is not supported by this browser.'
    return
  }

  if (!filteredServices.value.length) {
    locationMessage.value =
      'No matching services are available to search.'
    return
  }

  locationMessage.value =
    'Requesting your location...'

  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude =
        position.coords.latitude

      const longitude =
        position.coords.longitude

      userCoordinates.value = {
        latitude,
        longitude
      }

      if (userLayer) {
        userLayer.remove()
      }

      if (routeLayer) {
        routeLayer.remove()
      }

      userLayer = L.circleMarker(
        [latitude, longitude],
        {
          radius: 9,
          weight: 3,
          fillOpacity: 0.9
        }
      )
        .bindPopup('Your current location')
        .addTo(map)

      const closest =
        findNearestService(
          latitude,
          longitude
        )

      if (!closest) {
        locationMessage.value =
          'No nearby matching service could be found.'
        return
      }

      routeLayer = L.polyline(
        [
          [latitude, longitude],
          [
            closest.latitude,
            closest.longitude
          ]
        ],
        {
          weight: 4,
          dashArray: '8 8'
        }
      ).addTo(map)

      const bounds = L.latLngBounds([
        [latitude, longitude],
        [
          closest.latitude,
          closest.longitude
        ]
      ])

      map.fitBounds(bounds, {
        padding: [40, 40]
      })

      locationMessage.value =
        `Nearest matching service: ${closest.name}, ` +
        `approximately ${nearestDistance.value} km away.`
    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        locationMessage.value =
          'Location permission was denied.'
      } else if (
        error.code === error.POSITION_UNAVAILABLE
      ) {
        locationMessage.value =
          'Your location is currently unavailable.'
      } else {
        locationMessage.value =
          'Unable to retrieve your location.'
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  )
}

watch(
  filteredServices,
  () => {
    drawServiceMarkers()

    nearestService.value = null
    nearestDistance.value = null
    locationMessage.value = ''

    if (routeLayer) {
      routeLayer.remove()
      routeLayer = null
    }
  }
)

onMounted(() => {
  map = L.map(mapElement.value, {
    scrollWheelZoom: false
  }).setView(
    [-37.8136, 144.9631],
    10
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  serviceLayer = L.layerGroup()
    .addTo(map)

  drawServiceMarkers()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <section
    id="service-map"
    class="service-map-section"
  >
    <h2>Explore Services on the Map</h2>

    <p>
      Search Circular Melbourne services,
      view their locations, or use your current
      location to find the nearest matching service.
    </p>

    <div class="map-controls">
      <div>
        <label for="map-search">
          Search map services
        </label>

        <input
          id="map-search"
          v-model="search"
          type="search"
          placeholder="Search by name, suburb or category"
        >
      </div>

      <div>
        <label for="map-category">
          Filter map by category
        </label>

        <select
          id="map-category"
          v-model="category"
        >
          <option value="">
            All categories
          </option>

          <option
            v-for="item in categories"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </div>

      <button
        type="button"
        :disabled="!filteredServices.length"
        @click="showFilteredServices"
      >
        Show {{ filteredServices.length }} result(s)
      </button>

      <button
        type="button"
        :disabled="!filteredServices.length"
        @click="showUserLocation"
      >
        Find nearest service
      </button>
    </div>

    <p
      v-if="!filteredServices.length"
      class="form-error"
      role="alert"
    >
      No map services match your search.
    </p>

    <p
      v-if="locationMessage"
      class="map-location-message"
      aria-live="polite"
    >
      {{ locationMessage }}
    </p>

    <p
      v-if="directionsUrl"
    >
      <a
        :href="directionsUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open walking directions to
        {{ nearestService.name }}
      </a>
    </p>

    <div
      ref="mapElement"
      class="service-map"
      role="region"
      aria-label="Interactive map of Circular Melbourne services"
    ></div>

    <p class="map-help">
      Select a map point to view service details.
      Map data © OpenStreetMap contributors.
    </p>
  </section>
</template>

<style scoped>
.service-map-section {
  padding: 24px;
  background: white;
  border: 1px solid #d9e6df;
  border-radius: 12px;
}

.map-controls {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: end;
  margin: 20px 0;
}

.map-controls > div {
  display: grid;
  gap: 8px;
}

.service-map {
  width: 100%;
  height: 480px;
  margin-top: 16px;
  border: 1px solid #a9bbb2;
  border-radius: 10px;
  overflow: hidden;
}

.map-location-message {
  font-weight: 600;
}

.map-help {
  margin-bottom: 0;
  color: #5d756b;
  font-size: 0.9rem;
}

@media (max-width: 767px) {
  .service-map {
    height: 380px;
  }
}
</style>