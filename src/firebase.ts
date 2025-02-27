// firebase.ts - Updated with persistence
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrdWlx57qNJYKga83HkTKRqgW-7VQ5wCc",
  authDomain: "mwitterv2.firebaseapp.com",
  projectId: "mwitterv2",
  storageBucket: "mwitterv2.firebasestorage.app",
  messagingSenderId: "928036191033",
  appId: "1:928036191033:web:a30382d3d1b42866ba86e8",
  measurementId: "G-0WS67PZBB4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Auth persistence set to LOCAL
    console.log("Firebase auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Debug logging for auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("User is signed out");
  }
});