import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { RegistrationDeadline } from "../models/registrationDeadline";

function readAll(): RegistrationDeadline[] {
  return readLS<RegistrationDeadline[]>(LS_KEYS.registrationDeadlines, []);
}

function writeAll(items: RegistrationDeadline[]) {
  writeLS(LS_KEYS.registrationDeadlines, items);
}

export const registrationDeadlinesService = {
  getAll(): RegistrationDeadline[] {
    return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): RegistrationDeadline | undefined {
    return readAll().find((x) => x.id === id);
  },

  search(query: string, activeOnly: boolean): RegistrationDeadline[] {
    const q = query.trim().toLowerCase();
    let rows = readAll();

    if (activeOnly) rows = rows.filter((x) => x.isActive);

    if (q) {
      rows = rows.filter((x) => {
        const hay = [x.title, x.notes ?? "", x.startDate, x.endDate].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  create(input: Omit<RegistrationDeadline, "id" | "createdAt">): RegistrationDeadline {
    const all = readAll();

    const item: RegistrationDeadline = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title: input.title.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive,
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
      startDate: patch.startDate !== undefined ? patch.startDate : current.startDate,
      endDate: patch.endDate !== undefined ? patch.endDate : current.endDate,
      isActive: patch.isActive !== undefined ? patch.isActive : current.isActive,
    };

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((x) => x.id !== id));
  },
};