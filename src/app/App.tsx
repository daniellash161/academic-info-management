import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { seedUsersIfEmpty, seedRequestsIfEmpty, seedCoursesIfEmpty } from "../storage/seed";

export default function App() {
  useEffect(() => {
    seedUsersIfEmpty();
    seedRequestsIfEmpty();
    seedCoursesIfEmpty();
  }, []);

  return <RouterProvider router={router} />;
}