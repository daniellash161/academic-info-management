export type ContactMessageStatus = "חדש" | "בטיפול" | "נסגר";

export type ContactMessage = {
  id: string;
  createdAt: string; // ISO
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;

  status: ContactMessageStatus;
  adminNote?: string;
};