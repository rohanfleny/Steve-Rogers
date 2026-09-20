import {
  GateVideo,
  GateModule,
  GateSubject,
  ProgressSummary,
  GateProjectionSettings,
  GateProjectionResult,
} from '../types/gate';

/**
 * Calculates video progress for a single module.
 * Guaranteed: No NaN or Infinity on empty modules, capped between 0% and 100%.
 */
export function calculateModuleProgress(
  moduleId: string,
  videos: GateVideo[]
): ProgressSummary {
  const moduleVideos = videos.filter((v) => v.moduleId === moduleId);
  const total = moduleVideos.length;
  const completed = moduleVideos.filter((v) => v.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return {
    total,
    completed,
    remaining,
    percentage,
  };
}

/**
 * Calculates video progress for a subject across all its modules.
 */
export function calculateSubjectProgress(
  subjectId: string,
  modules: GateModule[],
  videos: GateVideo[]
): ProgressSummary {
  const subjectModuleIds = new Set(
    modules.filter((m) => m.subjectId === subjectId).map((m) => m.id)
  );
  const subjectVideos = videos.filter((v) => subjectModuleIds.has(v.moduleId));
  const total = subjectVideos.length;
  const completed = subjectVideos.filter((v) => v.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return {
    total,
    completed,
    remaining,
    percentage,
  };
}

/**
 * Calculates overall GATE progress across all configured videos.
 * Never hardcodes any arbitrary total.
 */
export function calculateOverallGateProgress(videos: GateVideo[]): ProgressSummary {
  const total = videos.length;
  const completed = videos.filter((v) => v.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return {
    total,
    completed,
    remaining,
    percentage,
  };
}

/**
 * Finds the next incomplete video in the active module following the configured video order.
 * Returns null if all videos in the module are completed or if module has no videos.
 */
export function getNextIncompleteVideo(
  moduleId: string | null,
  videos: GateVideo[]
): GateVideo | null {
  if (!moduleId) return null;
  const moduleVideos = videos
    .filter((v) => v.moduleId === moduleId)
    .sort((a, b) => a.order - b.order);

  return moduleVideos.find((v) => !v.completed) || null;
}

/**
 * Computes dynamic projection based on actual progress, target velocity, and dates.
 */
export function calculateGateProjection(
  settings: GateProjectionSettings,
  totalVideos: number,
  completedVideos: number,
  remainingVideos: number,
  videos: GateVideo[]
): GateProjectionResult {
  const originalTargetDate = settings.originalTargetDate || '';

  if (totalVideos === 0) {
    return {
      originalTargetDate: originalTargetDate || 'Not set',
      projectedCompletionDate: originalTargetDate || 'No videos added',
      daysRemaining: 0,
      status: 'no_target',
      message: 'Add subjects, modules, and videos to begin calculation',
    };
  }

  if (remainingVideos === 0) {
    return {
      originalTargetDate: originalTargetDate || 'Goal Reached',
      projectedCompletionDate: 'Completed',
      daysRemaining: 0,
      status: 'completed',
      message: 'All configured videos completed!',
    };
  }

  const dailyTarget = Math.max(0.5, settings.dailyVideoTarget || 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = settings.startDate ? new Date(settings.startDate) : new Date();
  startDate.setHours(0, 0, 0, 0);

  // Measure days elapsed since start date (at least 1 day)
  const diffMs = today.getTime() - startDate.getTime();
  const daysElapsed = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  // Calculate actual historical rate (videos/day)
  let actualRate = dailyTarget;
  if (completedVideos > 0) {
    actualRate = completedVideos / daysElapsed;
  }

  // Blended effective rate: 60% actual rate + 40% target pace
  const effectiveRate = Math.max(0.2, 0.6 * actualRate + 0.4 * dailyTarget);
  const daysRemaining = Math.ceil(remainingVideos / effectiveRate);

  const projectedDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const projectedCompletionDate = projectedDate.toISOString().slice(0, 10);

  let status: 'ahead' | 'behind' | 'on_track' = 'on_track';
  let message = 'On track with configured pace';

  if (originalTargetDate) {
    const origDate = new Date(originalTargetDate);
    origDate.setHours(0, 0, 0, 0);
    const varianceDays = Math.round(
      (projectedDate.getTime() - origDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (varianceDays < -2) {
      status = 'ahead';
      message = `${Math.abs(varianceDays)} days ahead of original target date`;
    } else if (varianceDays > 2) {
      status = 'behind';
      message = `${varianceDays} days behind original target date`;
    } else {
      status = 'on_track';
      message = 'Projected completion aligns with original target date';
    }
  }

  return {
    originalTargetDate: originalTargetDate || 'Not configured',
    projectedCompletionDate,
    daysRemaining,
    status,
    message,
  };
}

/**
 * Reorders an item within a list by swapping with its neighbor.
 */
export function reorderItems<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  direction: 'up' | 'down'
): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((it) => it.id === id);
  if (idx === -1) return items;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return items;

  // Swap orders
  const itemA = sorted[idx];
  const itemB = sorted[targetIdx];
  const orderA = itemA.order;
  const orderB = itemB.order;

  return sorted.map((it) => {
    if (it.id === itemA.id) {
      return { ...it, order: orderB };
    }
    if (it.id === itemB.id) {
      return { ...it, order: orderA };
    }
    return it;
  }).sort((a, b) => a.order - b.order);
}

/**
 * Calculates the Expected Completion Date for GATE:
 * - Paced at 1 video / day
 * - If remaining is 0: already completed!
 * - If today's GATE video is already marked as completed for today (isTodayGateDone === true):
 *   the remaining videos will take `remaining` days starting tomorrow (i.e. today + remaining days).
 * - If today's GATE video is not yet marked done today (isTodayGateDone === false):
 *   today itself will count for 1 video, and the remaining (remaining - 1) videos will take
 *   that many days after today (i.e. today + remaining - 1 days).
 * - Therefore: if a user misses today without marking it, tomorrow the remaining count is unchanged,
 *   so the target completion date naturally extends by 1 day!
 */
export function calculateExpectedCompletionDate(
  remainingVideos: number,
  isTodayGateDone: boolean,
  baseDateStr?: string
): {
  dateStr: string;
  formattedDate: string;
  remainingDays: number;
  isCompleted: boolean;
} {
  if (remainingVideos <= 0) {
    return {
      dateStr: baseDateStr || new Date().toISOString().split('T')[0],
      formattedDate: 'Completed!',
      remainingDays: 0,
      isCompleted: true,
    };
  }

  // Base date is today or given base date (YYYY-MM-DD)
  const todayStr = baseDateStr || new Date().toISOString().split('T')[0];
  const [y, m, d] = todayStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  // If today's video is already done, remaining videos take remainingVideos days starting tomorrow.
  // If today's video is NOT yet done, today is 1 video, so remaining take (remainingVideos - 1) days after today.
  const daysToAdd = isTodayGateDone ? remainingVideos : Math.max(0, remainingVideos - 1);
  targetDate.setDate(targetDate.getDate() + daysToAdd);

  const outYear = targetDate.getFullYear();
  const outMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const outDay = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${outYear}-${outMonth}-${outDay}`;

  const formattedDate = targetDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    dateStr,
    formattedDate,
    remainingDays: daysToAdd,
    isCompleted: false,
  };
}
