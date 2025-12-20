import { LS_KEYS } from "./lsKeys";
import { hasLS, makeId, writeLS } from "./storage";
import type { User } from "../models/user";
import type { RegistrationRequest } from "../models/registrationRequest";
import { usersService } from "../services/usersService";

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

export function seedRequestsIfEmpty() {
  if (hasLS(LS_KEYS.requests)) return;

  const candidates = usersService.getCandidates();
  const statuses: RegistrationRequest["status"][] = ["בטיוטה", "נשלחה", "מאושרת", "נדחתה"];

  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const requests: RegistrationRequest[] = Array.from({ length: 10 }).map((_, i) => {
    const candidate = candidates[i % candidates.length];
    const d = new Date(today);
    d.setDate(today.getDate() - i); // לא עתידי

    return {
      requestNumber: i + 1,
      candidateId: candidate.id,
      status: statuses[i % statuses.length],
      createdAt: ymd(d),
      notes: i % 3 === 0 ? "בקשה לדוגמה" : "",
    };
  });

  writeLS(LS_KEYS.requests, requests);
}