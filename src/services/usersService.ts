import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { InterestArea, User, UserRole } from "../models/user";
import { firestore } from "../firebase/config";

const COL = "users";

type CreateUserInput = Omit<User, "id" | "createdAt">;
type UpdateUserPatch = Partial<Omit<User, "id" | "createdAt">>;

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

function normalizeRole(x: any): UserRole {
  return x === "CANDIDATE" || x === "ADMIN" || x === "STUDENT" || x === "GRADUATE" ? x : "CANDIDATE";
}

function normalizeInterest(x: any): InterestArea | undefined {
  if (x === "תואר ראשון במדעי המחשב" || x === "תואר שני במדעי המחשב") return x;
  return undefined;
}

function normalizeFromDb(id: string, data: any): User {
  return {
    id,
    fullName: String(data?.fullName ?? ""),
    nationalId: String(data?.nationalId ?? ""),
    email: String(data?.email ?? ""),
    phone: String(data?.phone ?? ""),
    role: normalizeRole(data?.role),
    password: typeof data?.password === "string" ? data.password : undefined,
    interest: normalizeInterest(data?.interest),
    notes: typeof data?.notes === "string" ? data.notes : undefined,
    createdAt: String(data?.createdAt ?? ""),
  };
}

function assertValidFullName(fullName: string) {
  const v = (fullName ?? "").trim();
  const ok = /^[A-Za-z\u0590-\u05FF ]+$/.test(v);
  if (!v) throw new Error("שם מלא הוא שדה חובה");
  if (!ok) throw new Error("שם מלא יכול להכיל אותיות ורווחים בלבד");
}

function assertValidNationalId(nationalId: string) {
  const v = String(nationalId ?? "").trim();
  if (!/^\d{9}$/.test(v)) throw new Error('ת"ז חייבת להיות 9 ספרות');
}

function assertValidEmail(email: string) {
  const v = (email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+$/.test(v)) throw new Error("מייל לא תקין");
}

function assertValidPhone(phone: string) {
  const v = String(phone ?? "").trim();
  if (!/^0\d{9}$/.test(v)) throw new Error("טלפון חייב להיות 10 ספרות ולהתחיל ב-0");
}

function assertValidPassword(role: UserRole, password?: string) {
  const p = password?.trim() ?? "";
  if (role === "ADMIN") {
    if (!p) throw new Error("למנהל מערכת חובה להגדיר סיסמה");
    if (p.length < 6) throw new Error("סיסמה חייבת להיות לפחות 6 תווים");
  } else {
    if (p && p.length < 6) throw new Error("סיסמה חייבת להיות לפחות 6 תווים");
  }
}

function assertValidNotes(notes?: string) {
  if (notes === undefined) return;
  if (notes.length > 300) throw new Error("הערות עד 300 תווים");
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getCandidates(): Promise<User[]> {
    const q = query(collection(firestore, COL), where("role", "==", "CANDIDATE"));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getById(id: string): Promise<User | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async isNationalIdTaken(nationalId: string, excludeId?: string): Promise<boolean> {
    const nid = String(nationalId).trim();
    const q = query(collection(firestore, COL), where("nationalId", "==", nid));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    return snap.docs.some((d) => d.id !== excludeId);
  },

  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const e = normalizeEmail(email);
    const q = query(collection(firestore, COL), where("emailLower", "==", e));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    return snap.docs.some((d) => d.id !== excludeId);
  },

  async create(input: CreateUserInput): Promise<User> {
    assertValidFullName(input.fullName);
    assertValidNationalId(String(input.nationalId));
    assertValidEmail(input.email);
    assertValidPhone(String(input.phone));
    assertValidPassword(input.role, input.password);
    assertValidNotes(input.notes);

    const nationalId = String(input.nationalId).trim();
    const email = input.email.trim();
    const emailLower = normalizeEmail(email);

    if (await this.isNationalIdTaken(nationalId)) throw new Error('ת"ז כבר קיימת במערכת');
    if (await this.isEmailTaken(email)) throw new Error("מייל כבר קיים במערכת");

    const ref = doc(collection(firestore, COL));
    const createdAt = new Date().toISOString();

    const user: User = {
      ...input,
      id: ref.id,
      createdAt,
      fullName: input.fullName.trim(),
      nationalId,
      email,
      phone: String(input.phone).trim(),
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
      password: input.password?.trim() ? input.password.trim() : undefined,
      interest: input.interest,
    };

    const data = clean({
      fullName: user.fullName,
      nationalId: user.nationalId,
      email: user.email,
      emailLower,
      phone: user.phone,
      role: user.role,
      password: user.password,
      interest: user.interest,
      notes: user.notes,
      createdAt: user.createdAt,
    });

    await setDoc(ref, data);
    return user;
  },

  async update(id: string, patch: UpdateUserPatch): Promise<User> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);

    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("משתמש לא נמצא");

    const current = normalizeFromDb(snap.id, snap.data());

    const nextRole = patch.role !== undefined ? patch.role : current.role;

    const nextFullName = patch.fullName !== undefined ? patch.fullName.trim() : current.fullName;

    const nextNationalId =
      patch.nationalId !== undefined ? String(patch.nationalId).trim() : current.nationalId;

    const nextEmail = patch.email !== undefined ? patch.email.trim() : current.email;
    const nextEmailLower = normalizeEmail(nextEmail);

    const nextPhone = patch.phone !== undefined ? String(patch.phone).trim() : current.phone;

    const nextNotes =
      patch.notes !== undefined ? (patch.notes.trim() ? patch.notes.trim() : "") : current.notes ?? "";

    const nextPassword =
      patch.password !== undefined ? (patch.password?.trim() ?? "") : current.password ?? "";

    assertValidFullName(nextFullName);
    assertValidNationalId(nextNationalId);
    assertValidEmail(nextEmail);
    assertValidPhone(nextPhone);
    assertValidPassword(nextRole, nextPassword ? nextPassword : undefined);
    assertValidNotes(nextNotes ? nextNotes : undefined);

    if (await this.isNationalIdTaken(nextNationalId, docId)) throw new Error('ת"ז כבר קיימת במערכת');
    if (await this.isEmailTaken(nextEmail, docId)) throw new Error("מייל כבר קיים במערכת");

    const updated: User = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      fullName: nextFullName,
      nationalId: nextNationalId,
      email: nextEmail,
      phone: nextPhone,
      notes: nextNotes ? nextNotes : undefined,
      password: nextPassword ? nextPassword : undefined,
      interest: patch.interest !== undefined ? patch.interest : current.interest,
      role: nextRole,
    };

    const data = clean({
      fullName: updated.fullName,
      nationalId: updated.nationalId,
      email: updated.email,
      emailLower: nextEmailLower,
      phone: updated.phone,
      role: updated.role,
      password: updated.password,
      interest: updated.interest,
      notes: updated.notes,
    });

    await updateDoc(ref, data as any);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const docId = decodeURIComponent(id).trim();
    await deleteDoc(doc(firestore, COL, docId));
  },
};