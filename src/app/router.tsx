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
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHomePage /> },

      { path: "candidates", element: <CandidatesPage /> },
      { path: "candidates/new", element: <CandidateFormPage /> },
      { path: "candidates/:id/edit", element: <CandidateFormPage /> },

      { path: "requests", element: <RequestsPage /> },
      { path: "requests/new", element: <RequestFormPage /> },
      { path: "requests/:requestNumber/edit", element: <RequestFormPage /> },

      { path: "courses", element: <CoursesPage /> },
      { path: "courses/new", element: <CourseFormPage /> },
      { path: "courses/:code/edit", element: <CourseFormPage /> },

      { path: "requirements", element: <RequirementsPage /> },
      { path: "requirements/new", element: <RequirementFormPage /> },
      { path: "requirements/:id/edit", element: <RequirementFormPage /> },

      { path: "faqs", element: <FaqsPage /> },
      { path: "faqs/new", element: <FaqFormPage /> },
      { path: "faqs/:id/edit", element: <FaqFormPage /> },

      { path: "contacts", element: <ContactMessagesPage /> },
      { path: "contacts/:id/edit", element: <ContactMessageFormPage /> },

      { path: "deadlines", element: <RegistrationDeadlinesPage /> },
      { path: "deadlines/new", element: <RegistrationDeadlineFormPage /> },
      { path: "deadlines/:id/edit", element: <RegistrationDeadlineFormPage /> },

      { path: "help", element: <HelpPage /> },

      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },

  { path: "/help", element: <HelpPage /> },
  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);