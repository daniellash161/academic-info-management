import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Course, Semester } from "../models/course";
import { firestore } from "../firebase/firebase";

const COL = "courses";

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    (out as any)[k] = v;
  }
  return out;
}

function normalizeSemester(x: any): Semester {
  return x === "א" || x === "ב" || x === "קיץ" ? x : "א";
}

function normalizeFromDb(id: string, data: any): Course {
  return {
    code: id,
    name: String(data?.name ?? ""),
    semester: normalizeSemester(data?.semester),
    credits: Number(data?.credits ?? 0),
    prerequisites: Array.isArray(data?.prerequisites)
      ? data.prerequisites.map((p: any) => String(p))
      : undefined,
    syllabus: typeof data?.syllabus === "string" ? data.syllabus : undefined,
    lecturer: typeof data?.lecturer === "string" ? data.lecturer : undefined,
  };
}

export const coursesService = {
  async getAll(): Promise<Course[]> {
    const snap = await getDocs(collection(firestore, COL));
    const items = snap.docs.map((d) => normalizeFromDb(d.id, d.data()));
    return items.sort((a, b) => a.code.localeCompare(b.code));
  },

  async getByCode(code: string): Promise<Course | null> {
    const id = decodeURIComponent(code).trim();
    const ref = doc(firestore, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeFromDb(snap.id, snap.data());
  },

  async create(course: Course): Promise<void> {
    const id = course.code.trim();
    if (!id) throw new Error("code is required");

    const ref = doc(firestore, COL, id);
    const exists = await getDoc(ref);
    if (exists.exists()) throw new Error("קוד קורס חייב להיות ייחודי");

    const data = clean({
      name: course.name.trim(),
      semester: course.semester,
      credits: Number(course.credits),
      prerequisites: course.prerequisites?.length ? course.prerequisites : undefined,
      syllabus: course.syllabus?.trim() ? course.syllabus.trim() : undefined,
      lecturer: course.lecturer?.trim() ? course.lecturer.trim() : undefined,
    });

    await setDoc(ref, data);
  },

  async update(code: string, patch: Partial<Omit<Course, "code">>): Promise<void> {
    const id = decodeURIComponent(code).trim();
    const ref = doc(firestore, COL, id);

    const exists = await getDoc(ref);
    if (!exists.exists()) throw new Error("קורס לא נמצא");

    const data = clean({
      name: patch.name !== undefined ? patch.name.trim() : undefined,
      semester: patch.semester,
      credits: patch.credits !== undefined ? Number(patch.credits) : undefined,
      prerequisites: patch.prerequisites,
      syllabus:
        patch.syllabus !== undefined
          ? patch.syllabus?.trim()
            ? patch.syllabus.trim()
            : undefined
          : undefined,
      lecturer:
        patch.lecturer !== undefined
          ? patch.lecturer?.trim()
            ? patch.lecturer.trim()
            : undefined
          : undefined,
    });

    await updateDoc(ref, data as any);
  },

  async remove(code: string): Promise<void> {
    const id = decodeURIComponent(code).trim();
    await deleteDoc(doc(firestore, COL, id));
  },
};