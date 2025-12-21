// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { runSeed } from "../storage/seed";

export default function App() {
  useEffect(() => {
    try {
      runSeed();
    } catch (e) {
      console.error("runSeed failed", e);
    }
  }, []);

  return <RouterProvider router={router} />;
}