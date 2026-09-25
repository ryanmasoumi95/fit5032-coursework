import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCUduoC0gu05JA84wuXIgyCv1Z5jCM0HU8',
  authDomain: 'circular-melbourne-a3-25152548.firebaseapp.com',
  projectId: 'circular-melbourne-a3-25152548',
  storageBucket: 'circular-melbourne-a3-25152548.firebasestorage.app',
  messagingSenderId: '50539120100',
  appId: '1:50539120100:web:8d171fed6c6609ca8ef3f1'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)