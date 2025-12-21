// src/services/contactMessagesService.ts
import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { ContactMessage, ContactStatus } from "../models/contactMessage";

type CreateInput = Omit<ContactMessage, "id" | "createdAt" | "status"> & {
  status?: ContactStatus;
};

type UpdatePatch = Partial<Omit<ContactMessage, "id" | "createdAt">>;

function getAll(): ContactMessage[] {
  return readLS<ContactMessage[]>(LS_KEYS.contacts, []);
}

function saveAll(items: ContactMessage[]) {
  writeLS(LS_KEYS.contacts, items);
}

function normalizeStatus(s: string): ContactStatus {
  if (s === "חדש" || s === "בטיפול" || s === "טופל") return s;
  return "חדש";
}

export const contactMessagesService = {
  statuses(): ContactStatus[] {
    return ["חדש", "בטיפול", "טופל"];
  },

  getAll(): ContactMessage[] {
    return [...getAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): ContactMessage | undefined {
    return getAll().find((x) => x.id === id);
  },

  create(input: CreateInput): ContactMessage {
    const item: ContactMessage = {
      id: makeId(),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: String(input.phone).trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: normalizeStatus(String(input.status ?? "חדש")),
      adminNotes: input.adminNotes?.trim() ? input.adminNotes.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    const all = getAll();
    saveAll([item, ...all]);
    return item;
  },

  update(id: string, patch: UpdatePatch): ContactMessage {
    const all = getAll();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("פנייה לא נמצאה");

    const current = all[idx];

    const updated: ContactMessage = {
      ...current,
      ...patch,
      fullName: patch.fullName !== undefined ? patch.fullName.trim() : current.fullName,
      email: patch.email !== undefined ? patch.email.trim() : current.email,
      phone: patch.phone !== undefined ? String(patch.phone).trim() : current.phone,
      subject: patch.subject !== undefined ? patch.subject.trim() : current.subject,
      message: patch.message !== undefined ? patch.message.trim() : current.message,
      status: patch.status !== undefined ? normalizeStatus(String(patch.status)) : current.status,
      adminNotes:
        patch.adminNotes !== undefined
          ? patch.adminNotes.trim()
            ? patch.adminNotes.trim()
            : undefined
          : current.adminNotes,
    };

    all[idx] = updated;
    saveAll(all);
    return updated;
  },

  remove(id: string) {
    saveAll(getAll().filter((x) => x.id !== id));
  },

  search(query: string, statusFilter: ContactStatus | "ALL"): ContactMessage[] {
    const q = query.trim().toLowerCase();
    let rows = getAll();

    if (statusFilter !== "ALL") rows = rows.filter((x) => x.status === statusFilter);

    if (q) {
      rows = rows.filter((x) => {
        const hay = [
          x.fullName,
          x.email,
          x.phone,
          x.subject,
          x.message,
          x.status,
          x.adminNotes ?? "",
          x.createdAt,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};