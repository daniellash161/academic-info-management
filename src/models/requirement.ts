// src/models/requirement.ts
export type RequirementType = "פסיכומטרי" | "בגרות" | "אנגלית";

export type Requirement = {
  id: string;
  type: RequirementType;
  minScore: number;
  title: string;
  description?: string;
  extraInfo?: string;
  displayOrder: number;
  isMandatory: boolean;
};