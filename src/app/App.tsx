import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import {
  seedUsersIfEmpty,
  seedRequestsIfEmpty,
  seedCoursesIfEmpty,
  seedRequirementsIfEmpty,
} from "../storage/seed";

export default function App() {
  useEffect(() => {
    seedUsersIfEmpty();
    seedRequestsIfEmpty();
    seedCoursesIfEmpty();
    seedRequirementsIfEmpty();
  }, []);

  return <RouterProvider router={router} />;
}