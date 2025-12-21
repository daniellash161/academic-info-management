import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { RegistrationDeadline } from "../models/registrationDeadline";

export type RegistrationDeadlineStatus = "פתוח" | "עתידי" | "נסגר" | "לא פעיל";

type CreateInput = Omit<RegistrationDeadline, "id" | "createdAt">;
type UpdatePatch = Partial<Omit<RegistrationDeadline, "id" | "createdAt">>;

function readAll(): RegistrationDeadline[] {
  return readLS<RegistrationDeadline[]>(LS_KEYS.registrationDeadlines, []);
}

function writeAll(items: RegistrationDeadline[]) {
  writeLS(LS_KEYS.registrationDeadlines, items);
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
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

  getAll(): RegistrationDeadline[] {
    return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): RegistrationDeadline | undefined {
    return readAll().find((x) => x.id === id);
  },

  search(query: string, statusFilter: RegistrationDeadlineStatus | "ALL" = "ALL"): RegistrationDeadline[] {
    const q = query.trim().toLowerCase();
    let rows = readAll();

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

  create(input: CreateInput): RegistrationDeadline {
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

  update(id: string, patch: UpdatePatch): RegistrationDeadline {
    const all = readAll();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("מועד הרשמה לא נמצא");

    const current = all[idx];

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

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((x) => x.id !== id));
  },
};