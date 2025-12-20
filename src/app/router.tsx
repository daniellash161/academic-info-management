import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

// Admin pages
import { AdminHomePage } from "../pages/admin/AdminHomePage";

import { CandidatesPage } from "../pages/admin/CandidatesPage";
import { CandidateFormPage } from "../pages/admin/CandidateFormPage";

import { RequestsPage } from "../pages/admin/RequestsPage";
import { RequestFormPage } from "../pages/admin/RequestFormPage";

import { CoursesPage } from "../pages/admin/CoursesPage";
import { CourseFormPage } from "../pages/admin/CourseFormPage";

import { RequirementsPage } from "../pages/admin/RequirementsPage";
import { RequirementFormPage } from "../pages/admin/RequirementFormPage";

import { HelpPage } from "../pages/admin/HelpPage";

// Auth
import { LoginPage } from "../pages/auth/LoginPage";

export const router = createBrowserRouter([
  // Root -> admin
  { path: "/", element: <Navigate to="/admin" replace /> },

  // Admin layout wrapper (Header + Drawer)
  {
    element: <AdminLayout />,
    children: [
      // ✅ Dashboard
      { path: "/admin", element: <AdminHomePage /> },

      // Candidates
      { path: "/admin/candidates", element: <CandidatesPage /> },
      { path: "/admin/candidates/new", element: <CandidateFormPage /> },
      { path: "/admin/candidates/:id/edit", element: <CandidateFormPage /> },

      // Registration Requests
      { path: "/admin/requests", element: <RequestsPage /> },
      { path: "/admin/requests/new", element: <RequestFormPage /> },
      { path: "/admin/requests/:requestNumber/edit", element: <RequestFormPage /> },

      // Courses
      { path: "/admin/courses", element: <CoursesPage /> },
      { path: "/admin/courses/new", element: <CourseFormPage /> },
      { path: "/admin/courses/:code/edit", element: <CourseFormPage /> },

      // Requirements
      { path: "/admin/requirements", element: <RequirementsPage /> },
      { path: "/admin/requirements/new", element: <RequirementFormPage /> },
      { path: "/admin/requirements/:id/edit", element: <RequirementFormPage /> },

      // Help
      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  // Login (for logout destination)
  { path: "/login", element: <LoginPage /> },

  // Fallback
  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);