import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS } from "../storage/storage";
import type { RegistrationRequest, RequestStatus } from "../models/registrationRequest";
import { usersService } from "./usersService";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function isYmd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function assertValidDate(ymd: string) {
  if (!isYmd(ymd)) throw new Error("createdAt must be YYYY-MM-DD");
  if (ymd > todayYmd()) throw new Error("createdAt cannot be in the future");
}

function assertValidNotes(notes?: string) {
  if (notes === undefined) return;
  if (notes.length > 300) throw new Error("notes must be up to 300 characters");
}

function normalizeStatus(s: string): RequestStatus {
  if (s === "בהמתנה") return "נשלחה";
  if (s === "בטיוטה" || s === "נשלחה" || s === "מאושרת" || s === "נדחתה") return s;
  return "בטיוטה";
}

function readAll(): RegistrationRequest[] {
  const items = readLS<RegistrationRequest[]>(LS_KEYS.requests, []);
  return items.map((r) => ({
    ...r,
    status: normalizeStatus(String(r.status)),
  }));
}

function writeAll(items: RegistrationRequest[]) {
  writeLS(LS_KEYS.requests, items);
}

function nextRequestNumber(items: RegistrationRequest[]) {
  const max = items.reduce((acc, x) => Math.max(acc, x.requestNumber), 0);
  return max + 1;
}

function assertCandidateExists(candidateId: string) {
  if (!candidateId) throw new Error("candidateId is required");
  const candidate = usersService.getById(candidateId);
  if (!candidate || candidate.role !== "CANDIDATE") {
    throw new Error("Candidate does not exist");
  }
}

export const requestsService = {
  getAll(): RegistrationRequest[] {
    return [...readAll()].sort((a, b) => b.requestNumber - a.requestNumber);
  },

  getByNumber(requestNumber: number): RegistrationRequest | undefined {
    return readAll().find((r) => r.requestNumber === requestNumber);
  },

  create(input: Omit<RegistrationRequest, "requestNumber">): RegistrationRequest {
    assertCandidateExists(input.candidateId);
    assertValidDate(input.createdAt);
    assertValidNotes(input.notes);

    const all = readAll();

    const newItem: RegistrationRequest = {
      requestNumber: nextRequestNumber(all),
      candidateId: input.candidateId,
      status: normalizeStatus(String(input.status)),
      createdAt: input.createdAt,
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    };

    writeAll([newItem, ...all]);
    return newItem;
  },

  update(
    requestNumber: number,
    patch: Partial<Omit<RegistrationRequest, "requestNumber">>
  ): RegistrationRequest | undefined {
    const all = readAll();
    const idx = all.findIndex((r) => r.requestNumber === requestNumber);
    if (idx === -1) return undefined;

    if (patch.candidateId !== undefined) {
      assertCandidateExists(patch.candidateId);
    }

    if (patch.createdAt !== undefined) {
      assertValidDate(patch.createdAt);
    }

    if (patch.notes !== undefined) {
      assertValidNotes(patch.notes);
    }

    const current = all[idx];

    const updated: RegistrationRequest = {
      ...current,
      ...patch,
      status: patch.status !== undefined ? normalizeStatus(String(patch.status)) : current.status,
      notes:
        patch.notes !== undefined
          ? patch.notes.trim()
            ? patch.notes.trim()
            : undefined
          : current.notes,
    };

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(requestNumber: number) {
    writeAll(readAll().filter((r) => r.requestNumber !== requestNumber));
  },

  statuses(): RequestStatus[] {
    return ["בטיוטה", "נשלחה", "מאושרת", "נדחתה"];
  },
};