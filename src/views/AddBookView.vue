<template>
  <div class="container mt-5">
    <h1 class="mb-4">Add Book</h1>

    <form @submit.prevent="addBook">
      <div class="mb-3">
        <label for="isbn" class="form-label">ISBN</label>
        <input
          id="isbn"
          v-model.number="isbn"
          type="number"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="name" class="form-label">Book Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="form-control"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary">
        Add Book
      </button>
    </form>

    <div
      v-if="message"
      class="alert alert-success mt-3"
      role="alert"
    >
      {{ message }}
    </div>

    <hr class="my-5" />

    <h2 class="mb-3">Books in Firestore</h2>

    <table
      v-if="books.length > 0"
      class="table table-bordered"
    >
      <thead>
        <tr>
          <th>ISBN</th>
          <th>Book Name</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="book in books"
          :key="book.id"
        >
          <td>{{ book.isbn }}</td>
          <td>{{ book.name }}</td>
          <td>
            <button
              class="btn btn-warning btn-sm me-2"
              @click="updateBook(book)"
            >
              Update
            </button>

            <button
              class="btn btn-danger btn-sm"
              @click="deleteBook(book.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>
      No books found in Firestore.
    </p>

    <hr class="my-5" />

    <BookList />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'

import db from '../firebase/init'
import BookList from '../components/BookList.vue'

const isbn = ref(null)
const name = ref('')
const message = ref('')
const books = ref([])

const loadBooks = async () => {
  const querySnapshot = await getDocs(collection(db, 'books'))

  books.value = querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }))
}

const addBook = async () => {
  try {
    await addDoc(collection(db, 'books'), {
      isbn: Number(isbn.value),
      name: name.value
    })

    message.value = 'Book added successfully!'

    isbn.value = null
    name.value = ''

    await loadBooks()
  } catch (error) {
    console.error('Error adding book:', error)
    message.value = ''
  }
}

const updateBook = async (book) => {
  const newIsbn = window.prompt(
    'Enter the new ISBN:',
    book.isbn
  )

  const newName = window.prompt(
    'Enter the new book name:',
    book.name
  )

  if (
    newIsbn === null ||
    newName === null ||
    newName.trim() === ''
  ) {
    return
  }

  try {
    const bookRef = doc(db, 'books', book.id)

    await updateDoc(bookRef, {
      isbn: Number(newIsbn),
      name: newName
    })

    message.value = 'Book updated successfully!'

    await loadBooks()
  } catch (error) {
    console.error('Error updating book:', error)
  }
}

const deleteBook = async (bookId) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this book?'
  )

  if (!confirmed) {
    return
  }

  try {
    await deleteDoc(doc(db, 'books', bookId))

    message.value = 'Book deleted successfully!'

    await loadBooks()
  } catch (error) {
    console.error('Error deleting book:', error)
  }
}

onMounted(() => {
  loadBooks()
})
</script>