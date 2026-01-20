import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "./AuthSessionProvider";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { initialized, isAdmin } = useAuthSession();

  if (!initialized) return null;

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
