export type RequirementType = "פסיכומטרי" | "בגרות" | "אנגלית";

export type Requirement = {
  id: string;               // מזהה פנימי (לעריכה/מחיקה)
  type: RequirementType;    // חובה (רשימה סגורה)
  minScore: number;         // חובה
  title: string;            // חובה
  description?: string;     // רשות
  extraInfo?: string;       // רשות
  displayOrder: number;     // סדר תצוגה (עדיפות)
  isMandatory: boolean;     // דרישת חובה
};