import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { seedUsersIfEmpty } from "../storage/seed";

export default function App() {
  useEffect(() => {
    seedUsersIfEmpty();
  }, []);

  return <RouterProvider router={router} />;
}