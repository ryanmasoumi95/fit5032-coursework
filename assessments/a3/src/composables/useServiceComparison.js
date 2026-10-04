import { computed, ref } from 'vue'

const MAX_COMPARISON_SERVICES = 3

const comparedServiceIds = ref([])

function isServiceCompared(serviceId) {
  return comparedServiceIds.value.includes(
    Number(serviceId)
  )
}

function toggleComparedService(serviceId) {
  const numericId = Number(serviceId)

  if (isServiceCompared(numericId)) {
    comparedServiceIds.value =
      comparedServiceIds.value.filter(
        id => id !== numericId
      )

    return true
  }

  if (
    comparedServiceIds.value.length >=
    MAX_COMPARISON_SERVICES
  ) {
    return false
  }

  comparedServiceIds.value = [
    ...comparedServiceIds.value,
    numericId
  ]

  return true
}

function removeComparedService(serviceId) {
  const numericId = Number(serviceId)

  comparedServiceIds.value =
    comparedServiceIds.value.filter(
      id => id !== numericId
    )
}

function clearComparison() {
  comparedServiceIds.value = []
}

const comparedServiceCount = computed(
  () => comparedServiceIds.value.length
)

const comparisonIsFull = computed(
  () =>
    comparedServiceIds.value.length >=
    MAX_COMPARISON_SERVICES
)

export function useServiceComparison() {
  return {
    comparedServiceIds,
    comparedServiceCount,
    comparisonIsFull,
    isServiceCompared,
    toggleComparedService,
    removeComparedService,
    clearComparison
  }
}