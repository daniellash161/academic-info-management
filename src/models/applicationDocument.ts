export type DocumentType = "תעודת זהות" | "גליון ציונים" | "בגרות" | "פסיכומטרי" | "אחר";
export type DocumentStatus = "חסר" | "הועלה" | "אושר" | "נדחה";

export type ApplicationDocument = {
  id: string;
  candidateId: string; // must exist
  docType: DocumentType; // required
  title: string; // required, up to 50
  status: DocumentStatus; // required
  uploadedAt?: string; // YYYY-MM-DD (required when status != "חסר", not future)
  notes?: string; // up to 300
};