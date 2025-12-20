import { LS_KEYS } from "./lsKeys";
import { hasLS, makeId, writeLS } from "./storage";
import type { User } from "../models/user";

export function seedUsersIfEmpty() {
  if (hasLS(LS_KEYS.users)) return;

  const users: User[] = Array.from({ length: 10 }).map((_, i) => ({
    id: makeId(),
    fullName: `מועמד ${i + 1}`,
    nationalId: String(100000000 + i),
    email: `candidate${i + 1}@mail.com`,
    phone: `05${String(10000000 + i).slice(0, 8)}`,
    role: "CANDIDATE",
    interest: "מדעי המחשב",
    notes: "",
    createdAt: new Date().toISOString(),
  }));

  writeLS(LS_KEYS.users, users);
}