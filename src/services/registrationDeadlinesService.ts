import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { RegistrationDeadline } from "../models/registrationDeadline";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function readAll(): RegistrationDeadline[] {
  return readLS<RegistrationDeadline[]>(LS_KEYS.registrationDeadlines, []);
}

function writeAll(items: RegistrationDeadline[]) {
  writeLS(LS_KEYS.registrationDeadlines, items);
}

export type DeadlineStatus = "פתוח" | "עתידי" | "הסתיים" | "לא פעיל";

export const registrationDeadlinesService = {
  getAll(): RegistrationDeadline[] {
    return [...readAll()].sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  getById(id: string): RegistrationDeadline | undefined {
    return readAll().find((x) => x.id === id);
  },

  statusOf(item: RegistrationDeadline): DeadlineStatus {
    if (!item.isActive) return "לא פעיל";
    const t = todayYmd();
    if (item.startDate <= t && t <= item.endDate) return "פתוח";
    if (t < item.startDate) return "עתידי";
    return "הסתיים";
  },

  create(input: Omit<RegistrationDeadline, "id" | "createdAt">): RegistrationDeadline {
    const all = readAll();

    const item: RegistrationDeadline = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title: input.title.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: Boolean(input.isActive),
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    };

    writeAll([item, ...all]);
    return item;
  },

  update(id: string, patch: Partial<Omit<RegistrationDeadline, "id" | "createdAt">>): RegistrationDeadline {
    const all = readAll();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("מועד הרשמה לא נמצא");

    const current = all[idx];

    const updated: RegistrationDeadline = {
      ...current,
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      notes:
        patch.notes !== undefined
          ? patch.notes.trim()
            ? patch.notes.trim()
            : undefined
          : current.notes,
      isActive: patch.isActive !== undefined ? Boolean(patch.isActive) : current.isActive,
      startDate: patch.startDate !== undefined ? patch.startDate : current.startDate,
      endDate: patch.endDate !== undefined ? patch.endDate : current.endDate,
    };

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((x) => x.id !== id));
  },

  search(query: string): RegistrationDeadline[] {
    const q = query.trim().toLowerCase();
    const rows = readAll();

    if (!q) return rows.sort((a, b) => b.startDate.localeCompare(a.startDate));

    return rows
      .filter((x) => {
        const hay = [x.title, x.startDate, x.endDate, x.notes ?? "", this.statusOf(x)]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },
};