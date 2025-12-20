export type Semester = "א" | "ב" | "קיץ";

export type Course = {
  name: string;            // חובה, עד 50 תווים
  code: string;            // חובה, ייחודי
  semester: Semester;      // חובה
  credits: number;         // חובה, 1-5
  prerequisites?: string[]; // רשות, קודי קורסים קיימים
  syllabus?: string;       // רשות
  lecturer?: string;       // רשות
};