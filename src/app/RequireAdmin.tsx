
import { Navigate } from "react-router-dom";

const AUTH_KEY = "csih_auth";

type Props = {
  children: React.ReactNode;
};

export function RequireAdmin({ children }: Props) {
  const raw = localStorage.getItem(AUTH_KEY);

  if (!raw) return <Navigate to="/login" replace />;

  try {
    const auth = JSON.parse(raw) as { role?: string };
    if (auth.role !== "admin") return <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}