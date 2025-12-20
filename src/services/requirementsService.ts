import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS, makeId } from "../storage/storage";
import type { Requirement, RequirementType } from "../models/requirement";

function readAll(): Requirement[] {
  return readLS<Requirement[]>(LS_KEYS.requirements, []);
}

function writeAll(items: Requirement[]) {
  writeLS(LS_KEYS.requirements, items);
}

export const requirementsService = {
  types(): RequirementType[] {
    return ["פסיכומטרי", "בגרות", "אנגלית"];
  },

  getAll(): Requirement[] {
    // סדר לפי displayOrder ואז לפי title
    return [...readAll()].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return a.title.localeCompare(b.title);
    });
  },

  getById(id: string): Requirement | undefined {
    return readAll().find((r) => r.id === id);
  },

  searchAndFilter(query: string, typeFilter: RequirementType | "ALL"): Requirement[] {
    const items = this.getAll();

    const filteredByType =
      typeFilter === "ALL" ? items : items.filter((r) => r.type === typeFilter);

    const q = query.trim().toLowerCase();
    if (!q) return filteredByType;

    return filteredByType.filter((r) => {
      const hay = `${r.title} ${r.type} ${r.description ?? ""} ${r.extraInfo ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  },

  create(input: Omit<Requirement, "id">): Requirement {
    const newItem: Requirement = { ...input, id: makeId() };
    const all = readAll();
    writeAll([newItem, ...all]);
    return newItem;
  },

  update(id: string, patch: Partial<Omit<Requirement, "id">>): Requirement | undefined {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;

    const updated: Requirement = { ...all[idx], ...patch, id };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((r) => r.id !== id));
  },
};