// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);
