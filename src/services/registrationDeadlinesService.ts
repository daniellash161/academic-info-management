import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { RegistrationDeadline } from "../models/registrationDeadline";
import { firestore } from "../firebase/firebase";

export type RegistrationDeadlineStatus = "פתוח" | "עתידי" | "נסגר" | "לא פעיל";

const COL = "registrationDeadlines";

type CreateInput = Omit<RegistrationDeadline, "id" | "createdAt">;
type UpdatePatch = Partial<Omit<RegistrationDeadline, "id" | "createdAt">>;

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function normalizeFromDb(id: string, data: any): RegistrationDeadline {
  return {
    id,
    createdAt: typeof data?.createdAt === "string" ? data.createdAt : new Date(0).toISOString(),
    title: String(data?.title ?? ""),
    startDate: String(data?.startDate ?? ""),
    endDate: String(data?.endDate ?? ""),
    isActive: Boolean(data?.isActive),
    notes: typeof data?.notes === "string" ? data.notes : undefined,
  };
}

export const registrationDeadlinesService = {
  statuses(): RegistrationDeadlineStatus[] {
    return ["פתוח", "עתידי", "נסגר", "לא פעיל"];
  },

  statusOf(d: RegistrationDeadline): RegistrationDeadlineStatus {
    if (!d.isActive) return "לא פעיל";
    const t = todayYmd();
    if (t < d.startDate) return "עתידי";
    if (t > d.endDate) return "נסגר";
    return "פתוח";
  },

  async getAll(): Promise<RegistrationDeadline[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getById(id: string): Promise<RegistrationDeadline | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async search(
    query: string,
    statusFilter: RegistrationDeadlineStatus | "ALL" = "ALL"
  ): Promise<RegistrationDeadline[]> {
    const q = query.trim().toLowerCase();
    let rows = await this.getAll();

    if (statusFilter !== "ALL") {
      rows = rows.filter((d) => this.statusOf(d) === statusFilter);
    }

    if (q) {
      rows = rows.filter((d) => {
        const hay = [d.title, d.startDate, d.endDate, d.notes ?? "", this.statusOf(d)]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: CreateInput): Promise<RegistrationDeadline> {
    const ref = doc(collection(firestore, COL));

    const item: RegistrationDeadline = {
      id: ref.id,
      createdAt: new Date().toISOString(),
      title: input.title.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: Boolean(input.isActive),
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    };

    const data = clean({
      createdAt: item.createdAt,
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      isActive: item.isActive,
      notes: item.notes,
    });

    await setDoc(ref, data);
    return item;
  },

  async update(id: string, patch: UpdatePatch): Promise<RegistrationDeadline> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);

    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("מועד הרשמה לא נמצא");

    const current = normalizeFromDb(snap.id, snap.data());

    const updated: RegistrationDeadline = {
      ...current,
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      startDate: patch.startDate !== undefined ? patch.startDate : current.startDate,
      endDate: patch.endDate !== undefined ? patch.endDate : current.endDate,
      isActive: patch.isActive !== undefined ? Boolean(patch.isActive) : current.isActive,
      notes:
        patch.notes !== undefined
          ? patch.notes.trim()
            ? patch.notes.trim()
            : undefined
          : current.notes,
    };

    const data = clean({
      title: updated.title,
      startDate: updated.startDate,
      endDate: updated.endDate,
      isActive: updated.isActive,
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