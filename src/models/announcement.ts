export type Announcement = {
  id: string;
  title: string; // required, up to 60
  content: string; // required, up to 500
  publishedAt: string; // YYYY-MM-DD (not future)
  isActive: boolean;
};