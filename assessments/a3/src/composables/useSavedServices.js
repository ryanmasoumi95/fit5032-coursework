import { computed, ref } from 'vue'

const STORAGE_KEY = 'savedServiceIds'

function loadSavedServiceIds() {
  try {
    const storedValue =
      localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map(Number)
      .filter(Number.isInteger)
  } catch {
    return []
  }
}

const savedServiceIds = ref(
  loadSavedServiceIds()
)

function persistSavedServices() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(savedServiceIds.value)
  )
}

function isServiceSaved(serviceId) {
  return savedServiceIds.value.includes(
    Number(serviceId)
  )
}

function toggleSavedService(serviceId) {
  const numericId = Number(serviceId)

  if (isServiceSaved(numericId)) {
    savedServiceIds.value =
      savedServiceIds.value.filter(
        id => id !== numericId
      )
  } else {
    savedServiceIds.value = [
      ...savedServiceIds.value,
      numericId
    ]
  }

  persistSavedServices()
}

function clearSavedServices() {
  savedServiceIds.value = []
  persistSavedServices()
}

const savedServiceCount = computed(
  () => savedServiceIds.value.length
)

export function useSavedServices() {
  return {
    savedServiceIds,
    savedServiceCount,
    isServiceSaved,
    toggleSavedService,
    clearSavedServices
  }
}