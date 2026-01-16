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

import { UserLayout } from "./UserLayout";
import { UserHomePage } from "../pages/user/UserHomePage";
import { UserCoursesPage } from "../pages/user/UserCoursesPage";
import { UserRequirementsPage } from "../pages/user/UserRequirementsPage";
import { UserHelpPage } from "../pages/user/UserHelpPage";
import { UserContactPage } from "../pages/user/UserContactPage";
import { UserRequestPage } from "../pages/user/UserRequestPage";
import { UserCourseDetailsPage } from "../pages/user/UserCourseDetailsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/user" replace /> },
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
      { path: "requests/:id/edit", element: <RequestFormPage /> },

      { path: "courses", element: <CoursesPage /> },
      { path: "courses/new", element: <CourseFormPage /> },
      { path: "courses/:id/edit", element: <CourseFormPage /> },

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

  {
    path: "/user",
    element: <UserLayout />,
    children: [
      { index: true, element: <UserHomePage /> },
      { path: "courses", element: <UserCoursesPage /> },
      { path: "courses/:code", element: <UserCourseDetailsPage /> },
      { path: "requirements", element: <UserRequirementsPage /> },
      { path: "help", element: <UserHelpPage /> },
      { path: "contact", element: <UserContactPage /> },
      { path: "request", element: <UserRequestPage /> },
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },

  { path: "/login", element: <LoginPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);
