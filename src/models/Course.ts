// src/models/Course.ts

export class Course {
    // הגדרת המאפיינים (Properties) לפי מסמך האפיון
    code: string;           // מזהה ייחודי (למשל: CS101)
    name: string;           // שם הקורס
    semester: string;       // סמסטר (א/ב/קיץ)
    credits: number;        // נקודות זכות (מספר)
    syllabus: string;       // פירוט על הקורס
    lecturer: string;       // שם המרצה האחראי
    prerequisites: string;  // דרישות קדם (מגיע מה-Wireframe)

    // בנאי (Constructor) - הפונקציה שיוצרת את האובייקט בפועל
    // אנחנו מקבלים את כל הפרמטרים ומכניסים אותם למשתנים של המחלקה
    constructor(
        code: string, 
        name: string, 
        semester: string, 
        credits: number, 
        syllabus: string, 
        lecturer: string, 
        prerequisites: string
    ) {
        this.code = code;
        this.name = name;
        this.semester = semester;
        this.credits = credits;
        this.syllabus = syllabus;
        this.lecturer = lecturer;
        this.prerequisites = prerequisites;
    }
}