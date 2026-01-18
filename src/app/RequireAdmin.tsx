import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AUTH_KEY = "csih_auth";

type AuthState = {
  role: "admin" | "user";
  email: string;
  loginAt: string;
};

function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (!parsed || typeof parsed !== "object") return null;

    if (
      (parsed.role !== "admin" && parsed.role !== "user") ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return {
      role: parsed.role,
      email: parsed.email,
      loginAt: String(parsed.loginAt ?? ""),
    };
  } catch {
    return null;
  }
}

export function RequireAdmin({ children }: { children: ReactElement }) {
  const location = useLocation();
  const auth = getAuth();

  if (!auth || auth.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
