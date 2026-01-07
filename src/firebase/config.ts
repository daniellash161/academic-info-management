import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const REQUIRED_ENVS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENVS)[number];

function env(name: RequiredEnvKey): string {
  return import.meta.env[name] ?? "";
}

const missing = REQUIRED_ENVS.filter((k) => !env(k));

if (missing.length) {
  console.error("[FIREBASE CONFIG] Missing env vars:", missing);

 
  console.error("[FIREBASE CONFIG] Loaded values (masked):", {
    VITE_FIREBASE_API_KEY: env("VITE_FIREBASE_API_KEY") ? "OK" : "",
    VITE_FIREBASE_AUTH_DOMAIN: env("VITE_FIREBASE_AUTH_DOMAIN"),
    VITE_FIREBASE_PROJECT_ID: env("VITE_FIREBASE_PROJECT_ID"),
    VITE_FIREBASE_STORAGE_BUCKET: env("VITE_FIREBASE_STORAGE_BUCKET"),
    VITE_FIREBASE_MESSAGING_SENDER_ID: env("VITE_FIREBASE_MESSAGING_SENDER_ID") ? "OK" : "",
    VITE_FIREBASE_APP_ID: env("VITE_FIREBASE_APP_ID") ? "OK" : "",
  });

  throw new Error(`Firebase env missing: ${missing.join(", ")}`);
}

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
};

export const app = initializeApp(firebaseConfig);

export const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});