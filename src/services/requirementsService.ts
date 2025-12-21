import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { Requirement, RequirementType } from "../models/requirement";

type CreateInput = Omit<Requirement, "id">;
type UpdatePatch = Partial<Omit<Requirement, "id">>;

function getAll(): Requirement[] {
  return readLS<Requirement[]>(LS_KEYS.requirements, []);
}

function saveAll(items: Requirement[]) {
  writeLS(LS_KEYS.requirements, items);
}

export const requirementsService = {
  types(): RequirementType[] {
    return ["פסיכומטרי", "בגרות", "אנגלית"];
  },

  getAll(): Requirement[] {
    return getAll();
  },

  getById(id: string): Requirement | undefined {
    return getAll().find((r) => r.id === id);
  },

  create(input: Omit<CreateInput, "courseCodes"> & { courseCodes?: string[] }) {
    const item: Requirement = {
      ...input,
      id: makeId(),
      title: input.title.trim(),
      description: input.description?.trim() ? input.description.trim() : undefined,
      extraInfo: input.extraInfo?.trim() ? input.extraInfo.trim() : undefined,
      courseCodes: input.courseCodes ?? [],
    };

    const all = getAll();
    saveAll([item, ...all]);
    return item;
  },

  update(id: string, patch: UpdatePatch) {
    const all = getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("דרישה לא נמצאה");

    const current = all[idx];

    const updated: Requirement = {
      ...current,
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      description:
        patch.description !== undefined
          ? patch.description.trim()
            ? patch.description.trim()
            : undefined
          : current.description,
      extraInfo:
        patch.extraInfo !== undefined
          ? patch.extraInfo.trim()
            ? patch.extraInfo.trim()
            : undefined
          : current.extraInfo,
      courseCodes: patch.courseCodes !== undefined ? patch.courseCodes : current.courseCodes,
    };

    all[idx] = updated;
    saveAll(all);
    return updated;
  },

  remove(id: string) {
    saveAll(getAll().filter((r) => r.id !== id));
  },

  searchAndFilter(query: string, typeFilter: RequirementType | "ALL"): Requirement[] {
    const q = query.trim().toLowerCase();

    let rows = getAll();

    if (typeFilter !== "ALL") {
      rows = rows.filter((r) => r.type === typeFilter);
    }

    if (q) {
      rows = rows.filter((r) => {
        const hay = [
          r.type,
          r.title,
          r.description ?? "",
          r.extraInfo ?? "",
          (r.courseCodes ?? []).join(","),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => a.displayOrder - b.displayOrder);
  },
};