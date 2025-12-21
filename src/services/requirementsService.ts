import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { Requirement, RequirementType } from "../models/requirement";

type CreateInput = Omit<Requirement, "id">;
type UpdatePatch = Partial<Omit<Requirement, "id">>;

function readAll(): Requirement[] {
  return readLS<Requirement[]>(LS_KEYS.requirements, []);
}

function saveAll(items: Requirement[]) {
  writeLS(LS_KEYS.requirements, items);
}

function normalizeType(t: string): RequirementType {
  if (t === "פסיכומטרי" || t === "בגרות" || t === "אנגלית") return t;
  return "פסיכומטרי";
}

function assertValidInput(input: CreateInput) {
  if (!input.title?.trim()) throw new Error("כותרת היא שדה חובה");
  if (!input.type) throw new Error("סוג דרישה הוא שדה חובה");

  const minScore = Number(input.minScore);
  if (!Number.isFinite(minScore) || minScore < 0) throw new Error("מינימום ציון חייב להיות מספר >= 0");

  const displayOrder = Number(input.displayOrder);
  if (!Number.isInteger(displayOrder) || displayOrder < 1) {
    throw new Error("סדר תצוגה חייב להיות מספר שלם >= 1");
  }
}

export const requirementsService = {
  types(): RequirementType[] {
    return ["פסיכומטרי", "בגרות", "אנגלית"];
  },

  getAll(): Requirement[] {
    return [...readAll()];
  },

  getById(id: string): Requirement | undefined {
    return readAll().find((r) => r.id === id);
  },

  create(input: CreateInput): Requirement {
    const normalized: CreateInput = {
      ...input,
      type: normalizeType(String(input.type)),
      title: input.title.trim(),
      minScore: Number(input.minScore),
      displayOrder: Number(input.displayOrder),
      description: input.description?.trim() ? input.description.trim() : undefined,
      extraInfo: input.extraInfo?.trim() ? input.extraInfo.trim() : undefined,
    };

    assertValidInput(normalized);

    const item: Requirement = {
      ...normalized,
      id: makeId(),
    };

    const all = readAll();
    saveAll([item, ...all]);
    return item;
  },

  update(id: string, patch: UpdatePatch): Requirement {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("דרישה לא נמצאה");

    const current = all[idx];

    const next: Requirement = {
      ...current,
      ...patch,
      type: patch.type !== undefined ? normalizeType(String(patch.type)) : current.type,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      minScore: patch.minScore !== undefined ? Number(patch.minScore) : current.minScore,
      displayOrder: patch.displayOrder !== undefined ? Number(patch.displayOrder) : current.displayOrder,
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
      isMandatory: patch.isMandatory !== undefined ? patch.isMandatory : current.isMandatory,
    };

    assertValidInput({
      type: next.type,
      minScore: next.minScore,
      title: next.title,
      description: next.description,
      extraInfo: next.extraInfo,
      displayOrder: next.displayOrder,
      isMandatory: next.isMandatory,
    });

    all[idx] = next;
    saveAll(all);
    return next;
  },

  remove(id: string) {
    saveAll(readAll().filter((r) => r.id !== id));
  },

  searchAndFilter(query: string, typeFilter: RequirementType | "ALL"): Requirement[] {
    const q = query.trim().toLowerCase();

    let rows = readAll();

    if (typeFilter !== "ALL") {
      rows = rows.filter((r) => r.type === typeFilter);
    }

    if (q) {
      rows = rows.filter((r) => {
        const hay = [r.type, r.title, r.description ?? "", r.extraInfo ?? ""].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => a.displayOrder - b.displayOrder);
  },
};