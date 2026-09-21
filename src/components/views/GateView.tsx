import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
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
  onBackToHome,
  currentRecord,
  allRecords,
  selectedDate,
}) => {
  /*
   * These props are intentionally retained because App.tsx may still
   * pass them. They do not need to be used directly on this screen.
   */
  void onBackToHome;
  void allRecords;

  // ------------------------------------------------------------
  // INTERNAL GATE NAVIGATION
  // overview -> subject -> module
  // ------------------------------------------------------------

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    null
  );

  // ------------------------------------------------------------
  // ADD SUBJECT / MODULE / VIDEO COUNT
  // ------------------------------------------------------------

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const [isSettingVideoCount, setIsSettingVideoCount] = useState(false);
  const [targetVideoCountInput, setTargetVideoCountInput] =
    useState('7');

  // ------------------------------------------------------------
  // EDIT / DELETE SUBJECT
  // ------------------------------------------------------------

  const [editingSubject, setEditingSubject] =
    useState<GateSubject | null>(null);

  const [editSubjectTitle, setEditSubjectTitle] = useState('');

  const [isConfirmingDeleteSubject, setIsConfirmingDeleteSubject] =
    useState(false);

  // ------------------------------------------------------------
  // EDIT / DELETE MODULE
  // ------------------------------------------------------------

  const [editingModule, setEditingModule] =
    useState<GateModule | null>(null);

  const [editModuleTitle, setEditModuleTitle] = useState('');

  const [editModuleVideoCount, setEditModuleVideoCount] =
    useState('7');

  const [isConfirmingDeleteModule, setIsConfirmingDeleteModule] =
    useState(false);

  // ------------------------------------------------------------
  // CALCULATIONS
  // ------------------------------------------------------------

  const overallProgress = calculateOverallGateProgress(
    gateStore.videos
  );

  const isTodayGateDone = currentRecord
    ? currentRecord.goals.gate === true
    : false;

  const effectiveDate =
    selectedDate || getTodayDateString();

  /*
   * Kept so the existing selected-date behaviour remains available
   * to the component without changing the surrounding app logic.
   */
  void isTodayGateDone;
  void effectiveDate;

  const selectedSubject = gateStore.subjects.find(
    (s) => s.id === selectedSubjectId
  );

  const selectedModule = gateStore.modules.find(
    (m) => m.id === selectedModuleId
  );

  // ------------------------------------------------------------
  // TOGGLE VIDEO COMPLETION
  // ------------------------------------------------------------

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

      // Check whether the module has just been completed.
      if (isNowCompleted) {
        const remainingInModule = updatedVideos.filter(
          (v) =>
            v.moduleId === video.moduleId &&
            !v.completed
        ).length;

        if (remainingInModule === 0) {
          const module = prev.modules.find(
            (m) => m.id === video.moduleId
          );

          const subject = module
            ? prev.subjects.find(
                (s) => s.id === module.subjectId
              )
            : null;

          if (
            subject &&
            module &&
            onTriggerCompletionModal
          ) {
            setTimeout(() => {
              onTriggerCompletionModal(
                subject.id,
                module.id
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

  // ------------------------------------------------------------
  // TOGGLE REVISION
  // ------------------------------------------------------------

  const handleToggleRevision = (moduleId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              revisionCompleted:
                !module.revisionCompleted,
              revisionCompletedAt:
                !module.revisionCompleted
                  ? new Date().toISOString()
                  : undefined,
            }
          : module
      ),
    }));
  };

  // ------------------------------------------------------------
  // TOGGLE PYQ
  // ------------------------------------------------------------

  const handleTogglePYQ = (moduleId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              pyqCompleted:
                !module.pyqCompleted,
              pyqCompletedAt:
                !module.pyqCompleted
                  ? new Date().toISOString()
                  : undefined,
            }
          : module
      ),
    }));
  };

  // ------------------------------------------------------------
  // ADD SUBJECT
  // ------------------------------------------------------------

  const handleAddSubject = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newSubjectTitle.trim()) {
      return;
    }

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

  // ------------------------------------------------------------
  // ADD MODULE
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // SET VIDEO COUNT
  // ------------------------------------------------------------

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
          (video) =>
            video.moduleId ===
            selectedModuleId
        )
        .sort(
          (a, b) =>
            a.order - b.order
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
            .map((video, index) => ({
              ...video,
              order: index + 1,
              title: `Video ${index + 1}`,
            }));
      } else {
        updatedModuleVideos =
          existingVideos.map(
            (video, index) => ({
              ...video,
              order: index + 1,
              title: `Video ${index + 1}`,
            })
          );

        for (
          let index =
            existingVideos.length + 1;
          index <= newCount;
          index++
        ) {
          updatedModuleVideos.push({
            id: `vid-${Date.now()}-${index}`,
            moduleId:
              selectedModuleId,
            title: `Video ${index}`,
            order: index,
            completed: false,
          });
        }
      }

      const otherVideos =
        prev.videos.filter(
          (video) =>
            video.moduleId !==
            selectedModuleId
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

  // ------------------------------------------------------------
  // EDIT SUBJECT
  // ------------------------------------------------------------

  const handleOpenEditSubject = (
    subject: GateSubject
  ) => {
    setEditingSubject(subject);
    setEditSubjectTitle(
      subject.title
    );
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

    const trimmedTitle =
      editSubjectTitle.trim();

    onUpdateStore((prev) => ({
      ...prev,
      subjects: prev.subjects.map(
        (subject) =>
          subject.id ===
          editingSubject.id
            ? {
                ...subject,
                title: trimmedTitle,
              }
            : subject
      ),
    }));

    setEditingSubject(null);
  };

  // ------------------------------------------------------------
  // DELETE SUBJECT
  // ------------------------------------------------------------

  const handleDeleteSubject = (
    subjectId: string
  ) => {
    onUpdateStore((prev) => {
      const subjectModules =
        prev.modules.filter(
          (module) =>
            module.subjectId === subjectId
        );

      const moduleIdsToDelete =
        new Set(
          subjectModules.map(
            (module) => module.id
          )
        );

      const updatedSubjects =
        prev.subjects.filter(
          (subject) =>
            subject.id !== subjectId
        );

      const updatedModules =
        prev.modules.filter(
          (module) =>
            module.subjectId !== subjectId
        );

      const updatedVideos =
        prev.videos.filter(
          (video) =>
            !moduleIdsToDelete.has(
              video.moduleId
            )
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

        const nextSubjectModules =
          updatedModules.filter(
            (module) =>
              module.subjectId ===
              nextSubject
          );

        updatedActive = {
          subjectId: nextSubject,
          moduleId:
            nextSubjectModules[0]?.id ||
            '',
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

  // ------------------------------------------------------------
  // EDIT MODULE
  // ------------------------------------------------------------

  const handleOpenEditModule = (
    module: GateModule
  ) => {
    const moduleVideos =
      gateStore.videos.filter(
        (video) =>
          video.moduleId === module.id
      );

    setEditingModule(module);

    setEditModuleTitle(
      module.title
    );

    setEditModuleVideoCount(
      moduleVideos.length > 0
        ? String(moduleVideos.length)
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

    const trimmedTitle =
      editModuleTitle.trim();

    const newCount = parseInt(
      editModuleVideoCount,
      10
    );

    onUpdateStore((prev) => {
      const updatedModules =
        prev.modules.map(
          (module) =>
            module.id ===
            editingModule.id
              ? {
                  ...module,
                  title: trimmedTitle,
                }
              : module
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
              (video) =>
                video.moduleId ===
                editingModule.id
            )
            .sort(
              (a, b) =>
                a.order - b.order
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
              .map(
                (video, index) => ({
                  ...video,
                  order: index + 1,
                  title: `Video ${
                    index + 1
                  }`,
                })
              );
        } else {
          updatedModuleVideos =
            existingVideos.map(
              (video, index) => ({
                ...video,
                order: index + 1,
                title: `Video ${
                  index + 1
                }`,
              })
            );

          for (
            let index =
              existingVideos.length + 1;
            index <= newCount;
            index++
          ) {
            updatedModuleVideos.push({
              id: `vid-${Date.now()}-${index}`,
              moduleId:
                editingModule.id,
              title: `Video ${index}`,
              order: index,
              completed: false,
            });
          }
        }

        const otherVideos =
          prev.videos.filter(
            (video) =>
              video.moduleId !==
              editingModule.id
          );

        updatedVideos = [
          ...otherVideos,
          ...updatedModuleVideos,
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

  // ------------------------------------------------------------
  // DELETE MODULE
  // ------------------------------------------------------------

  const handleDeleteModule = (
    moduleId: string
  ) => {
    onUpdateStore((prev) => {
      const updatedModules =
        prev.modules.filter(
          (module) =>
            module.id !== moduleId
        );

      const updatedVideos =
        prev.videos.filter(
          (video) =>
            video.moduleId !== moduleId
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
            (module) =>
              module.subjectId ===
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

  // ------------------------------------------------------------
  // EDIT SUBJECT MODAL
  // ------------------------------------------------------------

  const renderEditSubjectModal = () => {
    if (!editingSubject) {
      return null;
    }

    const subjectModules =
      gateStore.modules.filter(
        (module) =>
          module.subjectId ===
          editingSubject.id
      );

    const subjectVideos =
      gateStore.videos.filter(
        (video) =>
          subjectModules.some(
            (module) =>
              module.id ===
              video.moduleId
          )
      );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-fancy">
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
              className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE2D7]"
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
              <label className="block text-[11px] font-bold text-[#78716C] mb-1">
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
                placeholder="Subject name"
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
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
                className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-xs text-[#57534E]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="pt-2.5 border-t border-[#E5DDD0]">
            {!isConfirmingDeleteSubject ? (
              <button
                type="button"
                onClick={() =>
                  setIsConfirmingDeleteSubject(
                    true
                  )
                }
                className="w-full py-1.5 px-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Subject
              </button>
            ) : (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-[11px] text-rose-900 leading-snug font-semibold">
                  Delete{' '}
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
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EAE2D7] border border-[#DDD5C7]"
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
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-600 text-white font-bold"
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

  // ------------------------------------------------------------
  // EDIT MODULE MODAL
  // ------------------------------------------------------------

  const renderEditModuleModal = () => {
    if (!editingModule) {
      return null;
    }

    const moduleVideos =
      gateStore.videos.filter(
        (video) =>
          video.moduleId ===
          editingModule.id
      );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-fancy">
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
              className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE2D7]"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSaveEditModule}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-bold text-[#78716C] mb-1">
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
                placeholder="Module title"
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#78716C] mb-1">
                Total Videos
              </label>

              <input
                type="number"
                min="0"
                max="200"
                value={
                  editModuleVideoCount
                }
                onChange={(e) =>
                  setEditModuleVideoCount(
                    e.target.value
                  )
                }
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />

              <p className="text-[10px] text-[#78716C] mt-1">
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
                className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-xs text-[#57534E]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="pt-2.5 border-t border-[#E5DDD0]">
            {!isConfirmingDeleteModule ? (
              <button
                type="button"
                onClick={() =>
                  setIsConfirmingDeleteModule(
                    true
                  )
                }
                className="w-full py-1.5 px-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Module
              </button>
            ) : (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-[11px] text-rose-900 leading-snug font-semibold">
                  Delete{' '}
                  <strong>
                    {editingModule.title}
                  </strong>
                  ? This will permanently
                  delete this module and its{' '}
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
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EAE2D7] border border-[#DDD5C7]"
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
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-600 text-white font-bold"
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

  // ============================================================
  // PAGE 3 — MODULE DETAIL
  // ============================================================

  if (
    selectedModule &&
    selectedSubject
  ) {
    const moduleVideos =
      gateStore.videos
        .filter(
          (video) =>
            video.moduleId ===
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
        className="space-y-3 font-handwriting pb-2"
      >
        {/* Module header */}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() =>
                setSelectedModuleId(null)
              }
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            <div className="min-w-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                {selectedSubject.title}
              </span>

              <h2 className="text-lg font-bold text-zinc-100 leading-tight truncate">
                {selectedModule.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            title="Edit Module"
            onClick={() =>
              handleOpenEditModule(
                selectedModule
              )
            }
            className="px-2 py-1.5 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-[11px] font-bold border border-zinc-700 shrink-0 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Module progress */}

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm space-y-2 text-[#1C1917]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider font-fancy truncate pr-2">
              {selectedModule.title}
            </span>

            <span className="text-xl font-bold font-mono text-emerald-700">
              {moduleProgress.percentage}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono font-bold">
            <span>
              {moduleProgress.completed} /{' '}
              {moduleProgress.total}
            </span>

            <span className="text-[11px] font-normal text-[#78716C]">
              {moduleProgress.remaining}{' '}
              remaining
            </span>
          </div>

          <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden border border-[#DDD5C7]">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{
                width: `${moduleProgress.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Revision / PYQ */}

        <div className="grid grid-cols-2 gap-2">
          <div
            onClick={() =>
              handleToggleRevision(
                selectedModule.id
              )
            }
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F1ECE1] shadow-xs"
          >
            <span className="text-sm font-bold text-[#1C1917]">
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
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F1ECE1] shadow-xs"
          >
            <span className="text-sm font-bold text-[#1C1917]">
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

        {/* Videos */}

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm space-y-2.5 text-[#1C1917]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#E5DDD0]">
            <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase font-fancy">
              VIDEOS (
              {moduleProgress.completed}/
              {moduleProgress.total})
            </span>

            <button
              type="button"
              onClick={() => {
                setTargetVideoCountInput(
                  moduleVideos.length > 0
                    ? String(
                        moduleVideos.length
                      )
                    : '7'
                );

                setIsSettingVideoCount(
                  true
                );
              }}
              className="text-[10px] text-[#1C1917] font-bold flex items-center gap-1 bg-[#EAE2D7] border border-[#DDD5C7] px-2 py-1 rounded-lg"
            >
              <Pencil className="w-3 h-3" />
              Set Count
            </button>
          </div>

          {moduleVideos.length === 0 ? (
            <div className="py-5 text-center space-y-2">
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
                className="inline-flex items-center px-4 py-1.5 rounded-lg bg-[#1C1917] text-white font-bold text-xs"
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
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer min-h-[40px] ${
                      video.completed
                        ? 'bg-[#EDE7DC]/70'
                        : 'hover:bg-[#F1ECE1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`shrink-0 ${
                          video.completed
                            ? 'text-[#8C827A]'
                            : 'text-[#78716C]'
                        }`}
                      >
                        <HandwrittenPlayIcon className="w-3 h-3 stroke-[2]" />
                      </div>

                      <span
                        className={`text-sm truncate ${
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

        {/* Complete next */}

        {nextVideo ? (
          <button
            type="button"
            onClick={() =>
              handleToggleVideo(
                nextVideo
              )
            }
            className="w-full py-2.5 rounded-xl bg-[#1C1917] text-[#FAF7F0] text-sm font-bold shadow-md flex items-center justify-center"
          >
            Complete Next: Video{' '}
            {nextVideo.order || 1}
          </button>
        ) : moduleProgress.total >
            0 &&
          moduleProgress.remaining ===
            0 ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-center font-bold text-sm">
            ✓ Module 100% Completed
          </div>
        ) : null}

        {/* Set video count modal */}

        {isSettingVideoCount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
              <div>
                <h3 className="text-base font-bold font-fancy">
                  Total Videos
                </h3>

                <p className="text-[10px] text-[#78716C] leading-normal mt-1">
                  Enter the number of videos
                  in this module.
                </p>
              </div>

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
                  className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-xl font-mono text-center font-bold focus:outline-none focus:border-[#1C1917]"
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
                    className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-bold"
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

  // ============================================================
  // PAGE 2 — SUBJECT DETAIL
  // ============================================================

  if (selectedSubject) {
    const subjectModules =
      gateStore.modules
        .filter(
          (module) =>
            module.subjectId ===
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

    const strokeDashoffset =
      circumference *
      (1 -
        subjectProgress.percentage /
          100);

    return (
      <div
        id="gate-subject-detail"
        className="space-y-3 font-handwriting pb-2"
      >
        {/* Subject header */}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() =>
                setSelectedSubjectId(null)
              }
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            <h2 className="text-lg font-bold text-zinc-100 leading-tight truncate">
              {selectedSubject.title}
            </h2>
          </div>

          <button
            type="button"
            title="Edit Subject"
            onClick={() =>
              handleOpenEditSubject(
                selectedSubject
              )
            }
            className="px-2 py-1.5 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-[11px] font-bold border border-zinc-700 shrink-0 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Subject progress */}

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm flex items-center gap-3 text-[#1C1917]">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 origin-center"
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
                  strokeDashoffset
                }
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-mono font-bold">
                {subjectProgress.percentage}%
              </span>
            </div>
          </div>

          <div className="min-w-0">
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

            <p className="text-xs font-notes text-[#78716C] italic mt-0.5">
              "One subject at a time."
            </p>
          </div>
        </div>

        {/* Modules */}

        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm space-y-2.5 text-[#1C1917]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#E5DDD0]">
            <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase font-fancy">
              MODULES
            </span>

            <button
              type="button"
              onClick={() =>
                setIsAddingModule(true)
              }
              className="text-[11px] text-[#1C1917] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Module
            </button>
          </div>

          <div className="space-y-1.5">
            {subjectModules.map(
              (module) => {
                const moduleProgress =
                  calculateModuleProgress(
                    module.id,
                    gateStore.videos
                  );

                const isDone =
                  moduleProgress.total >
                    0 &&
                  moduleProgress.remaining ===
                    0;

                return (
                  <div
                    key={module.id}
                    className="group p-2.5 bg-[#F1ECE2] hover:bg-[#E8E1D3] border border-[#DDD4C5] rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() =>
                          setSelectedModuleId(
                            module.id
                          )
                        }
                        className="flex-1 cursor-pointer min-w-0 pr-1"
                      >
                        <span className="text-sm font-bold text-[#1C1917] truncate block">
                          {module.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isDone && (
                          <span className="text-emerald-700 font-bold text-[10px]">
                            ✓
                          </span>
                        )}

                        <button
                          type="button"
                          title="Edit Module"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModule(
                              module
                            );
                          }}
                          className="p-1 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#DDD5C7]"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>

                        <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
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
                      <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                        <span>
                          {
                            moduleProgress.completed
                          }{' '}
                          /{' '}
                          {
                            moduleProgress.total
                          }
                        </span>

                        <span className="text-emerald-700 font-bold">
                          {
                            moduleProgress.percentage
                          }
                          %
                        </span>
                      </div>

                      <div className="w-full bg-[#DDD5C7] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${moduleProgress.percentage}%`,
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

        {/* Add Module modal */}

        {isAddingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
              <h3 className="text-base font-bold font-fancy">
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
                  placeholder="Module name"
                  value={newModuleTitle}
                  onChange={(e) =>
                    setNewModuleTitle(
                      e.target.value
                    )
                  }
                  className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C1917]"
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
                    className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-bold"
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

  // ============================================================
  // PAGE 1 — GATE OVERVIEW
  // ============================================================

  return (
    <div
      id="gate-overview-screen"
      className="space-y-3 font-handwriting pb-2"
    >
      {/* Thought */}

      <div className="text-center py-0.5 px-1">
        <p className="text-sm sm:text-base font-notes text-zinc-400 italic">
          "Same Effort, Better Tomorrow."
        </p>
      </div>

      {/* Overall progress */}

      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm space-y-2 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase font-fancy">
            OVERALL PROGRESS
          </span>

          <span className="text-xl font-bold font-mono text-emerald-700">
            {overallProgress.percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-mono font-bold">
            {overallProgress.completed}{' '}
            / {overallProgress.total}
          </span>

          <span className="text-[11px] font-mono text-[#78716C]">
            {overallProgress.remaining}{' '}
            remaining
          </span>
        </div>

        <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden border border-[#DDD5C7]">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{
              width: `${overallProgress.percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Subjects */}

      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-3 shadow-sm space-y-2 text-[#1C1917]">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#E5DDD0]">
          <span className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase font-fancy">
            SUBJECTS (
            {gateStore.subjects.length})
          </span>

          <button
            type="button"
            onClick={() =>
              setIsAddingSubject(true)
            }
            className="text-[11px] text-[#1C1917] font-bold flex items-center gap-1 hover:text-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subject
          </button>
        </div>

        <div className="space-y-1.5 pt-0.5">
          {gateStore.subjects.map(
            (subject) => {
              const subjectProgress =
                calculateSubjectProgress(
                  subject.id,
                  gateStore.modules,
                  gateStore.videos
                );

              return (
                <div
                  key={subject.id}
                  className="group p-2.5 bg-[#F1ECE2] hover:bg-[#E8E1D3] rounded-lg transition-colors border border-[#DDD4C5] text-[#1C1917]"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() =>
                        setSelectedSubjectId(
                          subject.id
                        )
                      }
                      className="flex-1 cursor-pointer min-w-0 pr-1"
                    >
                      <div className="text-sm font-bold truncate">
                        {subject.title}
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Edit Subject"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditSubject(
                          subject
                        );
                      }}
                      className="p-1 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#DDD5C7] shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#78716C]" />
                  </div>

                  <div
                    onClick={() =>
                      setSelectedSubjectId(
                        subject.id
                      )
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mt-0.5 text-[11px] font-mono text-[#57534E]">
                      <span className="font-bold">
                        {
                          subjectProgress.completed
                        }{' '}
                        /{' '}
                        {
                          subjectProgress.total
                        }
                      </span>

                      <span className="font-bold text-emerald-700">
                        {
                          subjectProgress.percentage
                        }
                        %
                      </span>
                    </div>

                    <div className="w-full bg-[#DDD5C7] h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${subjectProgress.percentage}%`,
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

      {/* Add Subject modal */}

      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
            <h3 className="text-base font-bold font-fancy">
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
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1C1917]"
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
                  className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-bold"
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
