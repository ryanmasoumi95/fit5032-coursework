// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyc4--zHxRbKGdUNcG2_-gArDxmUxOFTetU",
  authDomain: "fit5032-a09e2.firebaseapp.com",
  projectId: "fit5032-a09e2",
  storageBucket: "fit5032-a09e2.firebasestorage.app",
  messagingSenderId: "173023556271",
  appId: "1:173023556271:web:6752635d1a984fb50c1a5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export default db;