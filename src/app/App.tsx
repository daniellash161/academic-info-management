import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { seedUsersIfEmpty, seedRequestsIfEmpty } from "../storage/seed";

export default function App() {
  useEffect(() => {
    seedUsersIfEmpty();
    seedRequestsIfEmpty();
  }, []);

  return <RouterProvider router={router} />;
}