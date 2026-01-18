const AUTH_KEY = "csih_auth";

export type AuthState = {
  role: "admin";
  email: string;
  loginAt: string;
};

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("csih_auth");
}
