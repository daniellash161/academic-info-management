import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS } from "../storage/storage";
import type { RegistrationRequest, RequestStatus } from "../models/registrationRequest";
import { usersService } from "./usersService";

function readAll(): RegistrationRequest[] {
  return readLS<RegistrationRequest[]>(LS_KEYS.requests, []);
}

function writeAll(items: RegistrationRequest[]) {
  writeLS(LS_KEYS.requests, items);
}

function nextRequestNumber(items: RegistrationRequest[]) {
  const max = items.reduce((acc, x) => Math.max(acc, x.requestNumber), 0);
  return max + 1;
}

export const requestsService = {
  getAll(): RegistrationRequest[] {
    return [...readAll()].sort((a, b) => b.requestNumber - a.requestNumber);
  },

  getByNumber(requestNumber: number): RegistrationRequest | undefined {
    return readAll().find((r) => r.requestNumber === requestNumber);
  },

  create(input: Omit<RegistrationRequest, "requestNumber">): RegistrationRequest {
    const candidate = usersService.getById(input.candidateId);
    if (!candidate || candidate.role !== "CANDIDATE") {
      throw new Error("Candidate does not exist");
    }

    const all = readAll();
    const newItem: RegistrationRequest = {
      ...input,
      requestNumber: nextRequestNumber(all),
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

    if (patch.candidateId) {
      const candidate = usersService.getById(patch.candidateId);
      if (!candidate || candidate.role !== "CANDIDATE") {
        throw new Error("Candidate does not exist");
      }
    }

    const updated: RegistrationRequest = { ...all[idx], ...patch };
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