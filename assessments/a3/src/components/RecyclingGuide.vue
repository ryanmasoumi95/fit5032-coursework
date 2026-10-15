
<script setup>
import { computed, ref, watch } from 'vue'
import services from '../data/services.json'

const item = ref('')

const cloudAdvice = ref(null)
const cloudLoading = ref(false)
const cloudError = ref('')

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

// Clear previous cloud results when the item changes.
watch(item, () => {
  cloudAdvice.value = null
  cloudError.value = ''
})

// Preserve the existing instant recycling recommendations.
// After a successful cloud request, use the cloud category.
const recommendation = computed(() => {
  const term = item.value.trim().toLowerCase()

  if (!term) {
    return null
  }

  if (cloudAdvice.value) {
    return cloudAdvice.value.category
      ? { category: cloudAdvice.value.category }
      : null
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

// This calls the new E.1 Cloudflare Pages Function.
async function requestCloudAdvice() {
  const requestedItem = item.value.trim()

  if (
    requestedItem.length < 2 ||
    requestedItem.length > 120
  ) {
    cloudError.value =
      'Please enter an item description of 2–120 characters.'
    return
  }

  cloudLoading.value = true
  cloudError.value = ''
  cloudAdvice.value = null

  try {
    const response = await fetch(
      `/api/recycling-advice?item=${encodeURIComponent(requestedItem)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const contentType =
      response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      throw new Error(
        'The cloud advice service is not available here.'
      )
    }

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'Cloud advice could not be loaded.'
      )
    }

    if (
      !result ||
      typeof result.advice !== 'string'
    ) {
      throw new Error('The cloud response is invalid.')
    }

    // Ignore old responses if the visitor has typed a new item.
    if (item.value.trim() === requestedItem) {
      cloudAdvice.value = result
    }
  } catch (error) {
    if (item.value.trim() === requestedItem) {
      cloudError.value =
        'Cloud advice could not be loaded. ' +
        'Local recommendations still work. ' +
        'Please try again on the deployed website.'
    }
  } finally {
    cloudLoading.value = false
  }
}
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

    <form
      class="recycling-guide-form"
      @submit.prevent="requestCloudAdvice"
    >
      <label for="recycling-item">
        What do you want to recycle, repair or reuse?
      </label>

      <input
        id="recycling-item"
        v-model="item"
        type="search"
        placeholder="For example: old laptop or food scraps"
        maxlength="120"
      >

      <button
        type="submit"
        :disabled="cloudLoading || item.trim().length < 2"
      >
        {{
          cloudLoading
            ? 'Getting cloud advice...'
            : 'Get Cloud Recycling Advice'
        }}
      </button>
    </form>

    <!-- Existing instant recommendation remains available. -->
    <p
      v-if="recommendationMessage"
      class="recycling-guide-result"
      aria-live="polite"
    >
      {{ recommendationMessage }}
    </p>

    <!-- New result returned by the Cloudflare Function. -->
    <div
      v-if="cloudAdvice"
      class="recycling-guide-cloud"
      role="status"
      aria-live="polite"
    >
      <h3>Cloud Recycling Advice</h3>

      <p>
        <strong>Item:</strong>
        {{ cloudAdvice.item }}
      </p>

      <p>
        <strong>Category:</strong>
        {{ cloudAdvice.category || 'No clear category found' }}
      </p>

      <p>
        <strong>Advice:</strong>
        {{ cloudAdvice.advice }}
      </p>

      <p class="recycling-guide-source">
        Powered by a Cloudflare Pages Function
      </p>
    </div>

    <p
      v-if="cloudError"
      class="form-error"
      role="alert"
    >
      {{ cloudError }}
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

.recycling-guide-form button {
  justify-self: start;
}

.recycling-guide-result {
  margin: 18px 0 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: #eaf4ef;
  font-weight: 600;
}

.recycling-guide-cloud {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid #c5ddce;
  border-radius: 10px;
  background: #f2faf5;
}

.recycling-guide-cloud h3 {
  margin-top: 0;
  color: #214b38;
}

.recycling-guide-cloud p {
  margin: 10px 0;
}

.recycling-guide-source {
  font-size: 0.85rem;
  color: #52685a;
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
