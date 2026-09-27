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
const exportMessage = ref('')
const exportingPdf = ref(false)

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
    exportMessage.value = ''
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
  exportMessage.value = ''
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

function exportFileName(extension) {
  const baseName = props.caption
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${baseName || 'export'}.${extension}`
}

function csvValue(value) {
  const text = textValue(value)
    .replaceAll('"', '""')

  return `"${text}"`
}

function exportCsv() {
  if (!sortedRows.value.length) {
    return
  }

  const header = props.columns
    .map(column => csvValue(column.label))
    .join(',')

  const body = sortedRows.value
    .map(row =>
      props.columns
        .map(column => csvValue(row[column.key]))
        .join(',')
    )
    .join('\r\n')

  const csv = `\uFEFF${header}\r\n${body}`

  const blob = new Blob(
    [csv],
    {
      type: 'text/csv;charset=utf-8;'
    }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = exportFileName('csv')

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)

  exportMessage.value =
    `Exported ${sortedRows.value.length} matching row(s) as CSV.`
}

async function exportPdf() {
  if (
    !sortedRows.value.length ||
    exportingPdf.value
  ) {
    return
  }

  exportingPdf.value = true
  exportMessage.value = 'Preparing PDF export...'

  try {
    const [
      { jsPDF },
      { autoTable }
    ] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const pdfDocument = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    pdfDocument.setFontSize(16)
    pdfDocument.text(props.caption, 14, 15)

    pdfDocument.setFontSize(10)
    pdfDocument.text(
      `${sortedRows.value.length} matching row(s) exported`,
      14,
      22
    )

    autoTable(pdfDocument, {
      startY: 28,
      head: [
        props.columns.map(column => column.label)
      ],
      body: sortedRows.value.map(row =>
        props.columns.map(column =>
          textValue(row[column.key])
        )
      ),
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fontStyle: 'bold'
      },
      margin: {
        left: 10,
        right: 10
      }
    })

    pdfDocument.save(
      exportFileName('pdf')
    )

    exportMessage.value =
      `Exported ${sortedRows.value.length} matching row(s) as PDF.`
  } catch (error) {
    console.error('PDF export failed:', error)

    exportMessage.value =
      'Unable to export the table as PDF.'
  } finally {
    exportingPdf.value = false
  }
}
</script>

<template>
  <section class="interactive-table">
    <div class="table-heading-row">
      <h3>{{ caption }}</h3>

      <div
        class="table-export-actions"
        aria-label="Table export options"
      >
        <button
          type="button"
          :disabled="!sortedRows.length"
          @click="exportCsv"
        >
          Export CSV
        </button>

        <button
          type="button"
          :disabled="
            !sortedRows.length ||
            exportingPdf
          "
          @click="exportPdf"
        >
          {{
            exportingPdf
              ? 'Preparing PDF...'
              : 'Export PDF'
          }}
        </button>
      </div>
    </div>

    <p
      v-if="exportMessage"
      class="form-success"
      role="status"
    >
      {{ exportMessage }}
    </p>

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