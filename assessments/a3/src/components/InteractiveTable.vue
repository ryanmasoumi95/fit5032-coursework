<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  emptyMessage: {
    type: String,
    default: 'No matching records found.'
  }
})

const PAGE_SIZE = 10

const globalSearch = ref('')
const columnFilters = reactive({})
const sortKey = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)

function textValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function isSearchable(column) {
  return column.searchable !== false
}

function isSortable(column) {
  return column.sortable !== false
}

const filteredRows = computed(() => {
  const globalTerm =
    globalSearch.value.trim().toLowerCase()

  return props.rows.filter((row) => {
    const matchesGlobal =
      !globalTerm ||
      props.columns
        .filter(isSearchable)
        .some((column) =>
          textValue(row[column.key])
            .toLowerCase()
            .includes(globalTerm)
        )

    if (!matchesGlobal) {
      return false
    }

    return props.columns.every((column) => {
      if (!isSearchable(column)) {
        return true
      }

      const filter =
        textValue(columnFilters[column.key])
          .trim()
          .toLowerCase()

      if (!filter) {
        return true
      }

      return textValue(row[column.key])
        .toLowerCase()
        .includes(filter)
    })
  })
})

const sortedRows = computed(() => {
  const rows = [...filteredRows.value]

  if (!sortKey.value) {
    return rows
  }

  return rows.sort((firstRow, secondRow) => {
    const firstValue =
      textValue(firstRow[sortKey.value])

    const secondValue =
      textValue(secondRow[sortKey.value])

    const result = firstValue.localeCompare(
      secondValue,
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    )

    return sortDirection.value === 'asc'
      ? result
      : -result
  })
})

const pageCount = computed(() =>
  Math.max(
    1,
    Math.ceil(sortedRows.value.length / PAGE_SIZE)
  )
)

const paginatedRows = computed(() => {
  const start =
    (currentPage.value - 1) * PAGE_SIZE

  return sortedRows.value.slice(
    start,
    start + PAGE_SIZE
  )
})

const firstVisibleRow = computed(() => {
  if (!sortedRows.value.length) {
    return 0
  }

  return (
    (currentPage.value - 1) * PAGE_SIZE + 1
  )
})

const lastVisibleRow = computed(() =>
  Math.min(
    currentPage.value * PAGE_SIZE,
    sortedRows.value.length
  )
)

watch(
  [globalSearch, columnFilters],
  () => {
    currentPage.value = 1
  },
  {
    deep: true
  }
)

watch(pageCount, (newPageCount) => {
  if (currentPage.value > newPageCount) {
    currentPage.value = newPageCount
  }
})

function sortBy(column) {
  if (!isSortable(column)) {
    return
  }

  if (sortKey.value === column.key) {
    sortDirection.value =
      sortDirection.value === 'asc'
        ? 'desc'
        : 'asc'
  } else {
    sortKey.value = column.key
    sortDirection.value = 'asc'
  }

  currentPage.value = 1
}

function ariaSort(column) {
  if (sortKey.value !== column.key) {
    return 'none'
  }

  return sortDirection.value === 'asc'
    ? 'ascending'
    : 'descending'
}

function sortIndicator(column) {
  if (sortKey.value !== column.key) {
    return ''
  }

  return sortDirection.value === 'asc'
    ? ' ▲'
    : ' ▼'
}

function goToFirstPage() {
  currentPage.value = 1
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function goToNextPage() {
  if (currentPage.value < pageCount.value) {
    currentPage.value += 1
  }
}

function goToLastPage() {
  currentPage.value = pageCount.value
}
</script>

<template>
  <section class="interactive-table">
    <h3>{{ caption }}</h3>

    <label class="table-global-search">
      <span>Search all columns</span>
      <input
        v-model="globalSearch"
        type="search"
        placeholder="Search this table"
      >
    </label>

    <div class="table-scroll">
      <table>
        <caption class="sr-only">
          {{ caption }}
        </caption>

        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="
                isSortable(column)
                  ? ariaSort(column)
                  : undefined
              "
            >
              <button
                v-if="isSortable(column)"
                type="button"
                class="table-sort-button"
                @click="sortBy(column)"
              >
                {{ column.label }}
                {{ sortIndicator(column) }}
              </button>

              <span v-else>
                {{ column.label }}
              </span>
            </th>
          </tr>

          <tr class="table-filter-row">
            <th
              v-for="column in columns"
              :key="`${column.key}-filter`"
              scope="col"
            >
              <input
                v-if="isSearchable(column)"
                v-model="columnFilters[column.key]"
                type="search"
                :aria-label="
                  `Search ${column.label} column`
                "
                :placeholder="
                  `Search ${column.label}`
                "
              >

              <span
                v-else
                class="table-filter-unavailable"
              >
                —
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, index) in paginatedRows"
            :key="row.id ?? index"
          >
            <td
              v-for="column in columns"
              :key="column.key"
            >
              {{ row[column.key] }}
            </td>
          </tr>

          <tr v-if="!paginatedRows.length">
            <td
              :colspan="columns.length"
              class="table-empty"
            >
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <p aria-live="polite">
        Showing
        {{ firstVisibleRow }}–{{ lastVisibleRow }}
        of {{ sortedRows.length }} matching rows.
        10 rows per page.
      </p>

      <div
        class="table-pagination"
        aria-label="Table pagination"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="goToFirstPage"
        >
          First
        </button>

        <button
          type="button"
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
        >
          Previous
        </button>

        <span>
          Page {{ currentPage }} of {{ pageCount }}
        </span>

        <button
          type="button"
          :disabled="currentPage === pageCount"
          @click="goToNextPage"
        >
          Next
        </button>

        <button
          type="button"
          :disabled="currentPage === pageCount"
          @click="goToLastPage"
        >
          Last
        </button>
      </div>
    </div>
  </section>
</template>