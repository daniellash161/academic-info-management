import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS } from "../storage/storage";
import type { Course } from "../models/course";

function readAll(): Course[] {
  return readLS<Course[]>(LS_KEYS.courses, []);
}

function writeAll(items: Course[]) {
  writeLS(LS_KEYS.courses, items);
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export const coursesService = {
  getAll(): Course[] {
    return [...readAll()].sort((a, b) => a.code.localeCompare(b.code));
  },

  getByCode(code: string): Course | undefined {
    const c = normalizeCode(code);
    return readAll().find((x) => normalizeCode(x.code) === c);
  },

  search(query: string): Course[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();

    return this.getAll().filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.lecturer ?? "").toLowerCase().includes(q)
      );
    });
  },

  create(course: Course): Course {
    const code = normalizeCode(course.code);

    // קוד ייחודי
    if (this.getByCode(code)) {
      throw new Error("Course code must be unique");
    }

    // לקורס קדם חייב להיות קורס קיים
    const prereq = course.prerequisites ?? [];
    for (const p of prereq) {
      if (!this.getByCode(p)) {
        throw new Error("Prerequisite course does not exist");
      }
    }

    const newCourse: Course = {
      ...course,
      code,
      prerequisites: prereq.length ? prereq.map(normalizeCode) : undefined,
    };

    const all = readAll();
    writeAll([newCourse, ...all]);
    return newCourse;
  },

  update(code: string, patch: Partial<Omit<Course, "code">>): Course | undefined {
    const c = normalizeCode(code);
    const all = readAll();
    const idx = all.findIndex((x) => normalizeCode(x.code) === c);
    if (idx === -1) return undefined;

    const updated: Course = {
      ...all[idx],
      ...patch,
      code: all[idx].code, // לא מאפשרים שינוי קוד בעריכה (שומר ייחודיות ופשטות)
    };

    const prereq = updated.prerequisites ?? [];
    for (const p of prereq) {
      if (!this.getByCode(p)) {
        throw new Error("Prerequisite course does not exist");
      }
    }

    updated.prerequisites = prereq.length ? prereq.map(normalizeCode) : undefined;

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(code: string) {
    const c = normalizeCode(code);
    const all = readAll().filter((x) => normalizeCode(x.code) !== c);

    const cleaned = all.map((x) => ({
      ...x,
      prerequisites: (x.prerequisites ?? []).filter((p) => normalizeCode(p) !== c),
    }));

    writeAll(cleaned);
  },
};