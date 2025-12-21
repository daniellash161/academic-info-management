// src/services/usersService.ts
import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { User, UserRole } from "../models/user";

type CreateUserInput = Omit<User, "id" | "createdAt">;
type UpdateUserPatch = Partial<Omit<User, "id" | "createdAt">>;

function getAllUsers(): User[] {
  return readLS<User[]>(LS_KEYS.users, []);
}

function saveAllUsers(users: User[]) {
  writeLS(LS_KEYS.users, users);
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
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
  getAll(): User[] {
    return [...getAllUsers()];
  },

  getCandidates(): User[] {
    return getAllUsers().filter((u) => u.role === "CANDIDATE");
  },

  getById(id: string): User | undefined {
    return getAllUsers().find((u) => u.id === id);
  },

  isNationalIdTaken(nationalId: string, excludeId?: string): boolean {
    const nid = String(nationalId).trim();
    return getAllUsers().some((u) => u.nationalId === nid && u.id !== excludeId);
  },

  isEmailTaken(email: string, excludeId?: string): boolean {
    const e = normalizeEmail(email);
    return getAllUsers().some((u) => normalizeEmail(u.email) === e && u.id !== excludeId);
  },

  create(input: CreateUserInput): User {
    // ולידציות בסיסיות (שלא יהיה אפשר לעקוף דרך Console)
    assertValidFullName(input.fullName);
    assertValidNationalId(String(input.nationalId));
    assertValidEmail(input.email);
    assertValidPhone(String(input.phone));
    assertValidPassword(input.role, input.password);
    assertValidNotes(input.notes);

    const nationalId = String(input.nationalId).trim();
    const email = input.email.trim();

    if (this.isNationalIdTaken(nationalId)) throw new Error('ת"ז כבר קיימת במערכת');
    if (this.isEmailTaken(email)) throw new Error("מייל כבר קיים במערכת");

    const user: User = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
      fullName: input.fullName.trim(),
      nationalId,
      email,
      phone: String(input.phone).trim(),
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
      password: input.password?.trim() ? input.password.trim() : undefined,
    };

    const all = getAllUsers();
    saveAllUsers([user, ...all]);
    return user;
  },

  update(id: string, patch: UpdateUserPatch): User {
    const all = getAllUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("משתמש לא נמצא");

    const current = all[idx];

    const nextRole = patch.role !== undefined ? patch.role : current.role;

    const nextFullName =
      patch.fullName !== undefined ? patch.fullName.trim() : current.fullName;

    const nextNationalId =
      patch.nationalId !== undefined ? String(patch.nationalId).trim() : current.nationalId;

    const nextEmail =
      patch.email !== undefined ? patch.email.trim() : current.email;

    const nextPhone =
      patch.phone !== undefined ? String(patch.phone).trim() : current.phone;

    const nextNotes =
      patch.notes !== undefined ? (patch.notes.trim() ? patch.notes.trim() : "") : current.notes ?? "";

    const nextPassword =
      patch.password !== undefined ? (patch.password?.trim() ?? "") : current.password ?? "";

    // ולידציות על הערכים הסופיים
    assertValidFullName(nextFullName);
    assertValidNationalId(nextNationalId);
    assertValidEmail(nextEmail);
    assertValidPhone(nextPhone);
    assertValidPassword(nextRole, nextPassword ? nextPassword : undefined);
    assertValidNotes(nextNotes ? nextNotes : undefined);

    if (this.isNationalIdTaken(nextNationalId, id)) throw new Error('ת"ז כבר קיימת במערכת');
    if (this.isEmailTaken(nextEmail, id)) throw new Error("מייל כבר קיים במערכת");

    const updated: User = {
      ...current,
      ...patch,
      fullName: nextFullName,
      nationalId: nextNationalId,
      email: nextEmail,
      phone: nextPhone,
      notes: nextNotes ? nextNotes : undefined,
      password: nextPassword ? nextPassword : undefined,
      interest: patch.interest !== undefined ? patch.interest : current.interest,
      role: nextRole,
    };

    all[idx] = updated;
    saveAllUsers(all);
    return updated;
  },

  remove(id: string) {
    const all = getAllUsers();
    saveAllUsers(all.filter((u) => u.id !== id));
  },
};