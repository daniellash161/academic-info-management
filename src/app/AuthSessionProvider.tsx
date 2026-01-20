import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  clearAuth,
  getAuthState,
  resolveAdminAuth,
  type AppAuth,
  type UserSession,
} from "../pages/auth/auth";

type AuthCtx = {
  initialized: boolean;
  user: UserSession | null;
  admin: AppAuth | null;
  isAdmin: boolean;
};

const Ctx = createContext<AuthCtx>({
  initialized: false,
  user: null,
  admin: null,
  isAdmin: false,
});

function toUserSession(u: User): UserSession {
  return { uid: u.uid, email: u.email ?? "" };
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [admin, setAdmin] = useState<AppAuth | null>(() => getAuthState());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          clearAuth();
          setUser(null);
          setAdmin(null);
          setInitialized(true);
          return;
        }

        setUser(toUserSession(u));

        const cached = getAuthState();
        if (cached?.uid === u.uid && cached.role === "admin") {
          const email = u.email ?? cached.email;
          if (email && email !== cached.email) {
            const updated: AppAuth = { ...cached, email };
            localStorage.setItem("csih_auth", JSON.stringify(updated));
            setAdmin(updated);
          } else {
            setAdmin(cached);
          }
          setInitialized(true);
          return;
        }

        const resolved = await resolveAdminAuth(u);
        setAdmin(resolved);
        setInitialized(true);
      } catch {
        setInitialized(true);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo<AuthCtx>(() => {
    return {
      initialized,
      user,
      admin,
      isAdmin: admin?.role === "admin",
    };
  }, [initialized, user, admin]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuthSession() {
  return useContext(Ctx);
}
