import React, { useState, useEffect } from 'react';
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
  ) => { success: boolean; error?: string; message?: string };
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

const GOAL_EDITOR_CONFIG: GoalEditorConfig[] = [
  {
    id: 'gate',
    defaultTitle: 'GATE',
    defaultTarget: 1,
    unit: 'Video',
    icon: (
      <GraduationCap className="w-4 h-4 text-[#1C1917]" />
    ),
  },
  {
    id: 'academics',
    defaultTitle: 'Academics',
    defaultTarget: 1,
    unit: 'Video',
    icon: (
      <BookOpen className="w-4 h-4 text-[#1C1917]" />
    ),
  },
  {
    id: 'exercise',
    defaultTitle: 'Exercise',
    defaultTarget: 30,
    unit: 'Minutes',
    icon: (
      <Dumbbell className="w-4 h-4 text-[#1C1917]" />
    ),
  },
  {
    id: 'project',
    defaultTitle: 'Project / Skill',
    defaultTarget: 1,
    unit: 'Hours',
    icon: (
      <Laptop className="w-4 h-4 text-[#1C1917]" />
    ),
  },
  {
    id: 'english',
    defaultTitle: 'English Fluency',
    defaultTarget: 30,
    unit: 'Minutes',
    icon: (
      <MessageSquare className="w-4 h-4 text-[#1C1917]" />
    ),
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
  const [sleepTarget, setSleepTarget] = useState(
    settings.sleepTargetHours
  );

  const [name, setName] = useState(
    settings.name || 'Rohan'
  );

  const [savedSuccess, setSavedSuccess] =
    useState(false);

  const [importStatus, setImportStatus] =
    useState<string | null>(null);

  const [editingGoal, setEditingGoal] =
    useState<DailyGoalId | null>(null);

  const [editingTitle, setEditingTitle] =
    useState('');

  const [editingTarget, setEditingTarget] =
    useState(1);

  const initialSubj =
    gateStore?.activeConnection?.subjectId ||
    gateStore?.subjects[0]?.id ||
    '';

  const [activeSubjId, setActiveSubjId] =
    useState<string>(initialSubj);

  const availableMods =
    gateStore?.modules.filter(
      (module) =>
        module.subjectId === activeSubjId
    ) || [];

  const initialMod =
    gateStore?.activeConnection?.moduleId ||
    availableMods[0]?.id ||
    '';

  const [activeModId, setActiveModId] =
    useState<string>(initialMod);

  useEffect(() => {
    if (gateStore?.activeConnection?.subjectId) {
      setActiveSubjId(
        gateStore.activeConnection.subjectId
      );
    }

    if (gateStore?.activeConnection?.moduleId) {
      setActiveModId(
        gateStore.activeConnection.moduleId
      );
    }
  }, [gateStore?.activeConnection]);

  useEffect(() => {
    setSleepTarget(settings.sleepTargetHours);
    setName(settings.name || 'Rohan');
  }, [
    settings.sleepTargetHours,
    settings.name,
  ]);

  const handleSubjChange = (
    newSubj: string
  ) => {
    setActiveSubjId(newSubj);

    const modules =
      gateStore?.modules.filter(
        (module) =>
          module.subjectId === newSubj
      ) || [];

    const newMod =
      modules[0]?.id || '';

    setActiveModId(newMod);

    if (
      onUpdateActiveGateModule &&
      newMod
    ) {
      onUpdateActiveGateModule(
        newSubj,
        newMod
      );
    }
  };

  const handleModChange = (
    newMod: string
  ) => {
    setActiveModId(newMod);

    if (
      onUpdateActiveGateModule &&
      activeSubjId &&
      newMod
    ) {
      onUpdateActiveGateModule(
        activeSubjId,
        newMod
      );
    }
  };

  const handleSaveSettings = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    onUpdateSettings({
      ...settings,
      sleepTargetHours: sleepTarget,
      name: name.trim() || 'Rohan',
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
      customGoals:
        updatedCustomGoals,
    });

    setEditingGoal(null);
    setEditingTitle('');
    setEditingTarget(1);

    setSavedSuccess(true);

    window.setTimeout(() => {
      setSavedSuccess(false);
    }, 1500);
  };

  const increaseTarget = (
    goal: GoalEditorConfig
  ) => {
    const step =
      goal.unit === 'Minutes'
        ? 5
        : 1;

    setEditingTarget(
      Math.min(
        editingTarget + step,
        999
      )
    );
  };

  const decreaseTarget = (
    goal: GoalEditorConfig
  ) => {
    const step =
      goal.unit === 'Minutes'
        ? 5
        : 1;

    setEditingTarget(
      Math.max(
        editingTarget - step,
        1
      )
    );
  };

  const handleDownloadBackup = () => {
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

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = (event) => {
      const text =
        event.target?.result;

      if (
        typeof text !== 'string'
      ) {
        setImportStatus(
          'Unable to read backup file.'
        );

        return;
      }

      const result =
        onImportJSON(text);

      setImportStatus(
        result.success
          ? 'Data successfully restored!'
          : result.error ||
              'Failed to restore data.'
      );

      window.setTimeout(() => {
        setImportStatus(null);
      }, 3500);
    };

    reader.onerror = () => {
      setImportStatus(
        'Unable to read backup file.'
      );

      window.setTimeout(() => {
        setImportStatus(null);
      }, 3500);
    };

    reader.readAsText(file);

    e.target.value = '';
  };

  const handleReset = () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to reset all app data? This cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    onResetAllData();
  };

  return (
    <div
      id="settings-goals-view"
      className="space-y-4 font-handwriting text-[#1C1917] pb-6"
    >
      {/* Personal Profile */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-base sm:text-lg font-bold font-fancy">
          Personal Profile
        </h3>

        <div className="flex items-center gap-3">
          <label className="text-sm text-[#78716C] w-20 shrink-0">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Rohan"
            className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-1.5 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>
      </div>

      {/* Daily Goals */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold font-fancy">
            Daily Goals
          </h3>

          <span className="text-xs text-[#78716C]">
            Customize
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {GOAL_EDITOR_CONFIG.map(
            (goal, index) => {
              const isEditing =
                editingGoal === goal.id;

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
                  className={
                    index <
                    GOAL_EDITOR_CONFIG.length - 1
                      ? 'border-b border-[#E5DDD0]'
                      : ''
                  }
                >
                  {!isEditing ? (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {goal.icon}

                        <span className="font-bold text-[#1C1917] truncate">
                          {title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#78716C]">
                          {target} / day
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            openGoalEditor(
                              goal
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F1ECE1] active:bg-[#E8E1D4] cursor-pointer"
                          aria-label={`Edit ${title}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#78716C]" />
                        </button>
                      </div>
                    </div>
                  ) : (
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
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1ECE1] cursor-pointer"
                          aria-label="Cancel editing"
                        >
                          <X className="w-4 h-4 text-[#78716C]" />
                        </button>
                      </div>

                      {/* Goal Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#78716C] mb-1">
                          Goal Name
                        </label>

                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) =>
                            setEditingTitle(
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                        />
                      </div>

                      {/* Daily Target */}
                      <div>
                        <label className="block text-xs font-bold text-[#78716C] mb-1">
                          Daily Target
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseTarget(
                                goal
                              )
                            }
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Decrease target"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="flex-1 flex items-center justify-center gap-2 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl h-11">
                            <span className="text-xl font-bold font-mono">
                              {editingTarget}
                            </span>

                            <span className="text-sm text-[#78716C]">
                              {goal.unit}
                              {editingTarget ===
                              1
                                ? ''
                                : 's'}
                              {' / day'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              increaseTarget(
                                goal
                              )
                            }
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Increase target"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            saveGoalEditor(
                              goal
                            )
                          }
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1C1917] text-white font-bold hover:bg-black transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelGoalEditor
                          }
                          className="px-4 py-2.5 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] text-[#1C1917] font-semibold hover:bg-[#E8E1D4] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Active GATE Subject & Module */}
      {gateStore && (
        <div
          id="settings-gate-active-config"
          className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-fancy">
              Active GATE Subject & Module
            </h3>

            <GraduationCap className="w-5 h-5 text-[#78716C]" />
          </div>

          <p className="text-xs text-[#78716C]">
            Set or change the current subject and module
            tracked when ticking the daily GATE video.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Current Subject
              </label>

              <select
                id="settings-gate-subj-dropdown"
                value={activeSubjId}
                onChange={(e) =>
                  handleSubjChange(
                    e.target.value
                  )
                }
                className="w-full text-base px-3 py-2 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              >
                {gateStore.subjects.map(
                  (subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                      className="bg-[#FAF7F0] text-[#1C1917]"
                    >
                      {subject.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Current Module
              </label>

              <select
                id="settings-gate-mod-dropdown"
                value={activeModId}
                disabled={
                  availableMods.length === 0
                }
                onChange={(e) =>
                  handleModChange(
                    e.target.value
                  )
                }
                className="w-full text-base px-3 py-2 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:opacity-50"
              >
                {availableMods.length ===
                0 ? (
