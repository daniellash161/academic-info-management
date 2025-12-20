import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS, makeId } from "../storage/storage";
import type { User } from "../models/user";

function readAll(): User[] {
  return readLS<User[]>(LS_KEYS.users, []);
}

function writeAll(users: User[]) {
  writeLS(LS_KEYS.users, users);
}

export const usersService = {
  getCandidates(): User[] {
    return readAll().filter((u) => u.role === "CANDIDATE");
  },

  getById(id: string): User | undefined {
    return readAll().find((u) => u.id === id);
  },

  create(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: makeId(),
      createdAt: new Date().toISOString(),
    };

    const all = readAll();
    writeAll([newUser, ...all]);
    return newUser;
  },

  update(id: string, patch: Partial<Omit<User, "id" | "createdAt">>): User | undefined {
    const all = readAll();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;

    const updated: User = { ...all[idx], ...patch };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string): void {
    const all = readAll().filter((u) => u.id !== id);
    writeAll(all);
  },
};