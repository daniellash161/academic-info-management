import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

// Admin pages
import { CandidatesPage } from "../pages/admin/CandidatesPage";
import { CandidateFormPage } from "../pages/admin/CandidateFormPage";
import { RequestsPage } from "../pages/admin/RequestsPage";
import { CoursesPage } from "../pages/admin/CoursesPage";
import { RequirementsPage } from "../pages/admin/RequirementsPage";
import { HelpPage } from "../pages/admin/HelpPage";

// Auth
import { LoginPage } from "../pages/auth/LoginPage";


function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <p>Dashboard placeholder ✅</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },

  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminHome /> },

      // Candidates
      { path: "/admin/candidates", element: <CandidatesPage /> },
      { path: "/admin/candidates/new", element: <CandidateFormPage /> },
      { path: "/admin/candidates/:id/edit", element: <CandidateFormPage /> },

      { path: "/admin/requests", element: <RequestsPage /> },
      { path: "/admin/courses", element: <CoursesPage /> },
      { path: "/admin/requirements", element: <RequirementsPage /> },
      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  // Login / logout destination
  { path: "/login", element: <LoginPage /> },

  // fallback
  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);