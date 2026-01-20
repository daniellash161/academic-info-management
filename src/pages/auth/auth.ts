import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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

export type UserSession = {
  uid: string;
  email: string;
};

function isAppAuth(x: any): x is AppAuth {
  return (
    x &&
    typeof x === "object" &&
    typeof x.uid === "string" &&
    typeof x.email === "string" &&
    x.role === "admin"
  );
}

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
    const parsed = JSON.parse(raw);
    return isAppAuth(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function resolveAdminAuth(user: User): Promise<AppAuth | null> {
  const ref = doc(firestore, "admin_users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    clearAuth();
    return null;
  }

  const data: any = snap.data();
  if (data?.role !== "admin") {
    clearAuth();
    return null;
  }

  const a: AppAuth = {
    uid: user.uid,
    email:
      user.email ?? (typeof data?.email === "string" ? data.email : "admin"),
    role: "admin",
    fullName: typeof data?.fullName === "string" ? data.fullName : undefined,
    employeeNumber:
      typeof data?.employeeNumber === "string"
        ? data.employeeNumber
        : undefined,
  };

  saveAuth(a);
  return a;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AppAuth> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

  const ref = doc(firestore, "admin_users", cred.user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("החשבון קיים אבל לא מוגדר כמנהל במערכת.");

  const data: any = snap.data();
  if (data?.role !== "admin") throw new Error("למשתמש אין הרשאת מנהל");

  const a: AppAuth = {
    uid: cred.user.uid,
    email: cred.user.email ?? email.trim(),
    role: "admin",
    fullName: typeof data?.fullName === "string" ? data.fullName : undefined,
    employeeNumber:
      typeof data?.employeeNumber === "string"
        ? data.employeeNumber
        : undefined,
  };

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
