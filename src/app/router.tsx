import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <p>Header + Layout עובדים ✅</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },

  {
    element: <AdminLayout />,
    children: [{ path: "/admin", element: <AdminHome /> }],
  },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);