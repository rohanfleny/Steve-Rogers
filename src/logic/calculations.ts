import { DailyGoalsState, DailyProgressCalculation, DAILY_GOALS_DEFINITION, DailyRecord } from '../types/daily';

/**
 * Returns an initial state with all five daily goals set to false.
 */
export function getEmptyDailyGoals(): DailyGoalsState {
  return {
    gate: false,
    academics: false,
    exercise: false,
    project: false,
    english: false,
  };
}

/**
 * Calculates the 5-goal completion statistics.
 * Sleep is strictly excluded from this calculation.
 */
export function calculateDailyProgress(goals: DailyGoalsState | undefined): DailyProgressCalculation {
  if (!goals) {
    return {
      completedCount: 0,
      totalCount: 5,
      percentage: 0,
      isAllCompleted: false,
    };
  }

  let completedCount = 0;
  for (const def of DAILY_GOALS_DEFINITION) {
    if (goals[def.id] === true) {
      completedCount++;
    }
  }

  const percentage = Math.round((completedCount / 5) * 100);

  return {
    completedCount,
    totalCount: 5,
    percentage,
    isAllCompleted: completedCount === 5,
  };
}

/**
 * Returns the local date string in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shifts a YYYY-MM-DD date string by a given number of days.
 */
export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/**
 * Returns a human-friendly label for a date string:
 * e.g., "Today", "Yesterday", "Tomorrow", or "Sat, Sep 20".
 */
export function getRelativeDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Formats a YYYY-MM-DD date into full readable text:
 * e.g., "Saturday, September 20, 2026"
 */
export function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generates an array of date strings centered around a selected date.
 * Default provides 7 days (3 before, center, 3 after).
 */
export function getDateStripRange(centerDate: string, daysBefore = 3, daysAfter = 3): string[] {
  const dates: string[] = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    dates.push(shiftDate(centerDate, i));
  }
  return dates;
}

/**
 * Calculates current streak and perfect days count.
 */
export function calculateStreakStats(records: Record<string, DailyRecord>, referenceDate: string): {
  currentStreak: number;
  totalPerfectDays: number;
  totalActiveDays: number;
} {
  let totalPerfectDays = 0;
  let totalActiveDays = 0;

  for (const date in records) {
    const rec = records[date];
    const { completedCount } = calculateDailyProgress(rec.goals);
    if (completedCount > 0 || (rec.sleepHours !== null && rec.sleepHours > 0)) {
      totalActiveDays++;
    }
    if (completedCount === 5) {
      totalPerfectDays++;
    }
  }

  // Count backwards from referenceDate
  let currentStreak = 0;
  let checkDate = referenceDate;

  while (true) {
    const rec = records[checkDate];
    if (!rec) {
      // If reference date is today and no goals are completed yet, check yesterday
      if (checkDate === referenceDate && currentStreak === 0) {
        checkDate = shiftDate(checkDate, -1);
        const yRec = records[checkDate];
        if (yRec) {
          const { completedCount } = calculateDailyProgress(yRec.goals);
          if (completedCount > 0) {
            currentStreak++;
            checkDate = shiftDate(checkDate, -1);
            continue;
          }
        }
      }
      break;
    }

    const { completedCount } = calculateDailyProgress(rec.goals);
    if (completedCount > 0) {
      currentStreak++;
      checkDate = shiftDate(checkDate, -1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    totalPerfectDays,
    totalActiveDays,
  };
}
