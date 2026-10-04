<script setup>
import { computed } from 'vue'
import services from '../data/services.json'
import { useServiceComparison } from '../composables/useServiceComparison'

const {
  comparedServiceIds,
  comparedServiceCount,
  removeComparedService,
  clearComparison
} = useServiceComparison()

const comparedServices = computed(() =>
  comparedServiceIds.value
    .map(serviceId =>
      services.find(
        service => service.id === serviceId
      )
    )
    .filter(Boolean)
)

const comparisonReady = computed(
  () => comparedServiceCount.value >= 2
)
</script>

<template>
  <section
    id="service-comparison"
    class="service-comparison"
    aria-labelledby="service-comparison-heading"
  >
    <div class="comparison-heading">
      <div>
        <h2 id="service-comparison-heading">
          Compare Services
        </h2>

        <p>
          Select up to three services to compare
          their category, suburb and service details
          side by side.
        </p>
      </div>

      <div class="comparison-count">
        <strong>
          {{ comparedServiceCount }}
        </strong>

        <span>
          of 3 selected
        </span>
      </div>
    </div>

    <p
      v-if="!comparedServiceCount"
      class="comparison-empty"
    >
      No services selected for comparison yet.
      Use the Compare button on a service card
      to add one.
    </p>

    <template v-else>
      <div class="comparison-actions">
        <button
          type="button"
          class="secondary-button"
          @click="clearComparison"
        >
          Clear comparison
        </button>
      </div>

      <p
        v-if="!comparisonReady"
        class="comparison-help"
        aria-live="polite"
      >
        Select at least one more service to compare
        them side by side.
      </p>

      <div
        v-if="comparisonReady"
        class="comparison-table-scroll"
      >
        <table class="comparison-table">
          <caption class="sr-only">
            Comparison of selected Circular Melbourne services
          </caption>

          <thead>
            <tr>
              <th scope="col">
                Detail
              </th>

              <th
                v-for="service in comparedServices"
                :key="service.id"
                scope="col"
              >
                <div class="comparison-service-heading">
                  <span>
                    {{ service.name }}
                  </span>

                  <button
                    type="button"
                    class="comparison-remove-button"
                    :aria-label="
                      `Remove ${service.name} from comparison`
                    "
                    @click="
                      removeComparedService(service.id)
                    "
                  >
                    Remove
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th scope="row">
                Category
              </th>

              <td
                v-for="service in comparedServices"
                :key="`${service.id}-category`"
              >
                {{ service.category }}
              </td>
            </tr>

            <tr>
              <th scope="row">
                Suburb
              </th>

              <td
                v-for="service in comparedServices"
                :key="`${service.id}-suburb`"
              >
                {{ service.suburb }}
              </td>
            </tr>

            <tr>
              <th scope="row">
                Description
              </th>

              <td
                v-for="service in comparedServices"
                :key="`${service.id}-description`"
              >
                {{ service.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.service-comparison {
  padding: 24px;
  background: white;
  border: 1px solid #d9e6df;
  border-radius: 12px;
}

.comparison-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.comparison-heading h2 {
  margin: 0 0 8px;
}

.comparison-heading p {
  margin: 0;
  color: #5d756b;
}

.comparison-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px 16px;
  border: 1px solid #d9e6df;
  border-radius: 10px;
  background: #f7faf8;
  white-space: nowrap;
}

.comparison-count strong {
  color: #1f6f50;
  font-size: 1.4rem;
}

.comparison-empty,
.comparison-help {
  margin: 20px 0 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: #f7faf8;
  color: #5d756b;
}

.comparison-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.secondary-button {
  background: #d9e6df;
  color: #173f32;
}

.comparison-table-scroll {
  width: 100%;
  margin-top: 20px;
  overflow-x: auto;
  border: 1px solid #d9e6df;
  border-radius: 10px;
}

.comparison-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #e3ece7;
}

.comparison-table thead th {
  background: #1f6f50;
  color: white;
}

.comparison-table tbody th {
  width: 140px;
  background: #eaf4ef;
}

.comparison-table tbody tr:last-child th,
.comparison-table tbody tr:last-child td {
  border-bottom: 0;
}

.comparison-service-heading {
  display: grid;
  gap: 10px;
}

.comparison-remove-button {
  padding: 6px 10px;
  background: white;
  color: #173f32;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .service-comparison {
    padding: 16px;
  }

  .comparison-heading {
    flex-direction: column;
  }

  .comparison-count {
    width: 100%;
  }
}
</style>