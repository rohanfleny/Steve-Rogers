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

const GOALS: GoalEditorConfig[] = [
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

function parseTarget(
  value: string,
  fallback: number
): number {
  if (!value) {
    return fallback;
  }

  const match = value.match(/[\d.]+/);

  if (!match) {
    return fallback;
  }

  const parsed = Number(match[0]);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function formatTarget(
  value: number,
  unit: GoalEditorConfig['unit']
): string {
  const cleanValue = Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(1)));

  const plural =
    value === 1 ? '' : 's';

  return `${cleanValue} ${unit}${plural}`;
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
  /* --------------------------------
     BASIC SETTINGS
  -------------------------------- */

  const [name, setName] = useState(
    settings.name || 'Rohan'
  );

  const [sleepTarget, setSleepTarget] =
    useState<number>(
      settings.sleepTargetHours || 7
    );

  const [savedSuccess, setSavedSuccess] =
    useState(false);

  const [importStatus, setImportStatus] =
    useState<string | null>(null);

  /* --------------------------------
     GOAL EDITOR
  -------------------------------- */

  const [editingGoal, setEditingGoal] =
    useState<DailyGoalId | null>(null);

  const [editingTitle, setEditingTitle] =
    useState('');

  const [editingTarget, setEditingTarget] =
    useState(1);

  /* --------------------------------
     GATE CONNECTION
  -------------------------------- */

  const firstSubjectId =
    gateStore?.subjects?.[0]?.id || '';

  const [activeSubjId, setActiveSubjId] =
    useState<string>(
      gateStore?.activeConnection?.subjectId ||
        firstSubjectId
    );

  const modulesForSubject =
    gateStore?.modules?.filter(
      (module) =>
        module.subjectId === activeSubjId
    ) || [];

  const firstModuleId =
    modulesForSubject[0]?.id || '';

  const [activeModId, setActiveModId] =
    useState<string>(
      gateStore?.activeConnection?.moduleId ||
        firstModuleId
    );

  /* --------------------------------
     SYNC SETTINGS
  -------------------------------- */

  useEffect(() => {
    setName(settings.name || 'Rohan');

    setSleepTarget(
      settings.sleepTargetHours || 7
    );
  }, [
    settings.name,
    settings.sleepTargetHours,
  ]);

  /* --------------------------------
     SYNC ACTIVE GATE SUBJECT
  -------------------------------- */

  useEffect(() => {
    const subjectId =
      gateStore?.activeConnection?.subjectId ||
      gateStore?.subjects?.[0]?.id ||
      '';

    setActiveSubjId(subjectId);
  }, [
    gateStore?.activeConnection?.subjectId,
    gateStore?.subjects,
  ]);

  /* --------------------------------
     SYNC ACTIVE GATE MODULE
  -------------------------------- */

  useEffect(() => {
    const modules =
      gateStore?.modules?.filter(
        (module) =>
          module.subjectId === activeSubjId
      ) || [];

    const savedModuleId =
      gateStore?.activeConnection?.moduleId;

    const savedModuleExists =
      modules.some(
        (module) =>
          module.id === savedModuleId
      );

    if (savedModuleExists) {
      setActiveModId(
        savedModuleId || ''
      );
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

  /* --------------------------------
     SUCCESS MESSAGE
  -------------------------------- */

  const showSavedMessage = (
    duration = 1800
  ) => {
    setSavedSuccess(true);

    window.setTimeout(() => {
      setSavedSuccess(false);
    }, duration);
  };

  /* --------------------------------
     SAVE GENERAL SETTINGS
  -------------------------------- */

  const savePreferences = () => {
    onUpdateSettings({
      ...settings,
      name:
        name.trim() || 'Rohan',
      sleepTargetHours:
        sleepTarget,
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

    showSavedMessage(2000);
  };

  /* --------------------------------
     GOAL EDITOR
  -------------------------------- */

  const editGoal = (
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
      currentTitle ||
        goal.defaultTitle
    );

    setEditingTarget(
      parseTarget(
        currentTarget,
        goal.defaultTarget
      )
    );
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditingTitle('');
    setEditingTarget(1);
  };

  const saveGoal = (
    goal: GoalEditorConfig
  ) => {
    const cleanTitle =
      editingTitle.trim() ||
      goal.defaultTitle;

    const cleanTarget =
      Number.isFinite(editingTarget) &&
      editingTarget > 0
        ? editingTarget
        : goal.defaultTarget;

    const updatedCustomGoals = {
      ...(settings.customGoals || {}),
      [goal.id]: {
        title: cleanTitle,
        target: formatTarget(
          cleanTarget,
          goal.unit
        ),
      },
    };

    onUpdateSettings({
      ...settings,
      customGoals:
        updatedCustomGoals,
    });

    cancelEdit();

    showSavedMessage(1500);
  };

  const changeTarget = (
    goal: GoalEditorConfig,
    direction: 1 | -1
  ) => {
    const step =
      goal.unit === 'Minutes'
        ? 5
        : 1;

    setEditingTarget(
      (current) =>
        Math.max(
          1,
          Math.min(
            999,
            current +
              direction * step
          )
        )
    );
  };

  /* --------------------------------
     GATE SUBJECT
  -------------------------------- */

  const changeSubject = (
    subjectId: string
  ) => {
    setActiveSubjId(subjectId);

    const modules =
      gateStore?.modules?.filter(
        (module) =>
          module.subjectId ===
          subjectId
      ) || [];

    const moduleId =
      modules[0]?.id || '';

    setActiveModId(moduleId);

    if (
      onUpdateActiveGateModule &&
      subjectId &&
      moduleId
    ) {
      onUpdateActiveGateModule(
        subjectId,
        moduleId
      );
    }
  };

  /* --------------------------------
     GATE MODULE
  -------------------------------- */

  const changeModule = (
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

  /* --------------------------------
     SLEEP TARGET
  -------------------------------- */

  const decreaseSleep = () => {
    setSleepTarget(
      (current) =>
        Math.max(
          1,
          Number(
            (
              current - 0.5
            ).toFixed(1)
          )
        )
    );
  };

  const increaseSleep = () => {
    setSleepTarget(
      (current) =>
        Math.min(
          24,
          Number(
            (
              current + 0.5
            ).toFixed(1)
          )
        )
    );
  };

  /* --------------------------------
     EXPORT
  -------------------------------- */

  const exportBackup = () => {
    const json =
      onExportJSON();

    const blob =
      new Blob(
        [json],
        {
          type:
            'application/json',
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        'a'
      );

    anchor.href = url;

    anchor.download =
      `study_journal_backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    document.body.removeChild(
      anchor
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* --------------------------------
     IMPORT
  -------------------------------- */

  const importBackup = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !==
        'string'
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

      window.setTimeout(
        () => {
          setImportStatus(null);
        },
        3500
      );
    };

    reader.onerror = () => {
      setImportStatus(
        'Unable to read backup file.'
      );
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  /* --------------------------------
     RESET
  -------------------------------- */

  const resetData = () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to reset all app data? This cannot be undone.'
      );

    if (confirmed) {
      onResetAllData();
    }
  };

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <div
      id="settings-goals-view"
      className="space-y-4 font-handwriting text-[#9B1B30] pb-8"
    >
      {/* ================================
          SAVED MESSAGE
      ================================= */}

      {savedSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1B3A57] text-[#FAF7F0] px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
          Saved
        </div>
      )}

      {/* ================================
          IMPORT MESSAGE
      ================================= */}

      {importStatus && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1B3A57] text-[#FAF7F0] px-4 py-2 rounded-xl text-sm font-bold shadow-lg max-w-[90%] text-center">
          {importStatus}
        </div>
      )}

      {/* ================================
          PERSONAL PROFILE
      ================================= */}

      <section className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy text-[#FAF7F0] bg-[#1B3A57] px-4 py-2.5 -mx-4 -mt-4 mb-3 rounded-t-2xl">
          Personal Profile
        </h3>

        <div className="flex items-center gap-3">
          <label className="text-sm text-[#9B1B30] w-20 shrink-0">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="Rohan"
            className="flex-1 min-w-0 bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-3 py-2 text-base text-[#9B1B30] focus:outline-none focus:border-[#1C1917]"
          />
        </div>
      </section>

      {/* ================================
          DAILY GOALS
      ================================= */}

      <section className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold font-fancy text-[#FAF7F0] bg-[#1B3A57] px-4 py-2.5 -mx-4 -mt-4 rounded-t-2xl">
            Daily Goals
          </h3>

          <span className="text-xs text-[#9B1B30] font-semibold">
            Customize
          </span>
        </div>

        <div>
          {GOALS.map(
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
                  className="border-b border-[#D6DCE8] last:border-b-0"
                >
                  {!isEditing && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {goal.icon}

                        <span className="font-bold truncate">
                          {title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#9B1B30]">
                          {target}{' '}
                          / day
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            editGoal(
                              goal
                            )
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] active:bg-[#E8E1D4] cursor-pointer"
                          aria-label={`Edit ${title}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#9B1B30]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="py-3 space-y-3">
                      {/* EDIT HEADER */}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {goal.icon}

                          <span className="font-bold truncate">
                            Edit {title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={
                            cancelEdit
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] cursor-pointer"
                          aria-label="Close editor"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* NAME */}

                      <div>
                        <label className="block text-xs font-bold text-[#9B1B30] mb-1">
                          Goal Name
                        </label>

                        <input
                          type="text"
                          value={
                            editingTitle
                          }
                          onChange={(
                            event
                          ) =>
                            setEditingTitle(
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-3 py-2 text-base text-[#9B1B30] focus:outline-none focus:border-[#1C1917]"
                        />
                      </div>

                      {/* TARGET */}

                      <div>
                        <label className="block text-xs font-bold text-[#9B1B30] mb-1">
                          Daily Target
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              changeTarget(
                                goal,
                                -1
                              )
                            }
                            className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Decrease target"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="flex-1 h-11 rounded-xl bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center gap-2">
                            <span className="text-xl font-bold">
                              {
                                editingTarget
                              }
                            </span>

                            <span className="text-sm text-[#9B1B30]">
                              {
                                goal.unit
                              }
                              {editingTarget ===
                              1
                                ? ''
                                : 's'}{' '}
                              / day
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              changeTarget(
                                goal,
                                1
                              )
                            }
                            className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center hover:bg-[#E8E1D4] active:bg-[#DDD5C7] cursor-pointer"
                            aria-label="Increase target"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            saveGoal(
                              goal
                            )
                          }
                          className="flex-1 rounded-xl bg-[#1B3A57] text-[#FAF7F0] px-4 py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-[#142C42] cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEdit
                          }
                          className="rounded-xl bg-[#F1ECE1] border border-[#D6DCE8] px-4 py-2.5 font-bold cursor-pointer hover:bg-[#E8E1D4]"
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
      </section>

      {/* ================================
          ACTIVE GATE CONNECTION
      ================================= */}

      {gateStore && (
        <section className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-bold font-fancy text-[#FAF7F0] bg-[#1B3A57] px-4 py-2.5 -mx-4 -mt-4 rounded-t-2xl">
              Active GATE Subject & Module
            </h3>

            <GraduationCap className="w-5 h-5 text-[#FAF7F0]" />
          </div>

          <p className="text-xs text-[#9B1B30] mb-3">
            Choose the subject and module used for future daily GATE progress.
          </p>

          {/* SUBJECT */}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#9B1B30] mb-1">
                Current Subject
              </label>

              <select
                value={activeSubjId}
                onChange={(
                  event
                ) =>
                  changeSubject(
                    event.target
                      .value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-3 py-2 text-base text-[#9B1B30] focus:outline-none focus:border-[#1C1917]"
              >
                {gateStore.subjects
                  .length ===
                0 ? (
                  <option value="">
                    No subjects available
                  </option>
                ) : (
                  gateStore.subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.id
                        }
                      >
                        {
                          subject.title
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* MODULE */}

            <div>
              <label className="block text-xs font-bold text-[#9B1B30] mb-1">
                Current Module
              </label>

              <select
                value={activeModId}
                disabled={
                  modulesForSubject.length ===
                  0
                }
                onChange={(
                  event
                ) =>
                  changeModule(
                    event.target
                      .value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-3 py-2 text-base text-[#9B1B30] focus:outline-none focus:border-[#1C1917] disabled:opacity-50"
              >
                {modulesForSubject.length ===
                0 ? (
                  <option value="">
                    No modules available
                  </option>
                ) : (
                  modulesForSubject.map(
                    (module) => (
                      <option
                        key={
                          module.id
                        }
                        value={
                          module.id
                        }
                      >
                        {
                          module.title
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ================================
          SLEEP GOAL
      ================================= */}

      <section className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy text-[#FAF7F0] bg-[#1B3A57] px-4 py-2.5 -mx-4 -mt-4 mb-3 rounded-t-2xl">
          Sleep Goal
        </h3>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-[#9B1B30]" />

            <span className="text-sm">
              Target
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                decreaseSleep
              }
              className="w-9 h-9 rounded-lg bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center hover:bg-[#E8E1D4] cursor-pointer"
              aria-label="Decrease sleep target"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="min-w-[90px] h-9 rounded-lg bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center px-3">
              <span className="font-bold">
                {sleepTarget}
                h
              </span>
            </div>

            <button
              type="button"
              onClick={
                increaseSleep
              }
              className="w-9 h-9 rounded-lg bg-[#F1ECE1] border border-[#D6DCE8] flex items-center justify-center hover:bg-[#E8E1D4] cursor-pointer"
              aria-label="Increase sleep target"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================
          SAVE PREFERENCES
      ================================= */}

      <button
        type="button"
        onClick={
          savePreferences
        }
        className="w-full rounded-2xl bg-[#1B3A57] text-[#FAF7F0] py-3.5 font-bold text-base flex items-center justify-center gap-2 hover:bg-[#142C42] active:scale-[0.99] transition-transform cursor-pointer"
      >
        <Check className="w-4 h-4" />
        Save Preferences
      </button>

      {/* ================================
          DATA MANAGEMENT
      ================================= */}

      <section className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy text-[#FAF7F0] bg-[#1B3A57] px-4 py-2.5 -mx-4 -mt-4 mb-3 rounded-t-2xl">
          Data Management
        </h3>

        <div className="space-y-2">
          {/* EXPORT */}

          <button
            type="button"
            onClick={
              exportBackup
            }
            className="w-full flex items-center justify-between gap-3 bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-4 py-3 hover:bg-[#E8E1D4] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4" />

              <div className="text-left">
                <div className="font-bold text-sm">
                  Export Backup
                </div>

                <div className="text-xs text-[#9B1B30]">
                  Download your local data
                </div>
              </div>
            </div>
          </button>

          {/* IMPORT */}

          <label className="w-full flex items-center justify-between gap-3 bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-4 py-3 hover:bg-[#E8E1D4] cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4" />

              <div>
                <div className="font-bold text-sm">
                  Restore Backup
                </div>

                <div className="text-xs text-[#9B1B30]">
                  Import previously saved data
                </div>
              </div>
            </div>

            <input
              type="file"
              accept=".json,application/json"
              onChange={
                importBackup
              }
              className="hidden"
            />
          </label>

          {/* RESET */}

          <button
            type="button"
            onClick={
              resetData
            }
            className="w-full flex items-center justify-between gap-3 bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl px-4 py-3 hover:bg-[#E8E1D4] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4" />

              <div className="text-left">
                <div className="font-bold text-sm">
                  Reset All Data
                </div>

                <div className="text-xs text-[#9B1B30]">
                  Permanently clear local progress
                </div>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ================================
          QUOTE
      ================================= */}

      <div className="text-center px-6 py-4 text-[#9B1B30]">
        <p className="text-sm text-[#9B1B30] italic">
          “Small progress every day becomes a big change.”
        </p>
      </div>
    </div>
  );
};

export default SettingsGoalsView;
