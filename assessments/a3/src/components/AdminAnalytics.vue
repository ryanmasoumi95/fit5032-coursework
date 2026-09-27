<script setup>
import { computed, ref } from 'vue'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js'
import {
  Bar,
  Doughnut
} from 'vue-chartjs'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip
)

const props = defineProps({
  services: {
    type: Array,
    required: true
  },
  reports: {
    type: Array,
    required: true
  }
})

const selectedStatus = ref('All')

const reportStatuses = computed(() => [
  'All',
  ...new Set(
    props.reports.map(report => report.status)
  )
])

const filteredReports = computed(() => {
  if (selectedStatus.value === 'All') {
    return props.reports
  }

  return props.reports.filter(
    report =>
      report.status === selectedStatus.value
  )
})

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key]

    counts[value] =
      (counts[value] || 0) + 1

    return counts
  }, {})
}

const statusCounts = computed(() =>
  countBy(props.reports, 'status')
)

const issueTypeCounts = computed(() =>
  countBy(filteredReports.value, 'issueType')
)

const serviceCategoryCounts = computed(() =>
  countBy(props.services, 'category')
)

const newReportCount = computed(
  () => statusCounts.value.New || 0
)

const resolvedReportCount = computed(
  () => statusCounts.value.Resolved || 0
)

const statusChartData = computed(() => ({
  labels: Object.keys(statusCounts.value),
  datasets: [
    {
      label: 'Reports',
      data: Object.values(statusCounts.value)
    }
  ]
}))

const issueTypeChartData = computed(() => ({
  labels: Object.keys(issueTypeCounts.value),
  datasets: [
    {
      label: 'Reports',
      data: Object.values(issueTypeCounts.value)
    }
  ]
}))

const serviceCategoryChartData = computed(() => ({
  labels: Object.keys(serviceCategoryCounts.value),
  datasets: [
    {
      label: 'Services',
      data: Object.values(
        serviceCategoryCounts.value
      )
    }
  ]
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      enabled: true
    }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}
</script>

<template>
  <section
    class="admin-analytics"
    aria-labelledby="analytics-heading"
  >
    <div class="analytics-heading">
      <div>
        <h3 id="analytics-heading">
          Dashboard Analytics
        </h3>

        <p>
          Explore service coverage and reported
          information issues.
        </p>
      </div>
    </div>

    <div class="analytics-summary">
      <article class="analytics-stat">
        <strong>
          {{ services.length }}
        </strong>
        <span>Total services</span>
      </article>

      <article class="analytics-stat">
        <strong>
          {{ reports.length }}
        </strong>
        <span>Total reports</span>
      </article>

      <article class="analytics-stat">
        <strong>
          {{ newReportCount }}
        </strong>
        <span>New reports</span>
      </article>

      <article class="analytics-stat">
        <strong>
          {{ resolvedReportCount }}
        </strong>
        <span>Resolved reports</span>
      </article>
    </div>

    <div class="analytics-filter">
      <label for="analytics-status-filter">
        Filter issue analysis by report status
      </label>

      <select
        id="analytics-status-filter"
        v-model="selectedStatus"
      >
        <option
          v-for="status in reportStatuses"
          :key="status"
          :value="status"
        >
          {{ status }}
        </option>
      </select>

      <p
        class="analytics-filter-summary"
        aria-live="polite"
      >
        Analysing
        {{ filteredReports.length }}
        report(s).
      </p>
    </div>

    <div class="analytics-grid">
      <article class="analytics-chart-card">
        <h4>Reports by status</h4>

        <div class="analytics-chart">
          <Doughnut
            :data="statusChartData"
            :options="doughnutOptions"
            role="img"
            aria-label="Doughnut chart showing reports grouped by status"
          />
        </div>

        <p>
          Hover over chart segments to inspect
          report totals.
        </p>
      </article>

      <article class="analytics-chart-card">
        <h4>Reports by issue type</h4>

        <div class="analytics-chart">
          <Bar
            :data="issueTypeChartData"
            :options="barOptions"
            role="img"
            :aria-label="
              `Bar chart showing issue types for ${selectedStatus} report status`
            "
          />
        </div>

        <p>
          This chart updates when the report status
          filter changes.
        </p>
      </article>

      <article class="analytics-chart-card">
        <h4>Services by category</h4>

        <div class="analytics-chart">
          <Bar
            :data="serviceCategoryChartData"
            :options="barOptions"
            role="img"
            aria-label="Bar chart showing services grouped by category"
          />
        </div>

        <p>
          Compare Circular Melbourne service coverage
          across categories.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-analytics {
  margin-top: 32px;
  padding: 24px;
  background: white;
  border: 1px solid #d9e6df;
  border-radius: 12px;
}

.analytics-heading h3 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}

.analytics-heading p {
  margin: 0;
  color: #5d756b;
}

.analytics-summary {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.analytics-stat {
  padding: 18px;
  border: 1px solid #d9e6df;
  border-radius: 10px;
  background: #f7faf8;
}

.analytics-stat strong {
  display: block;
  margin-bottom: 6px;
  font-size: 1.8rem;
  color: #1f6f50;
}

.analytics-stat span {
  font-weight: 600;
}

.analytics-filter {
  display: grid;
  gap: 8px;
  max-width: 360px;
  margin-bottom: 24px;
}

.analytics-filter label {
  font-weight: 600;
}

.analytics-filter-summary {
  margin: 0;
  color: #5d756b;
}

.analytics-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.analytics-chart-card {
  padding: 18px;
  border: 1px solid #d9e6df;
  border-radius: 10px;
}

.analytics-chart-card h4 {
  margin: 0 0 16px;
  font-size: 1.05rem;
}

.analytics-chart-card p {
  margin: 12px 0 0;
  color: #5d756b;
  font-size: 0.9rem;
}

.analytics-chart {
  position: relative;
  height: 280px;
}

@media (max-width: 767px) {
  .admin-analytics {
    padding: 16px;
  }

  .analytics-chart {
    height: 240px;
  }
}
</style>