// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBujBYD6ce7JLI6-Py-tak5dWq99lSpHEk",
  authDomain: "academic-management-syst-357fc.firebaseapp.com",
  projectId: "academic-management-syst-357fc",
  storageBucket: "academic-management-syst-357fc.firebasestorage.app",
  messagingSenderId: "694948752162",
  appId: "1:694948752162:web:424f7d15d76a67db6dd37b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore=getFirestore(app);