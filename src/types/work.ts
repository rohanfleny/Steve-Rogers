export type WorkPriority = 'Low' | 'Medium' | 'High';
export type WorkRepeat = 'none' | 'daily' | 'every2days' | 'weekly' | 'monthly';
export interface WorkCategory { id: string; name: string; icon: string; }
export interface WorkTask {
  id: string; title: string; description: string; date: string; time: string;
  categoryId: string; priority: WorkPriority; completed: boolean; completedAt?: string;
  remindersEnabled: boolean; reminderOffsets: number[]; alarmEnabled: boolean;
  repeat: WorkRepeat; repeatUntil: string; notes: string; createdAt: string;
}
export interface WorkStore { categories: WorkCategory[]; tasks: WorkTask[]; }
export const DEFAULT_WORK_STORE: WorkStore = {
  categories: [
    { id: 'academics', name: 'Academics', icon: 'book' },
    { id: 'sports', name: 'Sports', icon: 'trophy' },
    { id: 'projects', name: 'Projects', icon: 'laptop' },
    { id: 'personal', name: 'Personal', icon: 'user' },
    { id: 'meetings', name: 'Meetings', icon: 'users' },
  ], tasks: [],
};
