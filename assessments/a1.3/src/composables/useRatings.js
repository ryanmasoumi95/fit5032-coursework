import { ref } from 'vue'

const RATINGS_KEY = 'circularMelbourneRatings'

function loadRatings() {
  const savedRatings = localStorage.getItem(RATINGS_KEY)

  if (!savedRatings) {
    return []
  }

  try {
    const parsedRatings = JSON.parse(savedRatings)

    return Array.isArray(parsedRatings)
      ? parsedRatings
      : []
  } catch {
    localStorage.removeItem(RATINGS_KEY)
    return []
  }
}

const ratings = ref(loadRatings())

function saveRatings() {
  localStorage.setItem(
    RATINGS_KEY,
    JSON.stringify(ratings.value)
  )
}

function getServiceRatings(serviceId) {
  return ratings.value.filter(
    (rating) => rating.serviceId === serviceId
  )
}

function getAverageRating(serviceId) {
  const serviceRatings = getServiceRatings(serviceId)

  if (serviceRatings.length === 0) {
    return 0
  }

  const total = serviceRatings.reduce(
    (sum, rating) => sum + rating.rating,
    0
  )

  return Number(
    (total / serviceRatings.length).toFixed(1)
  )
}

function getRatingCount(serviceId) {
  return getServiceRatings(serviceId).length
}

function getUserRating(serviceId, userId) {
  const existingRating = ratings.value.find(
    (rating) =>
      rating.serviceId === serviceId &&
      rating.userId === userId
  )

  return existingRating?.rating ?? 0
}

function submitRating(serviceId, userId, ratingValue) {
  const numericRating = Number(ratingValue)

  if (
    !userId ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return false
  }

  const existingIndex = ratings.value.findIndex(
    (rating) =>
      rating.serviceId === serviceId &&
      rating.userId === userId
  )

  const ratingRecord = {
    serviceId,
    userId,
    rating: numericRating
  }

  if (existingIndex >= 0) {
    ratings.value[existingIndex] = ratingRecord
  } else {
    ratings.value.push(ratingRecord)
  }

  saveRatings()

  return true
}

export function useRatings() {
  return {
    ratings,
    getAverageRating,
    getRatingCount,
    getUserRating,
    submitRating
  }
}