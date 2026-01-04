import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Requirement, RequirementType } from "../models/requirement";
import { firestore } from "../firebase/config";

const COL = "requirements";

type CreateInput = Omit<Requirement, "id">;
type UpdatePatch = Partial<Omit<Requirement, "id">>;

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function normalizeType(x: any): RequirementType {
  return x === "פסיכומטרי" || x === "בגרות" || x === "אנגלית" ? x : "פסיכומטרי";
}

function normalizeFromDb(id: string, data: any): Requirement {
  return {
    id,
    type: normalizeType(data?.type),
    minScore: Number(data?.minScore ?? 0),
    title: String(data?.title ?? ""),
    description: typeof data?.description === "string" ? data.description : undefined,
    extraInfo: typeof data?.extraInfo === "string" ? data.extraInfo : undefined,
    displayOrder: Number(data?.displayOrder ?? 1),
    isMandatory: Boolean(data?.isMandatory ?? false),
    courseCodes: Array.isArray(data?.courseCodes)
      ? data.courseCodes.map((c: any) => String(c))
      : [],
  };
}

export const requirementsService = {
  types(): RequirementType[] {
    return ["פסיכומטרי", "בגרות", "אנגלית"];
  },

  async getAll(): Promise<Requirement[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getById(id: string): Promise<Requirement | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async create(input: CreateInput): Promise<Requirement> {
    const ref = doc(collection(firestore, COL));

    const item: Requirement = {
      ...input,
      id: ref.id,
      type: normalizeType(input.type),
      minScore: Number(input.minScore),
      title: input.title.trim(),
      description: input.description?.trim() ? input.description.trim() : undefined,
      extraInfo: input.extraInfo?.trim() ? input.extraInfo.trim() : undefined,
      displayOrder: Number(input.displayOrder),
      isMandatory: Boolean(input.isMandatory),
      courseCodes: input.courseCodes ?? [],
    };

    const data = clean({
      type: item.type,
      minScore: item.minScore,
      title: item.title,
      description: item.description,
      extraInfo: item.extraInfo,
      displayOrder: item.displayOrder,
      isMandatory: item.isMandatory,
      courseCodes: item.courseCodes,
    });

    await setDoc(ref, data);
    return item;
  },

  async update(id: string, patch: UpdatePatch): Promise<Requirement> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);

    const existing = await getDoc(ref);
    if (!existing.exists()) throw new Error("דרישה לא נמצאה");

    const current = normalizeFromDb(existing.id, existing.data());

    const updated: Requirement = {
      ...current,
      ...patch,
      type: patch.type !== undefined ? normalizeType(patch.type) : current.type,
      minScore: patch.minScore !== undefined ? Number(patch.minScore) : current.minScore,
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
      displayOrder: patch.displayOrder !== undefined ? Number(patch.displayOrder) : current.displayOrder,
      isMandatory: patch.isMandatory !== undefined ? Boolean(patch.isMandatory) : current.isMandatory,
      courseCodes: patch.courseCodes !== undefined ? patch.courseCodes : current.courseCodes,
    };

    const data = clean({
      type: updated.type,
      minScore: updated.minScore,
      title: updated.title,
      description: updated.description,
      extraInfo: updated.extraInfo,
      displayOrder: updated.displayOrder,
      isMandatory: updated.isMandatory,
      courseCodes: updated.courseCodes,
    });

    await updateDoc(ref, data as any);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const docId = decodeURIComponent(id).trim();
    await deleteDoc(doc(firestore, COL, docId));
  },
};