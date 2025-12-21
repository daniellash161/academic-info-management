import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { ApplicationDocument, DocumentStatus, DocumentType } from "../models/applicationDocument";
import { usersService } from "./usersService";

function readAll(): ApplicationDocument[] {
  return readLS<ApplicationDocument[]>(LS_KEYS.documents, []);
}

function writeAll(items: ApplicationDocument[]) {
  writeLS(LS_KEYS.documents, items);
}

function normalizeTitle(s: string) {
  return s.trim();
}

export const documentsService = {
  types(): DocumentType[] {
    return ["תעודת זהות", "גליון ציונים", "בגרות", "פסיכומטרי", "אחר"];
  },

  statuses(): DocumentStatus[] {
    return ["חסר", "הועלה", "אושר", "נדחה"];
  },

  getAll(): ApplicationDocument[] {
    return [...readAll()].sort((a, b) => {
      const aDate = a.uploadedAt ?? "";
      const bDate = b.uploadedAt ?? "";
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return a.title.localeCompare(b.title);
    });
  },

  getById(id: string): ApplicationDocument | undefined {
    return readAll().find((d) => d.id === id);
  },

  getByCandidate(candidateId: string): ApplicationDocument[] {
    return this.getAll().filter((d) => d.candidateId === candidateId);
  },

  search(query: string, statusFilter: DocumentStatus | "ALL"): ApplicationDocument[] {
    const q = query.trim().toLowerCase();
    const base =
      statusFilter === "ALL" ? this.getAll() : this.getAll().filter((d) => d.status === statusFilter);

    if (!q) return base;

    return base.filter((d) => {
      const cand = usersService.getById(d.candidateId);
      const candidateName = cand?.fullName ?? "";
      const hay = `${d.title} ${d.docType} ${d.status} ${candidateName} ${d.notes ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  },

  create(input: Omit<ApplicationDocument, "id">): ApplicationDocument {
    const cand = usersService.getById(input.candidateId);
    if (!cand || cand.role !== "CANDIDATE") throw new Error("Candidate does not exist");

    const item: ApplicationDocument = {
      ...input,
      id: makeId(),
      title: normalizeTitle(input.title),
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
    };

    // If status is "חסר", uploadedAt must be undefined
    if (item.status === "חסר") item.uploadedAt = undefined;

    writeAll([item, ...readAll()]);
    return item;
  },

  update(id: string, patch: Partial<Omit<ApplicationDocument, "id">>): ApplicationDocument | undefined {
    const all = readAll();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;

    if (patch.candidateId) {
      const cand = usersService.getById(patch.candidateId);
      if (!cand || cand.role !== "CANDIDATE") throw new Error("Candidate does not exist");
    }

    const updated: ApplicationDocument = {
      ...all[idx],
      ...patch,
      id,
      title: patch.title !== undefined ? normalizeTitle(patch.title) : all[idx].title,
      notes: patch.notes !== undefined ? (patch.notes.trim() ? patch.notes.trim() : undefined) : all[idx].notes,
    };

    if (updated.status === "חסר") updated.uploadedAt = undefined;

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((d) => d.id !== id));
  },
};