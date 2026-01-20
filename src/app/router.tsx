import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";

import { AdminLayout } from "./AdminLayout";
import { UserLayout } from "./UserLayout";
import { RequireAdmin } from "./RequireAdmin";

function lazyNamed<T extends Record<string, any>, K extends keyof T>(
  factory: () => Promise<T>,
  name: K,
) {
  return lazy(async () => {
    const mod = await factory();
    return { default: mod[name] as React.ComponentType<any> };
  });
}

function PageLoader() {
  return (
    <Box sx={{ p: 2 }}>
      <LinearProgress sx={{ borderRadius: 999, height: 6 }} />
    </Box>
  );
}

function withSuspense(el: React.ReactElement) {
  return <Suspense fallback={<PageLoader />}>{el}</Suspense>;
}

const AdminHomePage = lazyNamed(
  () => import("../pages/admin/AdminHomePage"),
  "AdminHomePage",
);

const CandidatesPage = lazyNamed(
  () => import("../pages/admin/CandidatesPage"),
  "CandidatesPage",
);
const CandidateFormPage = lazyNamed(
  () => import("../pages/admin/CandidateFormPage"),
  "CandidateFormPage",
);

const RequestsPage = lazyNamed(
  () => import("../pages/admin/RequestsPage"),
  "RequestsPage",
);
const RequestFormPage = lazyNamed(
  () => import("../pages/admin/RequestFormPage"),
  "RequestFormPage",
);

const CoursesPage = lazyNamed(
  () => import("../pages/admin/CoursesPage"),
  "CoursesPage",
);
const CourseFormPage = lazyNamed(
  () => import("../pages/admin/CourseFormPage"),
  "CourseFormPage",
);

const RequirementsPage = lazyNamed(
  () => import("../pages/admin/RequirementsPage"),
  "RequirementsPage",
);
const RequirementFormPage = lazyNamed(
  () => import("../pages/admin/RequirementFormPage"),
  "RequirementFormPage",
);

const FaqsPage = lazyNamed(() => import("../pages/admin/FaqsPage"), "FaqsPage");
const FaqFormPage = lazyNamed(
  () => import("../pages/admin/FaqFormPage"),
  "FaqFormPage",
);

const ContactMessagesPage = lazyNamed(
  () => import("../pages/admin/ContactMessagesPage"),
  "ContactMessagesPage",
);
const ContactMessageFormPage = lazyNamed(
  () => import("../pages/admin/ContactMessageFormPage"),
  "ContactMessageFormPage",
);

const RegistrationDeadlinesPage = lazyNamed(
  () => import("../pages/admin/RegistrationDeadlinesPage"),
  "RegistrationDeadlinesPage",
);
const RegistrationDeadlineFormPage = lazyNamed(
  () => import("../pages/admin/RegistrationDeadlineFormPage"),
  "RegistrationDeadlineFormPage",
);

const HelpPage = lazyNamed(() => import("../pages/admin/HelpPage"), "HelpPage");

const LoginPage = lazyNamed(
  () => import("../pages/auth/LoginPage"),
  "LoginPage",
);
const SignupPage = lazyNamed(
  () => import("../pages/auth/SignupPage"),
  "SignupPage",
);

const UserHomePage = lazyNamed(
  () => import("../pages/user/UserHomePage"),
  "UserHomePage",
);
const UserCoursesPage = lazyNamed(
  () => import("../pages/user/UserCoursesPage"),
  "UserCoursesPage",
);
const UserRequirementsPage = lazyNamed(
  () => import("../pages/user/UserRequirementsPage"),
  "UserRequirementsPage",
);
const UserHelpPage = lazyNamed(
  () => import("../pages/user/UserHelpPage"),
  "UserHelpPage",
);
const UserContactPage = lazyNamed(
  () => import("../pages/user/UserContactPage"),
  "UserContactPage",
);
const UserRequestPage = lazyNamed(
  () => import("../pages/user/UserRequestPage"),
  "UserRequestPage",
);
const UserCourseDetailsPage = lazyNamed(
  () => import("../pages/user/UserCourseDetailsPage"),
  "UserCourseDetailsPage",
);

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/user" replace /> },

  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: withSuspense(<AdminHomePage />) },

      { path: "candidates", element: withSuspense(<CandidatesPage />) },
      { path: "candidates/new", element: withSuspense(<CandidateFormPage />) },
      {
        path: "candidates/:id/edit",
        element: withSuspense(<CandidateFormPage />),
      },

      { path: "requests", element: withSuspense(<RequestsPage />) },
      { path: "requests/new", element: withSuspense(<RequestFormPage />) },
      { path: "requests/:id/edit", element: withSuspense(<RequestFormPage />) },

      { path: "courses", element: withSuspense(<CoursesPage />) },
      { path: "courses/new", element: withSuspense(<CourseFormPage />) },
      { path: "courses/:id/edit", element: withSuspense(<CourseFormPage />) },

      { path: "requirements", element: withSuspense(<RequirementsPage />) },
      {
        path: "requirements/new",
        element: withSuspense(<RequirementFormPage />),
      },
      {
        path: "requirements/:id/edit",
        element: withSuspense(<RequirementFormPage />),
      },

      { path: "faqs", element: withSuspense(<FaqsPage />) },
      { path: "faqs/new", element: withSuspense(<FaqFormPage />) },
      { path: "faqs/:id/edit", element: withSuspense(<FaqFormPage />) },

      { path: "contacts", element: withSuspense(<ContactMessagesPage />) },
      {
        path: "contacts/:id/edit",
        element: withSuspense(<ContactMessageFormPage />),
      },

      {
        path: "deadlines",
        element: withSuspense(<RegistrationDeadlinesPage />),
      },
      {
        path: "deadlines/new",
        element: withSuspense(<RegistrationDeadlineFormPage />),
      },
      {
        path: "deadlines/:id/edit",
        element: withSuspense(<RegistrationDeadlineFormPage />),
      },

      { path: "help", element: withSuspense(<HelpPage />) },

      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },

  {
    path: "/user",
    element: <UserLayout />,
    children: [
      { index: true, element: withSuspense(<UserHomePage />) },
      { path: "courses", element: withSuspense(<UserCoursesPage />) },
      {
        path: "courses/:code",
        element: withSuspense(<UserCourseDetailsPage />),
      },
      { path: "requirements", element: withSuspense(<UserRequirementsPage />) },
      { path: "help", element: withSuspense(<UserHelpPage />) },
      { path: "contact", element: withSuspense(<UserContactPage />) },
      { path: "request", element: withSuspense(<UserRequestPage />) },
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },

  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/signup", element: withSuspense(<SignupPage />) },

  { path: "*", element: <div style={{ padding: 24 }}>404</div> },
]);
