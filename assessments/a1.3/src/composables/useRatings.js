import { reactive } from 'vue'

const KEY = 'circularMelbourneRatings'

const ratings = reactive(
  JSON.parse(localStorage.getItem(KEY) || '[]')
)

// Calculate the average, count and current user's rating for one service.
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
  // Update an existing rating so each user has only one rating per service.
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