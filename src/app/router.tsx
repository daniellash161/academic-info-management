import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { RequireAdmin } from "./RequireAdmin";

import { AdminHomePage } from "../pages/admin/AdminHomePage";

import { CandidatesPage } from "../pages/admin/CandidatesPage";
import { CandidateFormPage } from "../pages/admin/CandidateFormPage";

import { RequestsPage } from "../pages/admin/RequestsPage";
import { RequestFormPage } from "../pages/admin/RequestFormPage";

import { CoursesPage } from "../pages/admin/CoursesPage";
import { CourseFormPage } from "../pages/admin/CourseFormPage";

import { RequirementsPage } from "../pages/admin/RequirementsPage";
import { RequirementFormPage } from "../pages/admin/RequirementFormPage";

import { AnnouncementsPage } from "../pages/admin/AnnouncementsPage";
import { AnnouncementFormPage } from "../pages/admin/AnnouncementFormPage";

import { DocumentsPage } from "../pages/admin/DocumentsPage";
import { DocumentFormPage } from "../pages/admin/DocumentFormPage";

import { HelpPage } from "../pages/admin/HelpPage";

import { LoginPage } from "../pages/auth/LoginPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },

  {
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { path: "/admin", element: <AdminHomePage /> },

      { path: "/admin/candidates", element: <CandidatesPage /> },
      { path: "/admin/candidates/new", element: <CandidateFormPage /> },
      { path: "/admin/candidates/:id/edit", element: <CandidateFormPage /> },

      { path: "/admin/requests", element: <RequestsPage /> },
      { path: "/admin/requests/new", element: <RequestFormPage /> },
      { path: "/admin/requests/:requestNumber/edit", element: <RequestFormPage /> },

      { path: "/admin/courses", element: <CoursesPage /> },
      { path: "/admin/courses/new", element: <CourseFormPage /> },
      { path: "/admin/courses/:code/edit", element: <CourseFormPage /> },

      { path: "/admin/requirements", element: <RequirementsPage /> },
      { path: "/admin/requirements/new", element: <RequirementFormPage /> },
      { path: "/admin/requirements/:id/edit", element: <RequirementFormPage /> },

      { path: "/admin/announcements", element: <AnnouncementsPage /> },
      { path: "/admin/announcements/new", element: <AnnouncementFormPage /> },
      { path: "/admin/announcements/:id/edit", element: <AnnouncementFormPage /> },

      { path: "/admin/documents", element: <DocumentsPage /> },
      { path: "/admin/documents/new", element: <DocumentFormPage /> },
      { path: "/admin/documents/:id/edit", element: <DocumentFormPage /> },

      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);