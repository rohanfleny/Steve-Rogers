/**
 * Complete Data Models for the GATE Preparation System
 */

export interface GateVideo {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface GateModule {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  /** Independent module revision flag (does NOT affect video progress) */
  revisionCompleted: boolean;
  revisionCompletedAt?: string;
  /** Independent module PYQ flag (does NOT affect video progress) */
  pyqCompleted: boolean;
  pyqCompletedAt?: string;
}

export interface GateSubject {
  id: string;
  title: string;
  code?: string;
  order: number;
}

export interface ActiveGateConnection {
  subjectId: string | null;
  moduleId: string | null;
}

export interface GateProjectionSettings {
  dailyVideoTarget: number;
  startDate: string; // YYYY-MM-DD
  originalTargetDate: string; // YYYY-MM-DD
}

export interface GateStoreState {
  subjects: GateSubject[];
  modules: GateModule[];
  videos: GateVideo[];
  activeConnection: ActiveGateConnection;
  projectionSettings: GateProjectionSettings;
}

export interface ProgressSummary {
  completed: number;
  total: number;
  remaining: number;
  percentage: number;
}

export interface ModuleWithProgress extends GateModule {
  progress: ProgressSummary;
  nextIncompleteVideo: GateVideo | null;
}

export interface SubjectWithProgress extends GateSubject {
  modules: ModuleWithProgress[];
  progress: ProgressSummary;
}

export interface GateProjectionResult {
  originalTargetDate: string;
  projectedCompletionDate: string;
  daysRemaining: number;
  status: 'on_track' | 'ahead' | 'behind' | 'completed' | 'no_target';
  message: string;
}
