export type RegistrationDeadline = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  createdAt: string; // ISO
};