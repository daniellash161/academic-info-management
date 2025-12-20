import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

// Admin pages
import { CandidatesPage } from "../pages/admin/CandidatesPage";
import { CandidateFormPage } from "../pages/admin/CandidateFormPage";

import { RequestsPage } from "../pages/admin/RequestsPage";
import { RequestFormPage } from "../pages/admin/RequestFormPage";

import { CoursesPage } from "../pages/admin/CoursesPage";
import { RequirementsPage } from "../pages/admin/RequirementsPage";
import { HelpPage } from "../pages/admin/HelpPage";

// Auth
import { LoginPage } from "../pages/auth/LoginPage";

/**
 * מסך בית מנהל (placeholder)
 */
function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <p>Routes ✅</p>
    </div>
  );
}

export const router = createBrowserRouter([
  // Root -> admin
  { path: "/", element: <Navigate to="/admin" replace /> },

  // Admin layout wrapper (Header + Drawer)
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminHome /> },

      // Candidates
      { path: "/admin/candidates", element: <CandidatesPage /> },
      { path: "/admin/candidates/new", element: <CandidateFormPage /> },
      { path: "/admin/candidates/:id/edit", element: <CandidateFormPage /> },

      // Registration Requests
      { path: "/admin/requests", element: <RequestsPage /> },
      { path: "/admin/requests/new", element: <RequestFormPage /> },
      {
        path: "/admin/requests/:requestNumber/edit",
        element: <RequestFormPage />,
      },

      // Other sections
      { path: "/admin/courses", element: <CoursesPage /> },
      { path: "/admin/requirements", element: <RequirementsPage /> },
      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  // Login (for "logout" link)
  { path: "/login", element: <LoginPage /> },

  // Fallback
  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);