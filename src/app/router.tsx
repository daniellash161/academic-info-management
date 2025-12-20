import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Header } from "../components/Header";

function AdminLayout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

function AdminHome() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Home</h1>
      <p>Header עובד ✅</p>
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