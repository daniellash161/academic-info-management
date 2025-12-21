// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import {
  seedUsersIfEmpty,
  seedRequestsIfEmpty,
  seedCoursesIfEmpty,
  seedRequirementsIfEmpty,
  seedFaqsIfEmpty,
  seedContactsIfEmpty,
} from "../storage/seed";

export default function App() {
  useEffect(() => {
    seedUsersIfEmpty();
    seedRequestsIfEmpty();
    seedCoursesIfEmpty();
    seedRequirementsIfEmpty();
    seedFaqsIfEmpty();
    seedContactsIfEmpty();
  }, []);

  return <RouterProvider router={router} />;
}