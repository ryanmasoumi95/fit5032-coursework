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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import db from '../firebase/init'

const isbn = ref(null)
const name = ref('')
const message = ref('')

const addBook = async () => {
  try {
    await addDoc(collection(db, 'books'), {
      isbn: Number(isbn.value),
      name: name.value
    })

    message.value = 'Book added successfully!'

    isbn.value = null
    name.value = ''
  } catch (error) {
    console.error('Error adding book:', error)
    message.value = ''
  }
}
</script>