export type UserRole = "CANDIDATE" | "ADMIN" | "STUDENT" | "GRADUATE";

export type InterestArea =
    | "מדעי המחשב";
export type User = {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;     // חובה רק אם role=ADMIN
  interest?: InterestArea; // רשות, מרשימה סגורה
  notes?: string;        // רשות
  createdAt: string;
};