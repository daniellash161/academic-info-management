// src/services/usersService.ts
import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { User } from "../models/user";

type CreateUserInput = Omit<User, "id" | "createdAt">;
type UpdateUserPatch = Partial<Omit<User, "id" | "createdAt">>;

function getAllUsers(): User[] {
  return readLS<User[]>(LS_KEYS.users, []);
}

function saveAllUsers(users: User[]) {
  writeLS(LS_KEYS.users, users);
}

export const usersService = {
  getAll(): User[] {
    return getAllUsers();
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
    const e = (email ?? "").trim().toLowerCase();
    return getAllUsers().some((u) => u.email.trim().toLowerCase() === e && u.id !== excludeId);
  },

  create(input: CreateUserInput): User {
    if (this.isNationalIdTaken(input.nationalId)) throw new Error('ת"ז כבר קיימת במערכת');
    if (this.isEmailTaken(input.email)) throw new Error("מייל כבר קיים במערכת");

    const user: User = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
      fullName: input.fullName.trim(),
      nationalId: String(input.nationalId).trim(),
      email: input.email.trim(),
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

    const nextNationalId =
      patch.nationalId !== undefined ? String(patch.nationalId).trim() : current.nationalId;

    const nextEmail = patch.email !== undefined ? patch.email.trim() : current.email;

    if (this.isNationalIdTaken(nextNationalId, id)) throw new Error('ת"ז כבר קיימת במערכת');
    if (this.isEmailTaken(nextEmail, id)) throw new Error("מייל כבר קיים במערכת");

    const updated: User = {
      ...current,
      ...patch,
      fullName: patch.fullName !== undefined ? patch.fullName.trim() : current.fullName,
      nationalId: nextNationalId,
      email: nextEmail,
      phone: patch.phone !== undefined ? String(patch.phone).trim() : current.phone,
      notes:
        patch.notes !== undefined ? (patch.notes?.trim() ? patch.notes.trim() : undefined) : current.notes,
      password:
        patch.password !== undefined
          ? patch.password?.trim()
            ? patch.password.trim()
            : undefined
          : current.password,
      interest: patch.interest !== undefined ? patch.interest : current.interest,
      role: patch.role !== undefined ? patch.role : current.role,
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