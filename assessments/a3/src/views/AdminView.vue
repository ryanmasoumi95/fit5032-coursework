<script setup>
import InteractiveTable from '../components/InteractiveTable.vue'
import reports from '../data/reports.json'
import services from '../data/services.json'

const serviceColumns = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'name',
    label: 'Service name'
  },
  {
    key: 'suburb',
    label: 'Suburb'
  },
  {
    key: 'category',
    label: 'Category'
  },
  {
    key: 'description',
    label: 'Description'
  }
]

const reportColumns = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'serviceName',
    label: 'Service name'
  },
  {
    key: 'issueType',
    label: 'Issue type'
  },
  {
    key: 'reporterEmail',
    label: 'Reporter email'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'submittedAt',
    label: 'Submitted'
  }
]
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
  >
    <h2>Admin Dashboard</h2>

    <p>
      Review Circular Melbourne service and report data.
    </p>

    <InteractiveTable
      :rows="services"
      :columns="serviceColumns"
      caption="Services"
      empty-message="No services match your search."
    />

    <InteractiveTable
      :rows="reports"
      :columns="reportColumns"
      caption="Incorrect Information Reports"
      empty-message="No reports match your search."
    />
  </main>
</template>