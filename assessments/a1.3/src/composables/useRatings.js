import { reactive } from 'vue'

const KEY = 'circularMelbourneRatings'

const ratings = reactive(
  JSON.parse(localStorage.getItem(KEY) || '[]')
)

function getRatings(serviceId, userId) {
  const serviceRatings = ratings.filter(
    (rating) => rating.serviceId === serviceId
  )

  const count = serviceRatings.length
  const total = serviceRatings.reduce(
    (sum, rating) => sum + rating.rating,
    0
  )

  return {
    average: count
      ? Number((total / count).toFixed(1))
      : 0,
    count,
    userRating:
      serviceRatings.find(
        (rating) => rating.userId === userId
      )?.rating ?? 0
  }
}

function submitRating(serviceId, userId, rating) {
  const existing = ratings.find(
    (item) =>
      item.serviceId === serviceId &&
      item.userId === userId
  )

  if (existing) {
    existing.rating = rating
  } else {
    ratings.push({
      serviceId,
      userId,
      rating
    })
  }

  localStorage.setItem(
    KEY,
    JSON.stringify(ratings)
  )
}

export function useRatings() {
  return {
    getRatings,
    submitRating
  }
}