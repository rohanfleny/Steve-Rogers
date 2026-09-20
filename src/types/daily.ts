/**
 * Daily Productivity & Core Goals Type Definitions
 */

export type DailyGoalId = 'gate' | 'academics' | 'exercise' | 'project' | 'english';

export interface DailyGoalDefinition {
  id: DailyGoalId;
  title: string;
  target: string;
  category: 'Preparation' | 'Academics' | 'Health' | 'Development' | 'Communication';
  description: string;
}

export const DAILY_GOALS_DEFINITION: readonly DailyGoalDefinition[] = [
  {
    id: 'gate',
    title: 'GATE',
    target: '1 Video',
    category: 'Preparation',
    description: 'Watch exactly 1 GATE lecture video from active module',
  },
  {
    id: 'academics',
    title: 'Academics',
    target: '1 Video',
    category: 'Academics',
    description: 'Complete 1 curriculum or coursework video lecture',
  },
  {
    id: 'exercise',
    title: 'Exercise',
    target: '30 Minutes',
    category: 'Health',
    description: 'Physical workout, running, stretching, or gym session',
  },
  {
    id: 'project',
    title: 'Project / Skill',
    target: '1 Hour',
    category: 'Development',
    description: 'Focused coding, skill building, or project development',
  },
  {
    id: 'english',
    title: 'English Fluency',
    target: '30 Minutes',
    category: 'Communication',
    description: 'Speaking practice, reading aloud, or vocabulary building',
  },
] as const;

export type DailyGoalsState = Record<DailyGoalId, boolean>;

export interface DailyRecord {
  /** YYYY-MM-DD date string */
  date: string;
  /** Five core goals completion status */
  goals: DailyGoalsState;
  /** Separate sleep hours logged for this date (never affects 5/5 score) */
  sleepHours: number | null;
  /** Linked completed GATE video ID if completed via daily goal on this date */
  gateVideoCompletedId?: string;
  /** Optional brief daily note */
  note?: string;
  /** ISO timestamp of last modification */
  updatedAt: string;
}

export interface GoalCustomization {
  title: string;
  target?: string;
}

export type CustomGoalMap = Partial<Record<DailyGoalId, GoalCustomization>>;

export interface UserSettings {
  /** Target sleep in hours (default 7.5 or 8.0) */
  sleepTargetHours: number;
  /** Optional username or preferred name */
  name?: string;
  /** Customizable names and targets for the 5 daily work goals */
  customGoals?: CustomGoalMap;
}

export function getGoalTitle(goalId: DailyGoalId, settings?: UserSettings): string {
  const custom = settings?.customGoals?.[goalId]?.title?.trim();
  if (custom) return custom;
  const def = DAILY_GOALS_DEFINITION.find((g) => g.id === goalId);
  return def ? def.title : goalId;
}

export function getGoalTarget(goalId: DailyGoalId, settings?: UserSettings): string {
  const custom = settings?.customGoals?.[goalId]?.target?.trim();
  if (custom) return custom;
  const def = DAILY_GOALS_DEFINITION.find((g) => g.id === goalId);
  return def ? def.target : '';
}

export interface DailyProgressCalculation {
  completedCount: number;
  totalCount: 5;
  percentage: number;
  isAllCompleted: boolean;
}
