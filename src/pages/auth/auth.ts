import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/config";

export const AUTH_KEY = "csih_auth";

export type AppAuth = {
  uid: string;
  email: string;
  role: "admin";
  fullName?: string;
  employeeNumber?: string;
};

function saveAuth(a: AppAuth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(a));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthState(): AppAuth | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppAuth;
  } catch {
    return null;
  }
}

async function buildAdminAuthFromUid(uid: string, fallbackEmail?: string) {
  const ref = doc(firestore, "admin_users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data: any = snap.data();
  if (data?.role !== "admin") return null;

  const a: AppAuth = {
    uid,
    email: typeof data?.email === "string" ? data.email : fallbackEmail ?? "",
    role: "admin",
    fullName: typeof data?.fullName === "string" ? data.fullName : undefined,
    employeeNumber:
      typeof data?.employeeNumber === "string"
        ? data.employeeNumber
        : undefined,
  };

  return a;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AppAuth> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

  const a = await buildAdminAuthFromUid(
    cred.user.uid,
    cred.user.email ?? email.trim(),
  );

  if (!a) throw new Error("החשבון קיים אבל לא מוגדר כמנהל במערכת.");

  saveAuth(a);
  return a;
}

export async function signupAdmin(
  fullName: string,
  employeeNumber: string,
  email: string,
  password: string,
): Promise<AppAuth> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  await setDoc(doc(firestore, "admin_users", cred.user.uid), {
    fullName: fullName.trim(),
    employeeNumber: employeeNumber.trim(),
    email: email.trim(),
    role: "admin",
    createdAt: serverTimestamp(),
  });

  const a: AppAuth = {
    uid: cred.user.uid,
    email: cred.user.email ?? email.trim(),
    role: "admin",
    fullName: fullName.trim(),
    employeeNumber: employeeNumber.trim(),
  };

  saveAuth(a);
  return a;
}

export async function logoutAll() {
  clearAuth();
  await signOut(auth);
}

export function subscribeAuthSync(onReady?: () => void) {
  let first = true;

  return onAuthStateChanged(auth, async (u: User | null) => {
    try {
      if (!u) {
        clearAuth();
        return;
      }

      const existing = getAuthState();
      if (existing?.uid === u.uid && existing.role === "admin") {
        return;
      }

      const a = await buildAdminAuthFromUid(u.uid, u.email ?? "");
      if (a) saveAuth(a);
      else clearAuth();
    } catch {
      clearAuth();
    } finally {
      if (first) {
        first = false;
        onReady?.();
      }
    }
  });
}