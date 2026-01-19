import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/config";
import { AUTH_KEY, getAuthState } from "../pages/auth/auth";

type AuthSessionCtx = {
  ready: boolean;
};

const AuthSessionContext = createContext<AuthSessionCtx>({ ready: false });

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          localStorage.removeItem(AUTH_KEY);
          setReady(true);
          return;
        }

        const existing = getAuthState();
        if (existing?.uid === user.uid && existing?.role === "admin") {
          setReady(true);
          return;
        }

        const ref = doc(firestore, "admin_users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          localStorage.removeItem(AUTH_KEY);
          setReady(true);
          return;
        }

        const data: any = snap.data();
        if (data?.role !== "admin") {
          localStorage.removeItem(AUTH_KEY);
          setReady(true);
          return;
        }

        const a = {
          uid: user.uid,
          email: user.email ?? data?.email ?? "",
          role: "admin" as const,
          fullName:
            typeof data?.fullName === "string" ? data.fullName : undefined,
          employeeNumber:
            typeof data?.employeeNumber === "string"
              ? data.employeeNumber
              : undefined,
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(a));
        setReady(true);
      } catch {
        setReady(true);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(() => ({ ready }), [ready]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
