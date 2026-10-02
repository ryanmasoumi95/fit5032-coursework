<script setup>
import { computed, ref } from 'vue'
import services from '../data/services.json'

const item = ref('')

const rules = [
  {
    category: 'E-waste',
    keywords: [
      'battery',
      'batteries',
      'computer',
      'computers',
      'laptop',
      'laptops',
      'phone',
      'phones',
      'mobile',
      'charger',
      'chargers',
      'cable',
      'cables',
      'electronic',
      'electronics',
      'electrical',
      'appliance',
      'appliances'
    ]
  },
  {
    category: 'Clothing',
    keywords: [
      'clothes',
      'clothing',
      'shirt',
      'shirts',
      'pants',
      'jeans',
      'jacket',
      'jackets',
      'shoes',
      'textile',
      'textiles',
      'fabric'
    ]
  },
  {
    category: 'Food waste',
    keywords: [
      'food',
      'scraps',
      'food scraps',
      'vegetable',
      'vegetables',
      'fruit',
      'compost',
      'organic',
      'organics'
    ]
  },
  {
    category: 'Repair',
    keywords: [
      'broken',
      'repair',
      'fix',
      'bike',
      'bicycle',
      'furniture',
      'toaster',
      'lamp',
      'chair'
    ]
  },
  {
    category: 'Reuse',
    keywords: [
      'reuse',
      'reusable',
      'donate',
      'donation',
      'household goods',
      'furniture',
      'table',
      'desk',
      'cupboard'
    ]
  }
]

const recommendation = computed(() => {
  const term = item.value
    .trim()
    .toLowerCase()

  if (!term) {
    return null
  }

  let bestMatch = null
  let bestScore = 0

  rules.forEach(rule => {
    const score = rule.keywords.reduce(
      (total, keyword) =>
        term.includes(keyword)
          ? total + 1
          : total,
      0
    )

    if (score > bestScore) {
      bestScore = score
      bestMatch = rule
    }
  })

  return bestScore > 0
    ? bestMatch
    : null
})

const matchingServices = computed(() => {
  if (!recommendation.value) {
    return []
  }

  return services.filter(
    service =>
      service.category ===
      recommendation.value.category
  )
})

const recommendationMessage = computed(() => {
  if (!item.value.trim()) {
    return ''
  }

  if (!recommendation.value) {
    return (
      'No clear match was found. Try describing the item ' +
      'with words such as battery, clothing, food scraps, ' +
      'broken appliance, or reusable furniture.'
    )
  }

  return (
    `Recommended category: ` +
    `${recommendation.value.category}. ` +
    `${matchingServices.value.length} matching service(s) found.`
  )
})
</script>

<template>
  <section
    id="recycling-guide"
    class="recycling-guide"
    aria-labelledby="recycling-guide-heading"
  >
    <h2 id="recycling-guide-heading">
      Smart Recycling Guide
    </h2>

    <p>
      Not sure where something belongs?
      Describe the item and the guide will suggest
      the most relevant Circular Melbourne service
      category.
    </p>

    <div class="recycling-guide-form">
      <label for="recycling-item">
        What do you want to recycle, repair or reuse?
      </label>

      <input
        id="recycling-item"
        v-model="item"
        type="search"
        placeholder="For example: old laptop or food scraps"
      >
    </div>

    <p
      v-if="recommendationMessage"
      class="recycling-guide-result"
      aria-live="polite"
    >
      {{ recommendationMessage }}
    </p>

    <div
      v-if="matchingServices.length"
      class="recycling-guide-matches"
    >
      <h3>
        Suggested services
      </h3>

      <div class="recycling-guide-grid">
        <article
          v-for="service in matchingServices"
          :key="service.id"
          class="recycling-guide-card"
        >
          <p class="recycling-guide-category">
            {{ service.category }}
          </p>

          <h4>
            {{ service.name }}
          </h4>

          <p>
            {{ service.suburb }}
          </p>

          <p>
            {{ service.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recycling-guide {
  padding: 24px;
  background: white;
  border: 1px solid #d9e6df;
  border-radius: 12px;
}

.recycling-guide h2 {
  margin-top: 0;
}

.recycling-guide-form {
  display: grid;
  gap: 8px;
  max-width: 600px;
  margin-top: 20px;
}

.recycling-guide-form label {
  font-weight: 600;
}

.recycling-guide-result {
  margin: 18px 0 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: #eaf4ef;
  font-weight: 600;
}

.recycling-guide-matches {
  margin-top: 24px;
}

.recycling-guide-matches h3 {
  margin-bottom: 16px;
}

.recycling-guide-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.recycling-guide-card {
  padding: 18px;
  border: 1px solid #d9e6df;
  border-radius: 10px;
  background: #f7faf8;
}

.recycling-guide-card h4 {
  margin: 6px 0 10px;
  font-size: 1.05rem;
}

.recycling-guide-card p {
  margin: 6px 0;
}

.recycling-guide-category {
  color: #1f6f50;
  font-weight: 700;
}

@media (max-width: 767px) {
  .recycling-guide {
    padding: 16px;
  }
}
</style>