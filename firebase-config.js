// Paste your Firebase project's config object here.
// Firebase console → Project settings → General → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqopkkU7hFyRaGofugHv3ZBQI_N_DTCXU",
  authDomain: "internal-lighthouse.firebaseapp.com",
  projectId: "internal-lighthouse",
  storageBucket: "internal-lighthouse.firebasestorage.app",
  messagingSenderId: "1047383157745",
  appId: "1:1047383157745:web:6099bcf95143dea73db250",
  measurementId: "G-L4E208H9ZE",
};

// Initialize Firebase (using the compat SDK — simplest to drop into a
// plain HTML/JS site with no build step)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
