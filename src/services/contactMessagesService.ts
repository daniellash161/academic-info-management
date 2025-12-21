// src/services/contactMessagesService.ts
import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { ContactMessage, ContactMessageStatus } from "../models/contactMessage";

function normalizeStatus(s: string): ContactMessageStatus {
  if (s === "חדש" || s === "בטיפול" || s === "נסגר") return s;
  return "חדש";
}

function readAll(): ContactMessage[] {
  const items = readLS<ContactMessage[]>(LS_KEYS.contactMessages, []);
  return items.map((x) => ({ ...x, status: normalizeStatus(String(x.status)) }));
}

function writeAll(items: ContactMessage[]) {
  writeLS(LS_KEYS.contactMessages, items);
}

export const contactMessagesService = {
  statuses(): ContactMessageStatus[] {
    return ["חדש", "בטיפול", "נסגר"];
  },

  getAll(): ContactMessage[] {
    return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): ContactMessage | undefined {
    return readAll().find((x) => x.id === id);
  },

  search(query: string, statusFilter: ContactMessageStatus | "ALL" = "ALL"): ContactMessage[] {
    const q = query.trim().toLowerCase();
    let rows = readAll();

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

  create(input: Omit<ContactMessage, "id" | "createdAt" | "status">): ContactMessage {
    const all = readAll();

    const item: ContactMessage = {
      id: makeId(),
      createdAt: new Date().toISOString(),

      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: String(input.phone).trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),

      status: "חדש",
      adminNote: undefined,
    };

    writeAll([item, ...all]);
    return item;
  },

  update(id: string, patch: Partial<Pick<ContactMessage, "status" | "adminNote">>): ContactMessage {
    const all = readAll();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("פנייה לא נמצאה");

    const current = all[idx];

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

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((x) => x.id !== id));
  },
};