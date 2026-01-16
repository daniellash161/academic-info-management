export type Semester = "א" | "ב" | "קיץ";
export type Year = "א" | "ב" | "ג";

export type Course = {
  name: string;
  code: string;
  year: Year;
  semester: Semester;
  credits: number;
  prerequisites?: string[];
  syllabus?: string;
  lecturer?: string;
};
