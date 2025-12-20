import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

import { CandidatesPage } from "../pages/admin/CandidatesPage";
import { RequestsPage } from "../pages/admin/RequestsPage";
import { CoursesPage } from "../pages/admin/CoursesPage";
import { RequirementsPage } from "../pages/admin/RequirementsPage";
import { HelpPage } from "../pages/admin/HelpPage";
import { LoginPage } from "../pages/auth/LoginPage";

function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <p>Drawer + Routes עובדים ✅</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },

  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminHome /> },
      { path: "/admin/candidates", element: <CandidatesPage /> },
      { path: "/admin/requests", element: <RequestsPage /> },
      { path: "/admin/courses", element: <CoursesPage /> },
      { path: "/admin/requirements", element: <RequirementsPage /> },
      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);