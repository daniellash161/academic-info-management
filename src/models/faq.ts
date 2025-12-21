export type Faq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string; // ISO
};