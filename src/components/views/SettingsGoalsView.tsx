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
  const match = value.match(/[\d.]+/);

  if (!match) {
    return fallback;
  }

  const number = Number(match[0]);

  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return number;
}

function formatTarget(
  value: number,
  unit: GoalEditorConfig['unit']
): string {
  const clean = Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(1)));

  return `${clean} ${unit}${value === 1 ? '' : 's'}`;
}

export const SettingsGoalsView: React.FC<
  SettingsGoalsViewProps
> = (props) => {
  const {
    settings,
    onUpdateSettings,
    onExportJSON,
    onImportJSON,
    onResetAllData,
    gateStore,
    onUpdateActiveGateModule,
  } = props;

  const [name, setName] = useState(
    settings.name || 'Rohan'
  );

  const [sleepTarget, setSleepTarget] =
    useState(settings.sleepTargetHours);

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

  const firstSubject =
    gateStore?.subjects?.[0]?.id || '';

  const [activeSubjId, setActiveSubjId] =
    useState(
      gateStore?.activeConnection?.subjectId ||
        firstSubject
    );

  const modulesForSubject =
    gateStore?.modules?.filter(
      (module) =>
        module.subjectId === activeSubjId
    ) || [];

  const firstModule =
    modulesForSubject[0]?.id || '';

  const [activeModId, setActiveModId] =
    useState(
      gateStore?.activeConnection?.moduleId ||
        firstModule
    );

  useEffect(() => {
    setName(settings.name || 'Rohan');
    setSleepTarget(settings.sleepTargetHours);
  }, [
    settings.name,
    settings.sleepTargetHours,
  ]);

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

  useEffect(() => {
    const modules =
      gateStore?.modules?.filter(
        (module) =>
          module.subjectId === activeSubjId
      ) || [];

    const activeModule =
      gateStore?.activeConnection?.moduleId;

    const matchingActiveModule =
      modules.some(
        (module) =>
          module.id === activeModule
      );

    setActiveModId(
      matchingActiveModule
        ? activeModule || ''
        : modules[0]?.id || ''
    );
  }, [
    activeSubjId,
    gateStore?.modules,
    gateStore?.activeConnection?.moduleId,
  ]);

  const savePreferences = () => {
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

  const editGoal = (
    goal: GoalEditorConfig
  ) => {
    setEditingGoal(goal.id);

    setEditingTitle(
      getGoalTitle(
        goal.id,
        settings
      ) || goal.defaultTitle
    );

    setEditingTarget(
      parseTarget(
        getGoalTarget(
          goal.id,
          settings
        ),
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
    const title =
      editingTitle.trim() ||
      goal.defaultTitle;

    const target =
      editingTarget > 0
        ? editingTarget
        : goal.defaultTarget;

    onUpdateSettings({
      ...settings,
      customGoals: {
        ...(settings.customGoals || {}),
        [goal.id]: {
          title,
          target: formatTarget(
            target,
            goal.unit
          ),
        },
      },
    });

    cancelEdit();

    setSavedSuccess(true);

    window.setTimeout(() => {
      setSavedSuccess(false);
    }, 1500);
  };

  const changeTarget = (
    goal: GoalEditorConfig,
    direction: 1 | -1
  ) => {
    const step =
      goal.unit === 'Minutes' ? 5 : 1;

    setEditingTarget((current) =>
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

  const changeSubject = (
    subjectId: string
  ) => {
    setActiveSubjId(subjectId);

    const modules =
      gateStore?.modules?.filter(
        (module) =>
          module.subjectId === subjectId
      ) || [];

    const moduleId =
      modules[0]?.id || '';

    setActiveModId(moduleId);

    if (
      onUpdateActiveGateModule &&
      moduleId
    ) {
      onUpdateActiveGateModule(
        subjectId,
        moduleId
      );
    }
  };

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

  const exportBackup = () => {
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

  const importBackup = (
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

      setImportStatus(
        response.success
          ? 'Data successfully restored!'
          : response.error ||
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
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  const resetData = () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to reset all app data? This cannot be undone.'
      );

    if (confirmed) {
      onResetAllData();
    }
  };

  return (
    <div
      id="settings-goals-view"
      className="space-y-4 font-handwriting text-[#1C1917] pb-6"
    >
      {/* PROFILE */}
      <section className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy mb-3">
          Personal Profile
        </h3>

        <div className="flex items-center gap-3">
          <label className="text-sm text-[#78716C] w-20 shrink-0">
            Your Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Rohan"
            className="flex-1 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none focus:border-[#1C1917]"
          />
        </div>
      </section>

      {/* DAILY GOALS */}
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
          {GOALS.map((goal) => {
            const editing =
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
                className="border-b border-[#E5DDD0] last:border-b-0"
              >
                {!editing && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 min-w-0">
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
                        onClick={() =>
                          editGoal(goal)
                        }
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] cursor-pointer"
                        aria-label={`Edit ${title}`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#78716C]" />
                      </button>
                    </div>
                  </div>
                )}

                {editing && (
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
                          cancelEdit
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1ECE1] cursor-pointer"
                        aria-label="Close editor"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">
                        Goal Name
                      </label>

                      <input
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(
                            event.target.value
                          )
                        }
                        className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none focus:border-[#1C1917]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">
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
                          className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div className="flex-1 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center gap-2">
                          <span className="text-xl font-bold">
                            {editingTarget}
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
                          onClick={() =>
                            changeTarget(
                              goal,
                              1
                            )
                          }
                          className="w-11 h-11 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          saveGoal(goal)
                        }
                        className="flex-1 rounded-xl bg-[#1C1917] text-white px-4 py-2.5 font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEdit
                        }
                        className="rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] px-4 py-2.5 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* GATE CONNECTION */}
      {gateStore && (
        <section className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-bold font-fancy">
              Active GATE Subject & Module
            </h3>

            <GraduationCap className="w-5 h-5 text-[#78716C]" />
          </div>

          <p className="text-xs text-[#78716C] mb-3">
            Choose the subject and module used for future
            daily GATE progress.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Current Subject
              </label>

              <select
                value={activeSubjId}
                onChange={(event) =>
                  changeSubject(
                    event.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none focus:border-[#1C1917]"
              >
                {gateStore.subjects.map(
                  (subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
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
                value={activeModId}
                disabled={
                  modulesForSubject.length ===
                  0
                }
                onChange={(event) =>
                  changeModule(
                    event.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none focus:border-[#1C1917] disabled:opacity-50"
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
                        key={module.id}
                        value={module.id}
                      >
                        {module.title}
                      </option>
                    )
                  )
                )}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* SLEEP */}
      <section className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold font-fancy mb-3">
          Sleep Goal
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-[#78716C]" />

            <span className="text-sm">
              Target
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSleepTarget((value) =>
                  Math.max(
                    1,
                    Number(
                      (
                        value - 0.5
                      ).toFixed(1)
                    )
                  )
                )
              }
              className="w-9 h-9 rounded-lg bg-[#F1ECE
