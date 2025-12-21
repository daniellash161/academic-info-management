import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

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

import { RegistrationDeadlinesPage } from "../pages/admin/RegistrationDeadlinesPage";
import { RegistrationDeadlineFormPage } from "../pages/admin/RegistrationDeadlineFormPage";

import { HelpPage } from "../pages/admin/HelpPage";

import { LoginPage } from "../pages/auth/LoginPage";

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

      { path: "/admin/contacts", element: <ContactMessagesPage /> },
      { path: "/admin/contacts/:id/edit", element: <ContactMessageFormPage /> },

      { path: "/admin/registration-deadlines", element: <RegistrationDeadlinesPage /> },
      { path: "/admin/registration-deadlines/new", element: <RegistrationDeadlineFormPage /> },
      { path: "/admin/registration-deadlines/:id/edit", element: <RegistrationDeadlineFormPage /> },

      { path: "/admin/help", element: <HelpPage /> },
    ],
  },

  { path: "/help", element: <HelpPage /> },

  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);