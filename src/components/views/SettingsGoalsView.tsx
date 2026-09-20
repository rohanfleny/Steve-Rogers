import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Dumbbell,
  Laptop,
  MessageSquare,
  Bed,
  Download,
  Upload,
  RotateCcw,
  Pencil,
  Check,
  Minus,
  Plus,
  X,
} from 'lucide-react';

import {
  DailyGoalId,
  UserSettings,
  getGoalTitle,
  getGoalTarget,
} from '../../types/daily';

import { GateStoreState } from '../../types/gate';

interface SettingsGoalsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onExportJSON: () => string;
  onImportJSON: (
    jsonString: string
  ) => {
    success: boolean;
    error?: string;
    message?: string;
  };
  onResetAllData: () => void;
  gateStore?: GateStoreState;
  onUpdateActiveGateModule?: (
    subjectId: string,
    moduleId: string
  ) => void;
}

interface GoalEditorConfig {
  id: DailyGoalId;
  defaultTitle: string;
  defaultTarget: number;
  unit: 'Video' | 'Minutes' | 'Hours';
  icon: React.ReactNode;
}

const GOAL_CONFIGS: GoalEditorConfig[] = [
  {
    id: 'gate',
    defaultTitle: 'GATE',
    defaultTarget: 1,
    unit: 'Video',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: 'academics',
    defaultTitle: 'Academics',
    defaultTarget: 1,
    unit: 'Video',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'exercise',
    defaultTitle: 'Exercise',
    defaultTarget: 30,
    unit: 'Minutes',
    icon: <Dumbbell className="w-4 h-4" />,
  },
  {
    id: 'project',
    defaultTitle: 'Project / Skill',
    defaultTarget: 1,
    unit: 'Hours',
    icon: <Laptop className="w-4 h-4" />,
  },
  {
    id: 'english',
    defaultTitle: 'English Fluency',
    defaultTarget: 30,
    unit: 'Minutes',
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

function parseTargetNumber(
  target: string,
  fallback: number
): number {
  const match = target.match(/[\d.]+/);

  if (!match) {
    return fallback;
  }

  const value = Number(match[0]);

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function formatTarget(
  value: number,
  unit: GoalEditorConfig['unit']
): string {
  const cleanValue = Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(1)));

  return `${cleanValue} ${unit}${value === 1 ? '' : 's'}`;
}

export const SettingsGoalsView: React.FC<
  SettingsGoalsViewProps
> = ({
  settings,
  onUpdateSettings,
  onExportJSON,
  onImportJSON,
  onResetAllData,
  gateStore,
  onUpdateActiveGateModule,
}) => {
  const [name, setName] = useState(
    settings.name || 'Rohan'
  );

  const [sleepTarget, setSleepTarget] =
    useState<number>(
      settings.sleepTargetHours
    );

  const [editingGoal, setEditingGoal] =
    useState<DailyGoalId | null>(null);

  const [editingTitle, setEditingTitle] =
    useState('');

  const [editingTarget, setEditingTarget] =
    useState(1);

  const [savedSuccess, setSavedSuccess] =
    useState(false);

  const [importStatus, setImportStatus] =
    useState<string | null>(null);

  /*
   * --------------------------------------------------
   * GATE ACTIVE CONNECTION
   * --------------------------------------------------
   */

  const initialSubjectId =
    gateStore?.activeConnection?.subjectId ||
    gateStore?.subjects?.[0]?.id ||
    '';

  const [activeSubjId, setActiveSubjId] =
    useState<string>(initialSubjectId);

  const modulesForSubject =
    gateStore?.modules?.filter(
      (module) =>
        module.subjectId === activeSubjId
    ) || [];

  const initialModuleId =
    gateStore?.activeConnection?.moduleId ||
    modulesForSubject[0]?.id ||
    '';

  const [activeModId, setActiveModId] =
    useState<string>(initialModuleId);

  /*
   * --------------------------------------------------
   * SYNC SETTINGS
   * --------------------------------------------------
   */

  useEffect(() => {
    setName(settings.name || 'Rohan');

    setSleepTarget(
      settings.sleepTargetHours
    );
  }, [
    settings.name,
    settings.sleepTargetHours,
  ]);

  /*
   * --------------------------------------------------
   * SYNC ACTIVE SUBJECT
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!gateStore) {
      return;
    }

    const subjectId =
      gateStore.activeConnection?.subjectId ||
      gateStore.subjects?.[0]?.id ||
      '';

    setActiveSubjId(subjectId);
  }, [
    gateStore?.activeConnection?.subjectId,
    gateStore?.subjects,
  ]);

  /*
   * --------------------------------------------------
   * SYNC ACTIVE MODULE
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!gateStore) {
      return;
    }

    const modules =
      gateStore.modules?.filter(
        (module) =>
          module.subjectId === activeSubjId
      ) || [];

    const savedModuleId =
      gateStore.activeConnection?.moduleId ||
      '';

    const savedModuleExists =
      modules.some(
        (module) =>
          module.id === savedModuleId
      );

    if (savedModuleExists) {
      setActiveModId(savedModuleId);
    } else {
      setActiveModId(
        modules[0]?.id || ''
      );
    }
  }, [
    activeSubjId,
    gateStore?.modules,
    gateStore?.activeConnection?.moduleId,
  ]);

  /*
   * --------------------------------------------------
   * SAVE GENERAL SETTINGS
   * --------------------------------------------------
   */

  const handleSavePreferences = () => {
    onUpdateSettings({
      ...settings,
      name: name.trim() || 'Rohan',
      sleepTargetHours: sleepTarget,
    });

    if (
      onUpdateActiveGateModule &&
      activeSubjId &&
      activeModId
    ) {
      onUpdateActiveGateModule(
        activeSubjId,
        activeModId
      );
    }

    setSavedSuccess(true);

    window.setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  /*
   * --------------------------------------------------
   * GOAL EDITOR
   * --------------------------------------------------
   */

  const openGoalEditor = (
    goal: GoalEditorConfig
  ) => {
    const currentTitle =
      getGoalTitle(
        goal.id,
        settings
      );

    const currentTarget =
      getGoalTarget(
        goal.id,
        settings
      );

    setEditingGoal(goal.id);

    setEditingTitle(
      currentTitle || goal.defaultTitle
    );

    setEditingTarget(
      parseTargetNumber(
        currentTarget,
        goal.defaultTarget
      )
    );
  };

  const cancelGoalEditor = () => {
    setEditingGoal(null);
    setEditingTitle('');
    setEditingTarget(1);
  };

  const saveGoalEditor = (
    goal: GoalEditorConfig
  ) => {
    const cleanTitle =
      editingTitle.trim() ||
      goal.defaultTitle;

    const safeTarget =
      Number.isFinite(editingTarget) &&
      editingTarget > 0
        ? editingTarget
        : goal.defaultTarget;

    const updatedCustomGoals = {
      ...(settings.customGoals || {}),
      [goal.id]: {
        title: cleanTitle,
        target: formatTarget(
          safeTarget,
          goal.unit
        ),
      },
    };

    onUpdateSettings({
      ...settings,
      customGoals: updatedCustomGoals,
    });

    setEditingGoal(null);
    setEditingTitle('');
    setEditingTarget(1);

    setSavedSuccess(true);

    window.setTimeout(() => {
      setSavedSuccess(false);
    }, 1500);
  };

  const increaseGoalTarget = (
    goal: GoalEditorConfig
  ) => {
    const step =
      goal.unit === 'Minutes'
        ? 5
        : 1;

    setEditingTarget((current) =>
      Math.min(
        current + step,
        999
      )
    );
  };

  const decreaseGoalTarget = (
    goal: GoalEditorConfig
  ) => {
    const step =
      goal.unit === 'Minutes'
        ? 5
        : 1;

    setEditingTarget((current) =>
      Math.max(
        current - step,
        1
      )
    );
  };

  /*
   * --------------------------------------------------
   * GATE SUBJECT
   * --------------------------------------------------
   */

  const handleSubjectChange = (
    subjectId: string
  ) => {
    setActiveSubjId(subjectId);

    const modules =
      gateStore?.modules?.filter(
        (module) =>
          module.subjectId === subjectId
      ) || [];

    const firstModule =
      modules[0]?.id || '';

    setActiveModId(firstModule);

    if (
      onUpdateActiveGateModule &&
      subjectId &&
      firstModule
    ) {
      onUpdateActiveGateModule(
        subjectId,
        firstModule
      );
    }
  };

  /*
   * --------------------------------------------------
   * GATE MODULE
   * --------------------------------------------------
   */

  const handleModuleChange = (
    moduleId: string
  ) => {
    setActiveModId(moduleId);

    if (
      onUpdateActiveGateModule &&
      activeSubjId &&
      moduleId
    ) {
      onUpdateActiveGateModule(
        activeSubjId,
        moduleId
      );
    }
  };

  /*
   * --------------------------------------------------
   * BACKUP EXPORT
   * --------------------------------------------------
   */

  const handleExportBackup = () => {
    const json = onExportJSON();

    const blob = new Blob(
      [json],
      {
        type: 'application/json',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;

    anchor.download =
      `study_journal_backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  /*
   * --------------------------------------------------
   * BACKUP IMPORT
   * --------------------------------------------------
   */

  const handleImportBackup = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !== 'string'
      ) {
        setImportStatus(
          'Unable to read backup file.'
        );

        return;
      }

      const response =
        onImportJSON(result);

      if (response.success) {
        setImportStatus(
          'Data successfully restored!'
        );
      } else {
        setImportStatus(
          response.error ||
            'Failed to restore data.'
        );
      }

      window.setTimeout(() => {
        setImportStatus(null);
      }, 3500);
    };

    reader.onerror = () => {
      setImportStatus(
        'Unable to read backup file.'
      );
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  /*
   * --------------------------------------------------
   * RESET
   * --------------------------------------------------
   */

  const handleResetAllData = () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to reset all app data? This cannot be undone.'
      );

    if (confirmed) {
      onResetAllData();
    }
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div
      id="settings-goals-view"
      className="space-y-4 pb-6 font-handwriting text-[#1C1917]"
    >
      {/* ============================================
          PERSONAL PROFILE
          ============================================ */}

      <section className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy mb-3">
          Personal Profile
        </h3>

        <div className="flex items-center gap-3">
          <label className="w-20 shrink-0 text-sm text-[#78716C]">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(
                event.target.value
              );
            }}
            placeholder="Rohan"
            className="flex-1 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>
      </section>

      {/* ============================================
          DAILY GOALS
          ============================================ */}

      <section className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold font-fancy">
            Daily Goals
          </h3>

          <span className="text-xs text-[#78716C]">
            Customize
          </span>
        </div>

        <div>
          {GOAL_CONFIGS.map(
            (goal) => {
              const isEditing =
                editingGoal ===
                goal.id;

              const title =
                getGoalTitle(
                  goal.id,
                  settings
                );

              const target =
                getGoalTarget(
                  goal.id,
                  settings
                );

              return (
                <div
                  key={goal.id}
                  className="border-b border-[#E5DDD0] last:border-b-0"
                >
                  {!isEditing && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {goal.icon}

                        <span className="font-bold truncate">
                          {title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#78716C]">
                          {target} / day
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            openGoalEditor(
                              goal
                            );
                          }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] active:bg-[#E8E1D4] cursor-pointer"
                          aria-label={`Edit ${title}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#78716C]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="py-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {goal.icon}

                          <span className="font-bold">
                            Edit {title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={
                            cancelGoalEditor
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] cursor-pointer"
                          aria-label="Close editor"
                        >
                          <X className="w-4 h-4 text-[#78716C]" />
                        </button>
                      </div>

                      {/* GOAL NAME */}

                      <div>
                        <label className="block text-xs font-bold text-[#78716C] mb-1">
                          Goal Name
                        </label>

                        <input
                          type="text"
                          value={
                            editingTitle
                          }
                          onChange={(
                            event
                          ) => {
                            setEditingTitle(
                              event.target
                                .value
                            );
                          }}
                          className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                        />
                      </div>

                      {/* DAILY TARGET */}

                      <div>
                        <label className="block text-xs font-bold text-[#78716C] mb-1">
                          Daily Target
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              decreaseGoalTarget(
                                goal
                              );
                            }}
                            className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Decrease target"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="flex-1 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center gap-2">
                            <span className="text-xl font-bold">
                              {
                                editingTarget
                              }
                            </span>

                            <span className="text-sm text-[#78716C]">
                              {goal.unit}
                              {editingTarget ===
                              1
                                ? ''
                                : 's'}{' '}
                              / day
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              increaseGoalTarget(
                                goal
                              );
                            }}
                            className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Increase target"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* SAVE / CANCEL */}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            saveGoalEditor(
                              goal
                            );
                          }}
                          className="flex-1 rounded-xl bg-[#1C1917] text-white px-4 py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-black cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelGoalEditor
                          }
                          className="rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] px-4 py-2.5 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
