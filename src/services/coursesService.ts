import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Course } from "../models/course";
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

function normalizeCourseFromDb(id: string, data: any): Course {
  return {
    code: id,
    name: String(data?.name ?? ""),
    semester: data?.semester,
    credits: Number(data?.credits ?? 0),
    prerequisites: Array.isArray(data?.prerequisites) ? data.prerequisites : [],
    syllabus: typeof data?.syllabus === "string" ? data.syllabus : undefined,
    lecturer: typeof data?.lecturer === "string" ? data.lecturer : undefined,
  };
}

export const coursesService = {
  async getAll(): Promise<Course[]> {
    const snap = await getDocs(collection(firestore, COL));
    return snap.docs.map((d) => normalizeCourseFromDb(d.id, d.data()));
  },

  async getByCode(code: string): Promise<Course | null> {
    const id = decodeURIComponent(code).trim();
    const ref = doc(firestore, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeCourseFromDb(snap.id, snap.data());
  },

  async create(course: Course): Promise<void> {
    const id = decodeURIComponent(course.code).trim();
    const ref = doc(firestore, COL, id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      throw new Error("קוד קורס חייב להיות ייחודי");
    }

    const data = clean({
      name: course.name.trim(),
      semester: course.semester,
      credits: Number(course.credits),
      prerequisites: course.prerequisites ?? [],
      syllabus: course.syllabus?.trim() || undefined,
      lecturer: course.lecturer?.trim() || undefined,
    });

    await setDoc(ref, data);
  },

  async update(code: string, patch: Partial<Omit<Course, "code">>): Promise<void> {
    const id = decodeURIComponent(code).trim();
    const ref = doc(firestore, COL, id);

    const existing = await getDoc(ref);
    if (!existing.exists()) {
      throw new Error("קורס לא נמצא");
    }

    const data = clean({
      name: patch.name !== undefined ? patch.name.trim() : undefined,
      semester: patch.semester,
      credits: patch.credits !== undefined ? Number(patch.credits) : undefined,
      prerequisites: patch.prerequisites,
      syllabus: patch.syllabus !== undefined ? patch.syllabus?.trim() || undefined : undefined,
      lecturer: patch.lecturer !== undefined ? patch.lecturer?.trim() || undefined : undefined,
    });

    await updateDoc(ref, data as any);
  },

  async remove(code: string): Promise<void> {
    const id = decodeURIComponent(code).trim();
    await deleteDoc(doc(firestore, COL, id));
  },
};