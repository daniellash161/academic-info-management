import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { RegistrationRequest, RequestStatus } from "../models/registrationRequest";
import { firestore } from "../firebase/config";

const COL = "requests";

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

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

function normalizeFromDb(id: string, data: any): RegistrationRequest {
  return {
    requestNumber: Number(id),
    candidateId: String(data?.candidateId ?? ""),
    status: normalizeStatus(String(data?.status ?? "בטיוטה")),
    createdAt: String(data?.createdAt ?? ""),
    notes: typeof data?.notes === "string" ? data.notes : undefined,
  };
}

export const requestsService = {
  async getAll(): Promise<RegistrationRequest[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => b.requestNumber - a.requestNumber);
  },

  async getById(id: string): Promise<RegistrationRequest | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async create(input: Omit<RegistrationRequest, "requestNumber">): Promise<RegistrationRequest> {
    assertValidDate(input.createdAt);
    assertValidNotes(input.notes);

    const all = await this.getAll();
    const next = all.reduce((acc, x) => Math.max(acc, x.requestNumber), 0) + 1;
    const docId = String(next);

    const ref = doc(firestore, COL, docId);
    const data = clean({
      candidateId: input.candidateId,
      status: normalizeStatus(String(input.status)),
      createdAt: input.createdAt,
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    });

    await setDoc(ref, data);

    return {
      requestNumber: next,
      candidateId: input.candidateId,
      status: normalizeStatus(String(input.status)),
      createdAt: input.createdAt,
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    };
  },

  async update(
    requestNumber: number,
    patch: Partial<Omit<RegistrationRequest, "requestNumber">>
  ): Promise<void> {
    if (patch.createdAt !== undefined) assertValidDate(patch.createdAt);
    if (patch.notes !== undefined) assertValidNotes(patch.notes);

    const docId = String(requestNumber);
    const ref = doc(firestore, COL, docId);

    const existing = await getDoc(ref);
    if (!existing.exists()) throw new Error("Request not found");

    const data = clean({
      candidateId: patch.candidateId,
      status: patch.status !== undefined ? normalizeStatus(String(patch.status)) : undefined,
      createdAt: patch.createdAt,
      notes:
        patch.notes !== undefined
          ? patch.notes.trim()
            ? patch.notes.trim()
            : undefined
          : undefined,
    });

    await updateDoc(ref, data as any);
  },

  async remove(requestNumber: number): Promise<void> {
    await deleteDoc(doc(firestore, COL, String(requestNumber)));
  },

  statuses(): RequestStatus[] {
    return ["בטיוטה", "נשלחה", "מאושרת", "נדחתה"];
  },
};