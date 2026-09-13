<template>
  <div class="mt-5">
    <h2>Firestore Query Results</h2>

    <p class="text-muted">
      Showing books where ISBN is greater than 1000,
      ordered by ISBN, limited to 5 results.
    </p>

    <table
      v-if="books.length > 0"
      class="table table-bordered"
    >
      <thead>
        <tr>
          <th>ISBN</th>
          <th>Book Name</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="book in books"
          :key="book.id"
        >
          <td>{{ book.isbn }}</td>
          <td>{{ book.name }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>
      No matching books found.
    </p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from 'firebase/firestore'

import db from '../firebase/init'

const books = ref([])

const loadQueryResults = async () => {
  const booksRef = collection(db, 'books')

  const booksQuery = query(
    booksRef,
    where('isbn', '>', 1000),
    orderBy('isbn', 'asc'),
    limit(5)
  )

  const querySnapshot = await getDocs(booksQuery)

  books.value = querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }))
}

onMounted(() => {
  loadQueryResults()
})
</script>