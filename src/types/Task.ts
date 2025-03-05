export type Task = {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., work, personal, urgent
  duedate: string;
  priority: 'low' | 'medium' | 'high';
};
