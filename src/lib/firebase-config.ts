// Firebase configuration using environment variables
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCyWuTbjmIgO9E1DdriiU7sNNw5xGvslQ4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mydatabase-10917.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mydatabase-10917-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mydatabase-10917",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mydatabase-10917.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "239566975934",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:239566975934:web:df3b94181f7e843224ffef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-H8H0FJDFDQ"
}; 