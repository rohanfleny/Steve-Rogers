import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Calendar,
} from 'lucide-react';

import {
  GateStoreState,
  GateSubject,
  GateModule,
  GateVideo,
} from '../../types/gate';

import { DailyRecord } from '../../types/daily';

import {
  calculateOverallGateProgress,
  calculateSubjectProgress,
  calculateModuleProgress,
  calculateExpectedCompletionDate,
  getNextIncompleteVideo,
} from '../../logic/gateCalculations';

import { getTodayDateString } from '../../logic/calculations';

import {
  HandwrittenCheckbox,
  HandwrittenPlayIcon,
} from '../HandwrittenDoodles';

interface GateViewProps {
  gateStore: GateStoreState;
  onUpdateStore: (
    updater: (prev: GateStoreState) => GateStoreState
  ) => void;
  onTriggerCompletionModal?: (
    subjectId: string,
    moduleId: string
  ) => void;
  onBackToHome: () => void;
  currentRecord?: DailyRecord;
  allRecords?: Record<string, DailyRecord>;
  selectedDate?: string;
}

export const GateView: React.FC<GateViewProps> = ({
  gateStore,
  onUpdateStore,
  onTriggerCompletionModal,
  currentRecord,
  selectedDate,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] =
    useState<string | null>(null);

  const [selectedModuleId, setSelectedModuleId] =
    useState<string | null>(null);

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const [isSettingVideoCount, setIsSettingVideoCount] =
    useState(false);
  const [targetVideoCountInput, setTargetVideoCountInput] =
    useState('7');

  const [editingSubject, setEditingSubject] =
    useState<GateSubject | null>(null);
  const [editSubjectTitle, setEditSubjectTitle] = useState('');
  const [isConfirmingDeleteSubject, setIsConfirmingDeleteSubject] =
    useState(false);

  const [editingModule, setEditingModule] =
    useState<GateModule | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleVideoCount, setEditModuleVideoCount] =
    useState('7');
  const [isConfirmingDeleteModule, setIsConfirmingDeleteModule] =
    useState(false);

  const overallProgress = calculateOverallGateProgress(
    gateStore.videos
  );

  const isTodayGateDone = currentRecord
    ? currentRecord.goals.gate === true
    : false;

  const effectiveDate =
    selectedDate || getTodayDateString();

  const expectedCompletion =
    calculateExpectedCompletionDate(
      overallProgress.remaining,
      isTodayGateDone,
      effectiveDate
    );

  const selectedSubject = gateStore.subjects.find(
    (s) => s.id === selectedSubjectId
  );

  const selectedModule = gateStore.modules.find(
    (m) => m.id === selectedModuleId
  );

  /* ==========================================================
     VIDEO COMPLETION
     ========================================================== */

  const handleToggleVideo = (video: GateVideo) => {
    const isNowCompleted = !video.completed;
    const nowIso = new Date().toISOString();

    onUpdateStore((prev) => {
      const updatedVideos = prev.videos.map((v) =>
        v.id === video.id
          ? {
              ...v,
              completed: isNowCompleted,
              completedAt: isNowCompleted
                ? nowIso
                : undefined,
            }
          : v
      );

      if (isNowCompleted) {
        const remainingInModule = updatedVideos.filter(
          (v) =>
            v.moduleId === video.moduleId &&
            !v.completed
        ).length;

        if (remainingInModule === 0) {
          const mod = prev.modules.find(
            (m) => m.id === video.moduleId
          );

          const subj = mod
            ? prev.subjects.find(
                (s) => s.id === mod.subjectId
              )
            : null;

          if (
            subj &&
            mod &&
            onTriggerCompletionModal
          ) {
            setTimeout(() => {
              onTriggerCompletionModal(
                subj.id,
                mod.id
              );
            }, 150);
          }
        }
      }

      return {
        ...prev,
        videos: updatedVideos,
      };
    });
  };

  /* ==========================================================
     REVISION
     ========================================================== */

  const handleToggleRevision = (moduleId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              revisionCompleted:
                !m.revisionCompleted,
              revisionCompletedAt:
                !m.revisionCompleted
                  ? new Date().toISOString()
                  : undefined,
            }
          : m
      ),
    }));
  };

  /* ==========================================================
     PYQ
     ========================================================== */

  const handleTogglePYQ = (moduleId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              pyqCompleted:
                !m.pyqCompleted,
              pyqCompletedAt:
                !m.pyqCompleted
                  ? new Date().toISOString()
                  : undefined,
            }
          : m
      ),
    }));
  };

  /* ==========================================================
     ADD SUBJECT
     ========================================================== */

  const handleAddSubject = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newSubjectTitle.trim()) return;

    const newSubject: GateSubject = {
      id: `subj-${Date.now()}`,
      title: newSubjectTitle.trim(),
      order: gateStore.subjects.length + 1,
    };

    onUpdateStore((prev) => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        newSubject,
      ],
    }));

    setNewSubjectTitle('');
    setIsAddingSubject(false);
  };

  /* ==========================================================
     ADD MODULE
     ========================================================== */

  const handleAddModule = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newModuleTitle.trim() ||
      !selectedSubjectId
    ) {
      return;
    }

    const newModule: GateModule = {
      id: `mod-${Date.now()}`,
      subjectId: selectedSubjectId,
      title: newModuleTitle.trim(),
      order:
        gateStore.modules.filter(
          (m) =>
            m.subjectId === selectedSubjectId
        ).length + 1,
      revisionCompleted: false,
      pyqCompleted: false,
    };

    onUpdateStore((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        newModule,
      ],
    }));

    setNewModuleTitle('');
    setIsAddingModule(false);
  };

  /* ==========================================================
     SET VIDEO COUNT
     ========================================================== */

  const handleSetVideoCount = (
    newCount: number
  ) => {
    if (
      !selectedModuleId ||
      isNaN(newCount) ||
      newCount < 0
    ) {
      return;
    }

    onUpdateStore((prev) => {
      const existingVideos = prev.videos
        .filter(
          (v) =>
            v.moduleId === selectedModuleId
        )
        .sort(
          (a, b) => a.order - b.order
        );

      let updatedModuleVideos: GateVideo[] =
        [];

      if (
        newCount <=
        existingVideos.length
      ) {
        updatedModuleVideos =
          existingVideos
            .slice(0, newCount)
            .map((v, index) => ({
              ...v,
              order: index + 1,
              title: `Video ${index + 1}`,
            }));
      } else {
        updatedModuleVideos =
          existingVideos.map(
            (v, index) => ({
              ...v,
              order: index + 1,
              title: `Video ${index + 1}`,
            })
          );

        for (
          let i =
            existingVideos.length + 1;
          i <= newCount;
          i++
        ) {
          updatedModuleVideos.push({
            id: `vid-${Date.now()}-${i}`,
            moduleId: selectedModuleId,
            title: `Video ${i}`,
            order: i,
            completed: false,
          });
        }
      }

      const otherVideos =
        prev.videos.filter(
          (v) =>
            v.moduleId !== selectedModuleId
        );

      return {
        ...prev,
        videos: [
          ...otherVideos,
          ...updatedModuleVideos,
        ],
      };
    });

    setIsSettingVideoCount(false);
  };

  /* ==========================================================
     EDIT SUBJECT
     ========================================================== */

  const handleOpenEditSubject = (
    subject: GateSubject
  ) => {
    setEditingSubject(subject);
    setEditSubjectTitle(subject.title);
    setIsConfirmingDeleteSubject(false);
  };

  const handleSaveEditSubject = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingSubject ||
      !editSubjectTitle.trim()
    ) {
      return;
    }

    const title =
      editSubjectTitle.trim();

    onUpdateStore((prev) => ({
      ...prev,
      subjects: prev.subjects.map(
        (s) =>
          s.id === editingSubject.id
            ? { ...s, title }
            : s
      ),
    }));

    setEditingSubject(null);
  };

  /* ==========================================================
     DELETE SUBJECT
     ========================================================== */

  const handleDeleteSubject = (
    subjectId: string
  ) => {
    onUpdateStore((prev) => {
      const subjectModules =
        prev.modules.filter(
          (m) =>
            m.subjectId === subjectId
        );

      const moduleIds =
        new Set(
          subjectModules.map(
            (m) => m.id
          )
        );

      const updatedSubjects =
        prev.subjects.filter(
          (s) => s.id !== subjectId
        );

      const updatedModules =
        prev.modules.filter(
          (m) =>
            m.subjectId !== subjectId
        );

      const updatedVideos =
        prev.videos.filter(
          (v) =>
            !moduleIds.has(v.moduleId)
        );

      let updatedActive = {
        ...prev.activeConnection,
      };

      if (
        prev.activeConnection.subjectId ===
        subjectId
      ) {
        const nextSubject =
          updatedSubjects[0]?.id || '';

        const nextModules =
          updatedModules.filter(
            (m) =>
              m.subjectId === nextSubject
          );

        updatedActive = {
          subjectId: nextSubject,
          moduleId:
            nextModules[0]?.id || '',
        };
      }

      return {
        ...prev,
        subjects: updatedSubjects,
        modules: updatedModules,
        videos: updatedVideos,
        activeConnection:
          updatedActive,
      };
    });

    if (
      selectedSubjectId === subjectId
    ) {
      setSelectedSubjectId(null);
      setSelectedModuleId(null);
    }

    setEditingSubject(null);
  };

  /* ==========================================================
     EDIT MODULE
     ========================================================== */

  const handleOpenEditModule = (
    module: GateModule
  ) => {
    const videos =
      gateStore.videos.filter(
        (v) =>
          v.moduleId === module.id
      );

    setEditingModule(module);
    setEditModuleTitle(module.title);
    setEditModuleVideoCount(
      videos.length > 0
        ? String(videos.length)
        : '7'
    );
    setIsConfirmingDeleteModule(false);
  };

  const handleSaveEditModule = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingModule ||
      !editModuleTitle.trim()
    ) {
      return;
    }

    const title =
      editModuleTitle.trim();

    const newCount =
      parseInt(
        editModuleVideoCount,
        10
      );

    onUpdateStore((prev) => {
      const updatedModules =
        prev.modules.map(
          (m) =>
            m.id === editingModule.id
              ? { ...m, title }
              : m
        );

      let updatedVideos =
        prev.videos;

      if (
        !isNaN(newCount) &&
        newCount >= 0
      ) {
        const existingVideos =
          prev.videos
            .filter(
              (v) =>
                v.moduleId ===
                editingModule.id
            )
            .sort(
              (a, b) =>
                a.order - b.order
            );

        let moduleVideos:
          GateVideo[] = [];

        if (
          newCount <=
          existingVideos.length
        ) {
          moduleVideos =
            existingVideos
              .slice(0, newCount)
              .map(
                (v, index) => ({
                  ...v,
                  order: index + 1,
                  title:
                    `Video ${index + 1}`,
                })
              );
        } else {
          moduleVideos =
            existingVideos.map(
              (v, index) => ({
                ...v,
                order: index + 1,
                title:
                  `Video ${index + 1}`,
              })
            );

          for (
            let i =
              existingVideos.length + 1;
            i <= newCount;
            i++
          ) {
            moduleVideos.push({
              id: `vid-${Date.now()}-${i}`,
              moduleId:
                editingModule.id,
              title:
                `Video ${i}`,
              order: i,
              completed: false,
            });
          }
        }

        const otherVideos =
          prev.videos.filter(
            (v) =>
              v.moduleId !==
              editingModule.id
          );

        updatedVideos = [
          ...otherVideos,
          ...moduleVideos,
        ];
      }

      return {
        ...prev,
        modules: updatedModules,
        videos: updatedVideos,
      };
    });

    setEditingModule(null);
  };

  /* ==========================================================
     DELETE MODULE
     ========================================================== */

  const handleDeleteModule = (
    moduleId: string
  ) => {
    onUpdateStore((prev) => {
      const updatedModules =
        prev.modules.filter(
          (m) => m.id !== moduleId
        );

      const updatedVideos =
        prev.videos.filter(
          (v) =>
            v.moduleId !== moduleId
        );

      let updatedActive = {
        ...prev.activeConnection,
      };

      if (
        prev.activeConnection.moduleId ===
        moduleId
      ) {
        const remainingModules =
          updatedModules.filter(
            (m) =>
              m.subjectId ===
              prev.activeConnection
                .subjectId
          );

        updatedActive = {
          ...prev.activeConnection,
          moduleId:
            remainingModules[0]?.id ||
            '',
        };
      }

      return {
        ...prev,
        modules: updatedModules,
        videos: updatedVideos,
        activeConnection:
          updatedActive,
      };
    });

    if (
      selectedModuleId === moduleId
    ) {
      setSelectedModuleId(null);
    }

    setEditingModule(null);
  };

  /* ==========================================================
     EDIT SUBJECT MODAL
     ========================================================== */

  const renderEditSubjectModal = () => {
    if (!editingSubject) return null;

    const subjectModules =
      gateStore.modules.filter(
        (m) =>
          m.subjectId ===
          editingSubject.id
      );

    const subjectVideos =
      gateStore.videos.filter(
        (v) =>
          subjectModules.some(
            (m) => m.id === v.moduleId
          )
      );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-fancy">
              Edit Subject
            </h3>

            <button
              type="button"
              onClick={() => {
                setEditingSubject(null);
                setIsConfirmingDeleteSubject(
                  false
                );
              }}
              className="p-1 rounded-full text-[#78716C]"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={
              handleSaveEditSubject
            }
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Subject Name
              </label>

              <input
                type="text"
                value={editSubjectTitle}
                onChange={(e) =>
                  setEditSubjectTitle(
                    e.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingSubject(null);
                  setIsConfirmingDeleteSubject(
                    false
                  );
                }}
                className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-[#E5DDD0]">
            {!isConfirmingDeleteSubject ? (
              <button
                type="button"
                onClick={() =>
                  setIsConfirmingDeleteSubject(
                    true
                  )
                }
                className="w-full py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Subject
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs text-rose-900">
                  Are you sure you want to
                  delete{' '}
                  <strong>
                    {editingSubject.title}
                  </strong>
                  ? This will permanently
                  delete{' '}
                  {subjectModules.length}{' '}
                  modules and{' '}
                  {subjectVideos.length}{' '}
                  videos.
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setIsConfirmingDeleteSubject(
                        false
                      )
                    }
                    className="px-3 py-1 text-xs rounded-xl bg-[#EAE2D7]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteSubject(
                        editingSubject.id
                      )
                    }
                    className="px-3 py-1 text-xs rounded-xl bg-rose-600 text-white font-bold"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================
     EDIT MODULE MODAL
     ========================================================== */

  const renderEditModuleModal = () => {
    if (!editingModule) return null;

    const moduleVideos =
      gateStore.videos.filter(
        (v) =>
          v.moduleId ===
          editingModule.id
      );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-fancy">
              Edit Module
            </h3>

            <button
              type="button"
              onClick={() => {
                setEditingModule(null);
                setIsConfirmingDeleteModule(
                  false
                );
              }}
              className="p-1 rounded-full text-[#78716C]"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={
              handleSaveEditModule
            }
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Module Name
              </label>

              <input
                type="text"
                value={editModuleTitle}
                onChange={(e) =>
                  setEditModuleTitle(
                    e.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none focus:border-[#1C1917]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Total Videos Count
              </label>

              <input
                type="number"
                min="0"
                max="200"
                value={editModuleVideoCount}
                onChange={(e) =>
                  setEditModuleVideoCount(
                    e.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base font-mono focus:outline-none focus:border-[#1C1917]"
              />

              <p className="text-[11px] text-[#78716C] mt-1">
                Currently{' '}
                {moduleVideos.length}{' '}
                videos.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingModule(null);
                  setIsConfirmingDeleteModule(
                    false
                  );
                }}
                className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-[#E5DDD0]">
            {!isConfirmingDeleteModule ? (
              <button
                type="button"
                onClick={() =>
                  setIsConfirmingDeleteModule(
                    true
                  )
                }
                className="w-full py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Module
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs text-rose-900">
                  Delete{' '}
                  <strong>
                    {editingModule.title}
                  </strong>
                  ? This will permanently
                  delete this module and all{' '}
                  {moduleVideos.length}{' '}
                  videos.
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setIsConfirmingDeleteModule(
                        false
                      )
                    }
                    className="px-3 py-1 text-xs rounded-xl bg-[#EAE2D7]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteModule(
                        editingModule.id
                      )
                    }
                    className="px-3 py-1 text-xs rounded-xl bg-rose-600 text-white font-bold"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================
     MODULE DETAIL
     ========================================================== */

  if (
    selectedModule &&
    selectedSubject
  ) {
    const moduleVideos =
      gateStore.videos
        .filter(
          (v) =>
            v.moduleId ===
            selectedModule.id
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );

    const moduleProgress =
      calculateModuleProgress(
        selectedModule.id,
        gateStore.videos
      );

    const nextVideo =
      getNextIncompleteVideo(
        selectedModule.id,
        gateStore.videos
      );

    return (
      <div
        id="gate-module-detail"
        className="space-y-2.5 font-handwriting pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() =>
                setSelectedModuleId(null)
              }
              className="p-1.5 rounded-full text-zinc-400 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                {selectedSubject.title}
              </span>

              <h2 className="text-lg font-bold text-zinc-100 truncate">
                {selectedModule.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              handleOpenEditModule(
                selectedModule
              )
            }
            className="p-1.5 rounded-lg text-zinc-300 border border-zinc-700 bg-zinc-800/60 flex items-center gap-1 text-xs font-bold shrink-0"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 shadow-sm space-y-1.5 text-[#1C1917]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              {selectedModule.title}
            </span>

            <span className="text-2xl font-bold font-mono text-emerald-700">
              {moduleProgress.percentage}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono font-bold">
            <span>
              {moduleProgress.completed} /{' '}
              {moduleProgress.total}
            </span>

            <span className="text-xs font-normal text-[#78716C]">
              {moduleProgress.remaining}{' '}
              remaining
            </span>
          </div>

          <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{
                width: `${moduleProgress.percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div
            onClick={() =>
              handleToggleRevision(
                selectedModule.id
              )
            }
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-bold">
              Revision
            </span>

            <HandwrittenCheckbox
              checked={
                selectedModule.revisionCompleted
              }
              onChange={() =>
                handleToggleRevision(
                  selectedModule.id
                )
              }
              color="sage"
              size="sm"
            />
          </div>

          <div
            onClick={() =>
              handleTogglePYQ(
                selectedModule.id
              )
            }
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-bold">
              PYQ
            </span>

            <HandwrittenCheckbox
              checked={
                selectedModule.pyqCompleted
              }
              onChange={() =>
                handleTogglePYQ(
                  selectedModule.id
                )
              }
              color="sage"
              size="sm"
            />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 shadow-sm space-y-2 text-[#1C1917]">
          <div className="flex items-center justify-between pb-1 border-b border-[#E5DDD0]">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              VIDEOS (
              {moduleProgress.completed}/
              {moduleProgress.total})
            </span>

            <button
              type="button"
              onClick={() => {
                setTargetVideoCountInput(
                  moduleVideos.length
                    ? String(
                        moduleVideos.length
                      )
                    : '7'
                );
                setIsSettingVideoCount(
                  true
                );
              }}
              className="text-[11px] font-bold bg-[#EAE2D7] border border-[#DDD5C7] px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Count
            </button>
          </div>

          {moduleVideos.length === 0 ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-[#78716C]">
                No videos added yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  setTargetVideoCountInput(
                    '7'
                  );
                  setIsSettingVideoCount(
                    true
                  );
                }}
                className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-xs font-bold"
              >
                Set Video Count
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {moduleVideos.map(
                (video, index) => (
                  <div
                    key={video.id}
                    onClick={() =>
                      handleToggleVideo(
                        video
                      )
                    }
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                      video.completed
                        ? 'bg-[#EDE7DC]/70'
                        : 'hover:bg-[#F1ECE1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HandwrittenPlayIcon
                        className={`w-3 h-3 ${
                          video.completed
                            ? 'text-[#8C827A]'
                            : 'text-[#78716C]'
                        }`}
                      />

                      <span
                        className={`text-sm ${
                          video.completed
                            ? 'text-[#8C827A] line-through'
                            : 'text-[#1C1917] font-semibold'
                        }`}
                      >
                        Video{' '}
                        {video.order ||
                          index + 1}
                      </span>
                    </div>

                    <HandwrittenCheckbox
                      checked={
                        video.completed
                      }
                      onChange={() =>
                        handleToggleVideo(
                          video
                        )
                      }
                      color="sage"
                      size="sm"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {nextVideo ? (
          <button
            type="button"
            onClick={() =>
              handleToggleVideo(
                nextVideo
              )
            }
            className="w-full py-2.5 rounded-xl bg-[#1C1917] text-[#FAF7F0] text-sm font-bold shadow-md"
          >
            Complete Next: Video{' '}
            {nextVideo.order || 1}
          </button>
        ) : moduleProgress.total >
            0 &&
          moduleProgress.remaining ===
            0 ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-center font-bold text-sm">
            ✓ Module 100% Completed!
          </div>
        ) : null}

        {isSettingVideoCount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting">
              <h3 className="text-lg font-bold font-fancy">
                Total Videos Count
              </h3>

              <p className="text-xs text-[#78716C]">
                Enter the number of videos in
                this module.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const value =
                    parseInt(
                      targetVideoCountInput,
                      10
                    );

                  if (
                    !isNaN(value) &&
                    value >= 0
                  ) {
                    handleSetVideoCount(
                      value
                    );
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={
                    targetVideoCountInput
                  }
                  onChange={(e) =>
                    setTargetVideoCountInput(
                      e.target.value
                    )
                  }
                  className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-xl font-mono text-center font-bold focus:outline-none"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSettingVideoCount(
                        false
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {renderEditSubjectModal()}
        {renderEditModuleModal()}
      </div>
    );
  }

  /* ==========================================================
     SUBJECT DETAIL
     ========================================================== */

  if (selectedSubject) {
    const subjectModules =
      gateStore.modules
        .filter(
          (m) =>
            m.subjectId ===
            selectedSubject.id
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );

    const subjectProgress =
      calculateSubjectProgress(
        selectedSubject.id,
        gateStore.modules,
        gateStore.videos
      );

    const radius = 20;
    const circumference =
      2 * Math.PI * radius;

    const dashOffset =
      circumference *
      (1 -
        subjectProgress.percentage /
          100);

    return (
      <div
        id="gate-subject-detail"
        className="space-y-2.5 font-handwriting pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() =>
                setSelectedSubjectId(null)
              }
              className="p-1.5 rounded-full text-zinc-400 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-zinc-100 truncate">
              {selectedSubject.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              handleOpenEditSubject(
                selectedSubject
              )
            }
            className="p-1.5 rounded-lg text-zinc-300 border border-zinc-700 bg-zinc-800/60 flex items-center gap-1 text-xs font-bold"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 shadow-sm flex items-center gap-3 text-[#1C1917]">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#E5DDD0"
                strokeWidth="4"
                fill="none"
              />

              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#16A34A"
                strokeWidth="4"
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  dashOffset
                }
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono font-bold">
                {subjectProgress.percentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-base font-mono font-bold">
              {subjectProgress.completed}{' '}
              /{' '}
              {subjectProgress.total}{' '}
              videos
            </div>

            <div className="text-xs text-[#78716C]">
              {subjectModules.length}{' '}
              modules
            </div>
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 shadow-sm space-y-2 text-[#1C1917]">
          <div className="flex items-center justify-between pb-1 border-b border-[#E5DDD0]">
            <span className="text-[11px] font-bold text-[#78716C] tracking-wider">
              MODULES
            </span>

            <button
              type="button"
              onClick={() =>
                setIsAddingModule(true)
              }
              className="text-[11px] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Module
            </button>
          </div>

          <div className="space-y-1.5">
            {subjectModules.map(
              (module) => {
                const progress =
                  calculateModuleProgress(
                    module.id,
                    gateStore.videos
                  );

                const isDone =
                  progress.total > 0 &&
                  progress.remaining ===
                    0;

                return (
                  <div
                    key={module.id}
                    className="p-2.5 bg-[#F1ECE2] border border-[#DDD4C5] rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() =>
                          setSelectedModuleId(
                            module.id
                          )
                        }
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="text-sm font-bold truncate block">
                          {module.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isDone && (
                          <span className="text-emerald-700 text-[10px] font-bold">
                            ✓
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEditModule(
                              module
                            )
                          }
                          className="p-1 text-[#78716C]"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setSelectedModuleId(
                          module.id
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mt-0.5 text-xs font-mono">
                        <span>
                          {progress.completed}{' '}
                          /{' '}
                          {progress.total}
                        </span>

                        <span className="text-emerald-700 font-bold">
                          {progress.percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-[#DDD5C7] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {isAddingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting">
              <h3 className="text-lg font-bold">
                Add Module
              </h3>

              <form
                onSubmit={
                  handleAddModule
                }
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Module title"
                  value={newModuleTitle}
                  onChange={(e) =>
                    setNewModuleTitle(
                      e.target.value
                    )
                  }
                  className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAddingModule(
                        false
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {renderEditSubjectModal()}
        {renderEditModuleModal()}
      </div>
    );
  }

  /* ==========================================================
     GATE OVERVIEW
     ========================================================== */

  return (
    <div
      id="gate-overview-screen"
      className="space-y-2.5 font-handwriting pb-2"
    >
      {/* Thought */}

      <div className="text-center py-0.5 px-1">
        <p className="text-sm sm:text-base font-notes text-zinc-400 italic">
          "Same Effort, Better Tomorrow."
        </p>
      </div>

      {/* Overall Progress */}

      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 sm:p-4 shadow-sm space-y-1.5 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase">
            OVERALL PROGRESS
          </span>

          <span className="text-2xl font-bold font-mono text-emerald-700">
            {overallProgress.percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-mono font-bold">
            {overallProgress.completed} /{' '}
            {overallProgress.total}
          </span>

          <span className="text-[11px] font-mono text-[#78716C]">
            {overallProgress.remaining}{' '}
            remaining
          </span>
        </div>

        <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{
              width: `${overallProgress.percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Expected Completion Date */}

      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 sm:p-4 shadow-sm space-y-1.5 text-[#1C1917]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-[#78716C] shrink-0" />

            <span className="text-[10px] sm:text-[11px] font-bold text-[#78716C] tracking-wider uppercase truncate">
              EXPECTED COMPLETION
            </span>
          </div>

          <span
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
              isTodayGateDone
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isTodayGateDone
              ? '✓ Today Done'
              : '○ Pending'}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base sm:text-lg font-fancy font-bold tracking-wide">
            {overallProgress.remaining ===
            0
              ? 'All Completed! 🎉'
              : expectedCompletion.formattedDate}
          </span>

          {overallProgress.remaining >
            0 && (
            <span className="text-[10px] font-mono text-[#78716C] shrink-0">
              {overallProgress.remaining}{' '}
              {overallProgress.remaining ===
              1
                ? 'day'
                : 'days'}{' '}
              left
            </span>
          )}
        </div>

        <p className="text-[10px] text-[#78716C] font-notes italic pt-1 border-t border-[#E5DDD0]/70 leading-tight">
          {overallProgress.remaining ===
          0
            ? 'All GATE videos have been finished!'
            : isTodayGateDone
            ? `Paced at 1 video/day. Today's video completed; remaining ${overallProgress.remaining} videos count from tomorrow.`
            : `Paced at 1 video/day. If today is missed, expected completion dynamically extends by 1 day.`}
        </p>
      </div>

      {/* Subjects */}

      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3 sm:p-4 shadow-sm space-y-2 text-[#1C1917]">
        <div className="flex items-center justify-between pb-1 border-b border-[#E5DDD0]">
          <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase">
            SUBJECTS ({gateStore.subjects.length})
          </span>

          <button
            type="button"
            onClick={() =>
              setIsAddingSubject(true)
            }
            className="text-[11px] font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subject
          </button>
        </div>

        <div className="space-y-1.5">
          {gateStore.subjects.map(
            (subject) => {
              const progress =
                calculateSubjectProgress(
                  subject.id,
                  gateStore.modules,
                  gateStore.videos
                );

              return (
                <div
                  key={subject.id}
                  className="p-2.5 bg-[#F1ECE2] border border-[#DDD4C5] rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() =>
                        setSelectedSubjectId(
                          subject.id
                        )
                      }
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="text-sm sm:text-base font-bold truncate">
                        {subject.title}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEditSubject(
                          subject
                        )
                      }
                      className="p-1 text-[#78716C]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    onClick={() =>
                      setSelectedSubjectId(
                        subject.id
                      )
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mt-0.5 text-xs font-mono">
                      <span className="font-bold">
                        {progress.completed}{' '}
                        /{' '}
                        {progress.total}
                      </span>

                      <span className="font-bold text-emerald-700">
                        {progress.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-[#DDD5C7] h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Add Subject Modal */}

      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
            <h3 className="text-lg font-bold font-fancy">
              Add Subject
            </h3>

            <form
              onSubmit={
                handleAddSubject
              }
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={newSubjectTitle}
                onChange={(e) =>
                  setNewSubjectTitle(
                    e.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base focus:outline-none"
                autoFocus
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddingSubject(
                      false
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderEditSubjectModal()}
      {renderEditModuleModal()}
    </div>
  );
};
