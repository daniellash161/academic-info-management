export type ContactStatus = "חדש" | "בטיפול" | "טופל";

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;

  status: ContactStatus;
  adminNotes?: string;

  createdAt: string; // ISO
};