import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
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

import { FaqsPage } from "../pages/admin/FaqsPage";
import { FaqFormPage } from "../pages/admin/FaqFormPage";

import { ContactMessagesPage } from "../pages/admin/ContactMessagesPage";
import { ContactMessageFormPage } from "../pages/admin/ContactMessageFormPage";

import { HelpPage } from "../pages/admin/HelpPage";

// Auth
import { LoginPage } from "../pages/auth/LoginPage";

// ✅ Redirect לעריכה ישנה -> חדשה
function RedirectContactEdit() {
  const { id } = useParams();
  return <Navigate to={`/admin/contact-messages/${id}/edit`} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },

  {
    element: <AdminLayout />,
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

      { path: "/admin/faqs", element: <FaqsPage /> },
      { path: "/admin/faqs/new", element: <FaqFormPage /> },
      { path: "/admin/faqs/:id/edit", element: <FaqFormPage /> },

      { path: "/admin/contact-messages", element: <ContactMessagesPage /> },
      { path: "/admin/contact-messages/:id/edit", element: <ContactMessageFormPage /> },

      { path: "/admin/contacts", element: <Navigate to="/admin/contact-messages" replace /> },
      { path: "/admin/contacts/:id/edit", element: <RedirectContactEdit /> },

      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  // public help
  { path: "/help", element: <HelpPage /> },

  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);