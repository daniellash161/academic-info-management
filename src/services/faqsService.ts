import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { Faq } from "../models/faq";

type CreateInput = Omit<Faq, "id" | "createdAt">;
type UpdatePatch = Partial<Omit<Faq, "id" | "createdAt">>;

function getAll(): Faq[] {
  return readLS<Faq[]>(LS_KEYS.faqs, []);
}

function saveAll(items: Faq[]) {
  writeLS(LS_KEYS.faqs, items);
}

export const faqsService = {
  getAll(): Faq[] {
    return [...getAll()].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getPublished(): Faq[] {
    return getAll()
      .filter((f) => f.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getById(id: string): Faq | undefined {
    return getAll().find((x) => x.id === id);
  },

  create(input: CreateInput): Faq {
    const item: Faq = {
      id: makeId(),
      question: input.question.trim(),
      answer: input.answer.trim(),
      displayOrder: Number(input.displayOrder),
      isPublished: Boolean(input.isPublished),
      createdAt: new Date().toISOString(),
    };

    const all = getAll();
    saveAll([item, ...all]);
    return item;
  },

  update(id: string, patch: UpdatePatch): Faq {
    const all = getAll();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("FAQ לא נמצא");

    const current = all[idx];
    const updated: Faq = {
      ...current,
      ...patch,
      question: patch.question !== undefined ? patch.question.trim() : current.question,
      answer: patch.answer !== undefined ? patch.answer.trim() : current.answer,
      displayOrder:
        patch.displayOrder !== undefined ? Number(patch.displayOrder) : current.displayOrder,
      isPublished: patch.isPublished !== undefined ? Boolean(patch.isPublished) : current.isPublished,
    };

    all[idx] = updated;
    saveAll(all);
    return updated;
  },

  remove(id: string) {
    saveAll(getAll().filter((x) => x.id !== id));
  },

  search(query: string, publishedOnly: boolean): Faq[] {
    const q = query.trim().toLowerCase();
    let rows = getAll();

    if (publishedOnly) rows = rows.filter((x) => x.isPublished);

    if (q) {
      rows = rows.filter((x) => {
        const hay = [x.question, x.answer].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => a.displayOrder - b.displayOrder);
  },
};