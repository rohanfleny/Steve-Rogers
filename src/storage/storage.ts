import { DailyRecord, UserSettings } from '../types/daily';
import { GateStoreState } from '../types/gate';
import { getEmptyDailyGoals } from '../logic/calculations';

const RECORDS_STORAGE_KEY = 'gate_productivity_records_v1';
const SETTINGS_STORAGE_KEY = 'gate_productivity_settings_v1';
const GATE_STORAGE_KEY = 'gate_data_store_v1';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  sleepTargetHours: 8.0,
  name: 'Scholar',
};

export const DEFAULT_GATE_STORE: GateStoreState = {
  subjects: [],
  modules: [],
  videos: [],
  activeConnection: {
    subjectId: null,
    moduleId: null,
  },
  projectionSettings: {
    dailyVideoTarget: 1,
    startDate: new Date().toISOString().slice(0, 10),
    originalTargetDate: '',
  },
};

/**
 * Loads all daily records from localStorage.
 * Guaranteed to return an empty map if no records exist (no fake/demo data).
 */
export function loadAllDailyRecords(): Record<string, DailyRecord> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse daily records from storage:', err);
  }
  return {};
}

/**
 * Saves all daily records to localStorage.
 */
export function saveAllDailyRecords(records: Record<string, DailyRecord>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save daily records to storage:', err);
  }
}

/**
 * Retrieves the record for a specific date, or initializes a clean, empty record if none exists.
 */
export function getDailyRecordForDate(date: string): DailyRecord {
  const all = loadAllDailyRecords();
  if (all[date]) {
    return {
      date,
      goals: {
        ...getEmptyDailyGoals(),
        ...(all[date].goals || {}),
      },
      sleepHours: all[date].sleepHours ?? null,
      gateVideoCompletedId: all[date].gateVideoCompletedId,
      note: all[date].note ?? '',
      updatedAt: all[date].updatedAt || new Date().toISOString(),
    };
  }

  return {
    date,
    goals: getEmptyDailyGoals(),
    sleepHours: null,
    gateVideoCompletedId: undefined,
    note: '',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Saves or updates the record for a single date.
 */
export function saveDailyRecord(record: DailyRecord): void {
  const all = loadAllDailyRecords();
  all[record.date] = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  saveAllDailyRecords(all);
}

/**
 * Loads user settings (e.g. sleep target).
 */
export function loadUserSettings(): UserSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_USER_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.error('Failed to load user settings:', err);
    return DEFAULT_USER_SETTINGS;
  }
}

/**
 * Saves user settings to localStorage.
 */
export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save user settings:', err);
  }
}

/**
 * Loads the complete GATE store from persistent localStorage.
 * Guaranteed: Zero fake/demo subjects, modules, or videos.
 */
export function loadGateStore(): GateStoreState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_GATE_STORE;
  }
  try {
    const raw = window.localStorage.getItem(GATE_STORAGE_KEY);
    if (!raw) return DEFAULT_GATE_STORE;
    const parsed = JSON.parse(raw);
    return {
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
      modules: Array.isArray(parsed.modules) ? parsed.modules : [],
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
      activeConnection: {
        subjectId: parsed.activeConnection?.subjectId ?? null,
        moduleId: parsed.activeConnection?.moduleId ?? null,
      },
      projectionSettings: {
        dailyVideoTarget: parsed.projectionSettings?.dailyVideoTarget ?? 1,
        startDate: parsed.projectionSettings?.startDate ?? new Date().toISOString().slice(0, 10),
        originalTargetDate: parsed.projectionSettings?.originalTargetDate ?? '',
      },
    };
  } catch (err) {
    console.error('Failed to load GATE store from storage:', err);
    return DEFAULT_GATE_STORE;
  }
}

/**
 * Saves the complete GATE store to persistent localStorage.
 */
export function saveGateStore(store: GateStoreState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save GATE store to storage:', err);
  }
}

/**
 * Exports all application data into a formatted JSON string.
 */
export function exportAppDataJSON(): string {
  const records = loadAllDailyRecords();
  const settings = loadUserSettings();
  const gateStore = loadGateStore();
  const payload = {
    version: 2,
    exportTimestamp: new Date().toISOString(),
    settings,
    records,
    gateStore,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Imports application data from a JSON string.
 */
export function importAppDataJSON(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON payload' };
    }

    if (parsed.records && typeof parsed.records === 'object') {
      saveAllDailyRecords(parsed.records);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveUserSettings({
        ...DEFAULT_USER_SETTINGS,
        ...parsed.settings,
      });
    }
    if (parsed.gateStore && typeof parsed.gateStore === 'object') {
      saveGateStore({
        ...DEFAULT_GATE_STORE,
        ...parsed.gateStore,
      });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'JSON parse error' };
  }
}

/**
 * Completely resets all local application data.
 */
export function clearAllAppData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(RECORDS_STORAGE_KEY);
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.localStorage.removeItem(GATE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset data:', err);
  }
}
