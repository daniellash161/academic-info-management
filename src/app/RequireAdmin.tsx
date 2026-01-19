import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthState } from "../pages/auth/auth";
import { useAuthSession } from "./AuthSessionProvider";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { ready } = useAuthSession();

  if (!ready) return null;

  const a = getAuthState();
  const ok = a?.role === "admin";

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
