import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Faq } from "../models/faq";
import { firestore } from "../firebase/config";

const COL = "faqs";

type CreateInput = Omit<Faq, "id" | "createdAt">;
type UpdatePatch = Partial<Omit<Faq, "id" | "createdAt">>;

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function assertValidQuestion(question: string) {
  const q = (question ?? "").trim();
  if (!q) throw new Error("question is required");
  if (q.length > 120) throw new Error("question must be up to 120 characters");
}

function assertValidAnswer(answer: string) {
  const a = (answer ?? "").trim();
  if (!a) throw new Error("answer is required");
  if (a.length > 800) throw new Error("answer must be up to 800 characters");
}

function assertValidDisplayOrder(displayOrder: number) {
  const n = Number(displayOrder);
  if (!Number.isInteger(n) || n < 1) throw new Error("displayOrder must be an integer >= 1");
}

function normalizeFromDb(id: string, data: any): Faq {
  return {
    id,
    question: String(data?.question ?? ""),
    answer: String(data?.answer ?? ""),
    displayOrder: Number(data?.displayOrder ?? 1),
    isPublished: Boolean(data?.isPublished ?? false),
    createdAt: typeof data?.createdAt === "string" ? data.createdAt : "",
  };
}

export const faqsService = {
  async getAll(): Promise<Faq[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getPublished(): Promise<Faq[]> {
    const all = await this.getAll();
    return all.filter((f) => f.isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getById(id: string): Promise<Faq | null> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async create(input: CreateInput): Promise<Faq> {
    assertValidQuestion(input.question);
    assertValidAnswer(input.answer);
    assertValidDisplayOrder(Number(input.displayOrder));

    const ref = doc(collection(firestore, COL));

    const item: Faq = {
      id: ref.id,
      question: input.question.trim(),
      answer: input.answer.trim(),
      displayOrder: Number(input.displayOrder),
      isPublished: Boolean(input.isPublished),
      createdAt: new Date().toISOString(),
    };

    const data = clean({
      question: item.question,
      answer: item.answer,
      displayOrder: item.displayOrder,
      isPublished: item.isPublished,
      createdAt: item.createdAt,
    });

    await setDoc(ref, data);
    return item;
  },

  async update(id: string, patch: UpdatePatch): Promise<Faq> {
    const docId = decodeURIComponent(id).trim();
    const ref = doc(firestore, COL, docId);

    const existing = await getDoc(ref);
    if (!existing.exists()) throw new Error("FAQ לא נמצא");

    const current = normalizeFromDb(existing.id, existing.data());

    const nextQuestion = patch.question !== undefined ? patch.question.trim() : current.question;
    const nextAnswer = patch.answer !== undefined ? patch.answer.trim() : current.answer;
    const nextDisplayOrder =
      patch.displayOrder !== undefined ? Number(patch.displayOrder) : current.displayOrder;

    assertValidQuestion(nextQuestion);
    assertValidAnswer(nextAnswer);
    assertValidDisplayOrder(nextDisplayOrder);

    const updated: Faq = {
      ...current,
      ...patch,
      question: nextQuestion,
      answer: nextAnswer,
      displayOrder: nextDisplayOrder,
      isPublished: patch.isPublished !== undefined ? Boolean(patch.isPublished) : current.isPublished,
      createdAt: current.createdAt,
    };

    const data = clean({
      question: updated.question,
      answer: updated.answer,
      displayOrder: updated.displayOrder,
      isPublished: updated.isPublished,
    });

    await updateDoc(ref, data as any);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const docId = decodeURIComponent(id).trim();
    await deleteDoc(doc(firestore, COL, docId));
  },

  async search(query: string, publishedOnly: boolean): Promise<Faq[]> {
    const q = query.trim().toLowerCase();
    let rows = await this.getAll();

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