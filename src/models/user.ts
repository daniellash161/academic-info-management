export type UserRole = "CANDIDATE" | "ADMIN" | "STUDENT" | "GRADUATE";

export type InterestArea =
  | "תואר ראשון במדעי המחשב"
  | "תואר שני במדעי המחשב";

export type User = {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  interest?: InterestArea;
  notes?: string;
  createdAt: string; // ISO
};