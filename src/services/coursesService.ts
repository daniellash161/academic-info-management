import { LS_KEYS } from "../storage/lsKeys";
import { readLS, writeLS } from "../storage/storage";
import type { Course } from "../models/course";

function getAllCourses(): Course[] {
  return readLS<Course[]>(LS_KEYS.courses, []);
}

function saveAllCourses(courses: Course[]) {
  writeLS(LS_KEYS.courses, courses);
}

export const coursesService = {
  getAll(): Course[] {
    return getAllCourses();
  },

  getByCode(code: string): Course | undefined {
    const c = decodeURIComponent(code).trim();
    return getAllCourses().find((x) => x.code === c);
  },

  isCourseCodeTaken(code: string, excludeCode?: string): boolean {
    const c = decodeURIComponent(code).trim();
    return getAllCourses().some((x) => x.code === c && x.code !== excludeCode);
  },

  create(course: Course) {
    const c = course.code.trim();
    if (this.isCourseCodeTaken(c)) {
      throw new Error("קוד קורס חייב להיות ייחודי");
    }

    const all = getAllCourses();
    saveAllCourses([{ ...course, code: c, name: course.name.trim() }, ...all]);
  },

  update(code: string, patch: Partial<Omit<Course, "code">>) {
    const key = decodeURIComponent(code).trim();
    const all = getAllCourses();
    const idx = all.findIndex((x) => x.code === key);
    if (idx === -1) throw new Error("קורס לא נמצא");

    all[idx] = {
      ...all[idx],
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : all[idx].name,
      lecturer: patch.lecturer !== undefined ? (patch.lecturer?.trim() || undefined) : all[idx].lecturer,
      syllabus: patch.syllabus !== undefined ? (patch.syllabus?.trim() || undefined) : all[idx].syllabus,
      prerequisites: patch.prerequisites ?? all[idx].prerequisites,
    };

    saveAllCourses(all);
  },

  remove(code: string) {
    const c = decodeURIComponent(code).trim();
    const all = getAllCourses();
    saveAllCourses(all.filter((x) => x.code !== c));
  },

  search(query: string): Course[] {
    const q = query.trim().toLowerCase();
    const all = getAllCourses();
    if (!q) return all;

    return all.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const code = (c.code ?? "").toLowerCase();
      const lecturer = (c.lecturer ?? "").toLowerCase();
      return name.includes(q) || code.includes(q) || lecturer.includes(q);
    });
  },
};