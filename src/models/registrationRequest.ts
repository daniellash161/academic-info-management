export type RequestStatus = "בטיוטה" | "נשלחה" | "מאושרת" | "נדחתה";

export type RegistrationRequest = {
  requestNumber: number;   // מספר רץ (מזהה ייחודי)
  candidateId: string;     // קישור למועמד קיים
  status: RequestStatus;   // אחד הערכים המוגדרים
  createdAt: string;       // YYYY-MM-DD (לא עתידי)
  notes?: string;          // עד 300 תווים
};