import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/config";
import { clearAuth, getAuthState, AUTH_KEY, type AppAuth } from "./auth";

type AuthCtxValue = {
  initialized: boolean;
  authState: AppAuth | null;
  isAdmin: boolean;
};

const AuthSessionContext = createContext<AuthCtxValue>({
  initialized: false,
  authState: null,
  isAdmin: false,
});

async function resolveAdminAuth(user: User): Promise<AppAuth | null> {
  const ref = doc(firestore, "admin_users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data: any = snap.data();
  if (data?.role !== "admin") return null;

  const a: AppAuth = {
    uid: user.uid,
    email: user.email ?? "",
    role: "admin",
    fullName: typeof data?.fullName === "string" ? data.fullName : undefined,
    employeeNumber:
      typeof data?.employeeNumber === "string"
        ? data.employeeNumber
        : undefined,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(a));
  return a;
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const [authState, setAuthState] = useState<AppAuth | null>(() => {
    return getAuthState();
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          clearAuth();
          setAuthState(null);
          setInitialized(true);
          return;
        }

        const current = getAuthState();
        if (current?.uid === user.uid && current?.role === "admin") {
          setAuthState(current);
          setInitialized(true);
          return;
        }

        const resolved = await resolveAdminAuth(user);
        if (!resolved) {
          localStorage.removeItem(AUTH_KEY);
          setAuthState(null);
          setInitialized(true);
          return;
        }

        setAuthState(resolved);
        setInitialized(true);
      } catch {
        setInitialized(true);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo<AuthCtxValue>(() => {
    return {
      initialized,
      authState,
      isAdmin: authState?.role === "admin",
    };
  }, [initialized, authState]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
