import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyBujBYD6ce7JLI6-Py-tak5dWq99lSpHEk",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "academic-management-syst-357fc.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "academic-management-syst-357fc",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "academic-management-syst-357fc.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "694948752162",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:694948752162:web:424f7d15d76a67db6dd37b",
};

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

for (const k of requiredKeys) {
  const v = firebaseConfig[k];
  if (!v || String(v).trim() === "") {
    throw new Error(`Missing Firebase config: ${k}`);
  }
}

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);