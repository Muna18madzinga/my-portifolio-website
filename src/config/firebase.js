// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWZjOypNT-yHTCes5DNcpwC4bgC082Rrg",
  authDomain: "theoportifolio.firebaseapp.com",
  projectId: "theoportifolio",
  storageBucket: "theoportifolio.firebasestorage.app",
  messagingSenderId: "505630369522",
  appId: "1:505630369522:web:5eb239eea8a2c5b250526b",
  measurementId: "G-NTT17BWH1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and Firestore
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Persistence failed');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('Persistence not supported');
    }
  });

const auth = getAuth(app);

export { db, auth };