import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { ContactMessage, ContactMessageStatus } from "../models/contactMessage";
import { firestore } from "../firebase/firebase";

const COL = "contactMessages";

function normalizeStatus(s: string): ContactMessageStatus {
  if (s === "חדש" || s === "בטיפול" || s === "נסגר") return s;
  return "חדש";
}

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function normalizeFromDb(id: string, data: any): ContactMessage {
  return {
    id,
    createdAt: typeof data?.createdAt === "string" ? data.createdAt : new Date(0).toISOString(),
    fullName: String(data?.fullName ?? ""),
    email: String(data?.email ?? ""),
    phone: String(data?.phone ?? ""),
    subject: String(data?.subject ?? ""),
    message: String(data?.message ?? ""),
    status: normalizeStatus(String(data?.status ?? "חדש")),
    adminNote: typeof data?.adminNote === "string" ? data.adminNote : undefined,
  };
}

export const contactMessagesService = {
  statuses(): ContactMessageStatus[] {
    return ["חדש", "בטיפול", "נסגר"];
  },

  async getAll(): Promise<ContactMessage[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getById(id: string): Promise<ContactMessage | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async search(
    query: string,
    statusFilter: ContactMessageStatus | "ALL" = "ALL"
  ): Promise<ContactMessage[]> {
    const q = query.trim().toLowerCase();
    let rows = await this.getAll();

    if (statusFilter !== "ALL") rows = rows.filter((x) => x.status === statusFilter);

    if (q) {
      rows = rows.filter((x) => {
        const hay = [
          x.fullName,
          x.email,
          x.phone,
          x.subject,
          x.message,
          x.adminNote ?? "",
          x.status,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: Omit<ContactMessage, "id" | "createdAt" | "status">): Promise<ContactMessage> {
    const ref = doc(collection(firestore, COL));

    const item: ContactMessage = {
      id: ref.id,
      createdAt: new Date().toISOString(),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: String(input.phone).trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: "חדש",
      adminNote: undefined,
    };

    const data = clean({
      createdAt: item.createdAt,
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      subject: item.subject,
      message: item.message,
      status: item.status,
      adminNote: item.adminNote,
    });

    await setDoc(ref, data);
    return item;
  },

  async update(
    id: string,
    patch: Partial<Pick<ContactMessage, "status" | "adminNote">>
  ): Promise<ContactMessage> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);

    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("פנייה לא נמצאה");

    const current = normalizeFromDb(snap.id, snap.data());

    const updated: ContactMessage = {
      ...current,
      status: patch.status !== undefined ? normalizeStatus(String(patch.status)) : current.status,
      adminNote:
        patch.adminNote !== undefined
          ? patch.adminNote.trim()
            ? patch.adminNote.trim()
            : undefined
          : current.adminNote,
    };

    const data = clean({
      status: updated.status,
      adminNote: updated.adminNote,
    });

    await updateDoc(ref, data as any);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const docId = decodeURIComponent(id).trim();
    await deleteDoc(doc(firestore, COL, docId));
  },
};