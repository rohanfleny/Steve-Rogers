import React, { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Check,
  Play,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Compass,
  Sparkles,
  Pencil,
  Calendar,
  CalendarDays,
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
  calculateGateProjection,
  calculateExpectedCompletionDate,
  getNextIncompleteVideo,
} from '../../logic/gateCalculations';
import { getTodayDateString } from '../../logic/calculations';
import {
  MiniGraphDoodle,
  HandwrittenCheckbox,
  HandwrittenPlayIcon,
} from '../HandwrittenDoodles';

interface GateViewProps {
  gateStore: GateStoreState;
  onUpdateStore: (updater: (prev: GateStoreState) => GateStoreState) => void;
  onTriggerCompletionModal?: (subjectId: string, moduleId: string) => void;
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
  // Navigation stack within GATE:
  // 'overview' -> 'subject' (with selectedSubjectId) -> 'module' (with selectedModuleId)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // New item modal states
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isSettingVideoCount, setIsSettingVideoCount] = useState(false);
  const [targetVideoCountInput, setTargetVideoCountInput] = useState('7');

  // Edit/Delete Subject & Module states
  const [editingSubject, setEditingSubject] = useState<GateSubject | null>(null);
  const [editSubjectTitle, setEditSubjectTitle] = useState('');
  const [isConfirmingDeleteSubject, setIsConfirmingDeleteSubject] = useState(false);

  const [editingModule, setEditingModule] = useState<GateModule | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleVideoCount, setEditModuleVideoCount] = useState('7');
  const [isConfirmingDeleteModule, setIsConfirmingDeleteModule] = useState(false);

  // Calculations
  const overallProgress = calculateOverallGateProgress(gateStore.videos);
  const isTodayGateDone = currentRecord ? currentRecord.goals.gate === true : false;
  const effectiveDate = selectedDate || getTodayDateString();
  const expectedCompletion = calculateExpectedCompletionDate(
    overallProgress.remaining,
    isTodayGateDone,
    effectiveDate
  );
  const projections = calculateGateProjection(
    gateStore.projectionSettings,
    overallProgress.total,
    overallProgress.completed,
    overallProgress.remaining,
    gateStore.videos
  );

  const selectedSubject = gateStore.subjects.find((s) => s.id === selectedSubjectId);
  const selectedModule = gateStore.modules.find((m) => m.id === selectedModuleId);

  // Toggle Video Completion
  const handleToggleVideo = (video: GateVideo) => {
    const isNowCompleted = !video.completed;
    const nowIso = new Date().toISOString();

    onUpdateStore((prev) => {
      const updatedVideos = prev.videos.map((v) =>
        v.id === video.id
          ? { ...v, completed: isNowCompleted, completedAt: isNowCompleted ? nowIso : undefined }
          : v
      );

      // Check if module just became complete
      if (isNowCompleted) {
        const remainingInMod = updatedVideos.filter(
          (v) => v.moduleId === video.moduleId && !v.completed
        ).length;
        if (remainingInMod === 0) {
          const mod = prev.modules.find((m) => m.id === video.moduleId);
          const subj = mod ? prev.subjects.find((s) => s.id === mod.subjectId) : null;
          if (subj && mod) {
            setTimeout(() => onTriggerCompletionModal(subj.id, mod.id), 150);
          }
        }
      }

      return { ...prev, videos: updatedVideos };
    });
  };

  // Toggle Module Revision
  const handleToggleRevision = (modId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              revisionCompleted: !m.revisionCompleted,
              revisionCompletedAt: !m.revisionCompleted ? new Date().toISOString() : undefined,
            }
          : m
      ),
    }));
  };

  // Toggle Module PYQ
  const handleTogglePYQ = (modId: string) => {
    onUpdateStore((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              pyqCompleted: !m.pyqCompleted,
              pyqCompletedAt: !m.pyqCompleted ? new Date().toISOString() : undefined,
            }
          : m
      ),
    }));
  };

  // Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;
    const newSubj: GateSubject = {
      id: `subj-${Date.now()}`,
      title: newSubjectTitle.trim(),
      order: gateStore.subjects.length + 1,
    };
    onUpdateStore((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
    setNewSubjectTitle('');
    setIsAddingSubject(false);
  };

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !selectedSubjectId) return;
    const newMod: GateModule = {
      id: `mod-${Date.now()}`,
      subjectId: selectedSubjectId,
      title: newModuleTitle.trim(),
      order: gateStore.modules.filter((m) => m.subjectId === selectedSubjectId).length + 1,
      revisionCompleted: false,
      pyqCompleted: false,
    };
    onUpdateStore((prev) => ({
      ...prev,
      modules: [...prev.modules, newMod],
    }));
    setNewModuleTitle('');
    setIsAddingModule(false);
  };

  // Set Total Videos Count for Module (auto generates Video 1, Video 2, etc.)
  const handleSetVideoCount = (newCount: number) => {
    if (!selectedModuleId || isNaN(newCount) || newCount < 0) return;
    onUpdateStore((prev) => {
      const existingVideos = prev.videos
        .filter((v) => v.moduleId === selectedModuleId)
        .sort((a, b) => a.order - b.order);

      let updatedModuleVideos: GateVideo[] = [];

      if (newCount <= existingVideos.length) {
        // Keep first newCount videos, preserve completion status
        updatedModuleVideos = existingVideos.slice(0, newCount).map((v, i) => ({
          ...v,
          order: i + 1,
          title: `Video ${i + 1}`,
        }));
      } else {
        // Keep existing and append new Video X items
        updatedModuleVideos = existingVideos.map((v, i) => ({
          ...v,
          order: i + 1,
          title: `Video ${i + 1}`,
        }));
        for (let i = existingVideos.length + 1; i <= newCount; i++) {
          updatedModuleVideos.push({
            id: `vid-${Date.now()}-${i}`,
            moduleId: selectedModuleId,
            title: `Video ${i}`,
            order: i,
            completed: false,
          });
        }
      }

      const otherVideos = prev.videos.filter((v) => v.moduleId !== selectedModuleId);
      return {
        ...prev,
        videos: [...otherVideos, ...updatedModuleVideos],
      };
    });
    setIsSettingVideoCount(false);
  };

  // Open Edit Subject
  const handleOpenEditSubject = (subj: GateSubject) => {
    setEditingSubject(subj);
    setEditSubjectTitle(subj.title);
    setIsConfirmingDeleteSubject(false);
  };

  // Save Edit Subject
  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectTitle.trim()) return;
    const trimmed = editSubjectTitle.trim();
    onUpdateStore((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === editingSubject.id ? { ...s, title: trimmed } : s
      ),
    }));
    setEditingSubject(null);
  };

  // Delete Subject (Cascading delete of subject, modules, and videos)
  const handleDeleteSubject = (subjectId: string) => {
    onUpdateStore((prev) => {
      const subjectModules = prev.modules.filter((m) => m.subjectId === subjectId);
      const moduleIdsToDelete = new Set(subjectModules.map((m) => m.id));

      const updatedSubjects = prev.subjects.filter((s) => s.id !== subjectId);
      const updatedModules = prev.modules.filter((m) => m.subjectId !== subjectId);
      const updatedVideos = prev.videos.filter((v) => !moduleIdsToDelete.has(v.moduleId));

      let updatedActive = { ...prev.activeConnection };
      if (prev.activeConnection.subjectId === subjectId) {
        const nextSubj = updatedSubjects[0]?.id || '';
        const nextSubjMods = updatedModules.filter((m) => m.subjectId === nextSubj);
        updatedActive = {
          subjectId: nextSubj,
          moduleId: nextSubjMods[0]?.id || '',
        };
      }

      return {
        ...prev,
        subjects: updatedSubjects,
        modules: updatedModules,
        videos: updatedVideos,
        activeConnection: updatedActive,
      };
    });

    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
      setSelectedModuleId(null);
    }
    setEditingSubject(null);
  };

  // Open Edit Module
  const handleOpenEditModule = (mod: GateModule) => {
    const modVideos = gateStore.videos.filter((v) => v.moduleId === mod.id);
    setEditingModule(mod);
    setEditModuleTitle(mod.title);
    setEditModuleVideoCount(modVideos.length > 0 ? String(modVideos.length) : '7');
    setIsConfirmingDeleteModule(false);
  };

  // Save Edit Module
  const handleSaveEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editModuleTitle.trim()) return;
    const trimmedTitle = editModuleTitle.trim();
    const newCount = parseInt(editModuleVideoCount, 10);

    onUpdateStore((prev) => {
      // 1. Update module title
      const updatedModules = prev.modules.map((m) =>
        m.id === editingModule.id ? { ...m, title: trimmedTitle } : m
      );

      // 2. Update videos if count specified
      let updatedVideos = prev.videos;
      if (!isNaN(newCount) && newCount >= 0) {
        const existingVideos = prev.videos
          .filter((v) => v.moduleId === editingModule.id)
          .sort((a, b) => a.order - b.order);

        let updatedModuleVideos: GateVideo[] = [];
        if (newCount <= existingVideos.length) {
          updatedModuleVideos = existingVideos.slice(0, newCount).map((v, i) => ({
            ...v,
            order: i + 1,
            title: `Video ${i + 1}`,
          }));
        } else {
          updatedModuleVideos = existingVideos.map((v, i) => ({
            ...v,
            order: i + 1,
            title: `Video ${i + 1}`,
          }));
          for (let i = existingVideos.length + 1; i <= newCount; i++) {
            updatedModuleVideos.push({
              id: `vid-${Date.now()}-${i}`,
              moduleId: editingModule.id,
              title: `Video ${i}`,
              order: i,
              completed: false,
            });
          }
        }
        const otherVideos = prev.videos.filter((v) => v.moduleId !== editingModule.id);
        updatedVideos = [...otherVideos, ...updatedModuleVideos];
      }

      return {
        ...prev,
        modules: updatedModules,
        videos: updatedVideos,
      };
    });

    setEditingModule(null);
  };

  // Delete Module
  const handleDeleteModule = (moduleId: string) => {
    onUpdateStore((prev) => {
      const updatedModules = prev.modules.filter((m) => m.id !== moduleId);
      const updatedVideos = prev.videos.filter((v) => v.moduleId !== moduleId);

      let updatedActive = { ...prev.activeConnection };
      if (prev.activeConnection.moduleId === moduleId) {
        const remainingModsInSubj = updatedModules.filter(
          (m) => m.subjectId === prev.activeConnection.subjectId
        );
        updatedActive = {
          ...prev.activeConnection,
          moduleId: remainingModsInSubj[0]?.id || '',
        };
      }

      return {
        ...prev,
        modules: updatedModules,
        videos: updatedVideos,
        activeConnection: updatedActive,
      };
    });

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
    }
    setEditingModule(null);
  };

  /* ==========================================================
     EDIT SUBJECT & MODULE MODAL RENDERERS
     ========================================================== */
  const renderEditSubjectModal = () => {
    if (!editingSubject) return null;
    const subjModules = gateStore.modules.filter((m) => m.subjectId === editingSubject.id);
    const subjVideos = gateStore.videos.filter((v) =>
      subjModules.some((m) => m.id === v.moduleId)
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1C1917] font-fancy">Edit Subject</h3>
            <button
              type="button"
              onClick={() => {
                setEditingSubject(null);
                setIsConfirmingDeleteSubject(false);
              }}
              className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE2D7] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveEditSubject} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={editSubjectTitle}
                onChange={(e) => setEditSubjectTitle(e.target.value)}
                placeholder="Subject name"
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditingSubject(null);
                  setIsConfirmingDeleteSubject(false);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-[#E5DDD0] space-y-2">
            {!isConfirmingDeleteSubject ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDeleteSubject(true)}
                className="w-full py-2 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Subject</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
                <p className="text-xs text-rose-900 leading-snug font-semibold">
                  Are you sure you want to delete <strong>{editingSubject.title}</strong>? This will permanently delete {subjModules.length} modules and {subjVideos.length} videos.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeleteSubject(false)}
                    className="px-3 py-1 text-xs rounded-xl bg-[#EAE2D7] border border-[#DDD5C7] text-[#57534E] hover:bg-[#DDD5C7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(editingSubject.id)}
                    className="px-3 py-1 text-xs rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                  >
                    Yes, Delete Subject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEditModuleModal = () => {
    if (!editingModule) return null;
    const modVideos = gateStore.videos.filter((v) => v.moduleId === editingModule.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 font-handwriting text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1C1917] font-fancy">Edit Module</h3>
            <button
              type="button"
              onClick={() => {
                setEditingModule(null);
                setIsConfirmingDeleteModule(false);
              }}
              className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE2D7] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveEditModule} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Module Name
              </label>
              <input
                type="text"
                value={editModuleTitle}
                onChange={(e) => setEditModuleTitle(e.target.value)}
                placeholder="Module title"
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
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
                onChange={(e) => setEditModuleVideoCount(e.target.value)}
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base font-mono text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <p className="text-[11px] text-[#78716C] mt-1">
                Currently {modVideos.length} videos. Changing count automatically adds or trims videos.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditingModule(null);
                  setIsConfirmingDeleteModule(false);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-[#E5DDD0] space-y-2">
            {!isConfirmingDeleteModule ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDeleteModule(true)}
                className="w-full py-2 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Module</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
                <p className="text-xs text-rose-900 leading-snug font-semibold">
                  Are you sure you want to delete <strong>{editingModule.title}</strong>? This will permanently delete this module and all its {modVideos.length} videos.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeleteModule(false)}
                    className="px-3 py-1 text-xs rounded-xl bg-[#EAE2D7] border border-[#DDD5C7] text-[#57534E] hover:bg-[#DDD5C7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteModule(editingModule.id)}
                    className="px-3 py-1 text-xs rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                  >
                    Yes, Delete Module
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
     PAGE 5: MODULE DETAIL VIEW
     ========================================================== */
  if (selectedModule && selectedSubject) {
    const moduleVideos = gateStore.videos
      .filter((v) => v.moduleId === selectedModule.id)
      .sort((a, b) => a.order - b.order);
    const modProgress = calculateModuleProgress(selectedModule.id, gateStore.videos);
    const nextVideo = getNextIncompleteVideo(selectedModule.id, gateStore.videos);

    return (
      <div id="gate-module-detail" className="space-y-4 font-handwriting">
        {/* Module Sub-Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedModuleId(null)}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="min-w-0">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block truncate">
                {selectedSubject.title}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 leading-tight truncate">
                {selectedModule.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            title="Edit Module"
            onClick={() => handleOpenEditModule(selectedModule)}
            className="p-2 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold border border-zinc-700 shrink-0 cursor-pointer bg-zinc-800/60"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Clear Progress Section at the TOP based ONLY on video completion in Warm Card */}
        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 text-[#1C1917]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#78716C] uppercase tracking-wider font-fancy">
              {selectedModule.title.toUpperCase()}
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
              {modProgress.percentage}%
            </span>
          </div>

          <div className="flex items-center justify-between text-base sm:text-lg font-mono font-bold text-[#1C1917]">
            <span>
              {modProgress.completed} / {modProgress.total}
            </span>
            <span className="text-sm font-normal text-[#78716C] font-handwriting">
              {modProgress.remaining} remaining
            </span>
          </div>

          {/* Dynamic Progress Bar directly under the count */}
          <div className="w-full bg-[#E5DDD0] h-3 rounded-full overflow-hidden p-0.5 border border-[#DDD5C7]">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${modProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Revision & PYQ Checkboxes */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => handleToggleRevision(selectedModule.id)}
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F1ECE1] transition-colors shadow-xs min-h-[52px]"
          >
            <span className="text-base sm:text-lg font-bold text-[#1C1917]">Revision</span>
            <HandwrittenCheckbox
              checked={selectedModule.revisionCompleted}
              onChange={() => handleToggleRevision(selectedModule.id)}
              color="sage"
              size="sm"
            />
          </div>

          <div
            onClick={() => handleTogglePYQ(selectedModule.id)}
            className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F1ECE1] transition-colors shadow-xs min-h-[52px]"
          >
            <span className="text-base sm:text-lg font-bold text-[#1C1917]">PYQ Completed</span>
            <HandwrittenCheckbox
              checked={selectedModule.pyqCompleted}
              onChange={() => handleTogglePYQ(selectedModule.id)}
              color="sage"
              size="sm"
            />
          </div>
        </div>

        {/* Videos List with clean play icon and clear numbering */}
        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 text-[#1C1917]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0]">
            <span className="text-xs sm:text-sm font-bold text-[#78716C] tracking-wider uppercase font-fancy">
              VIDEOS ({modProgress.completed}/{modProgress.total})
            </span>
            <button
              type="button"
              onClick={() => {
                setTargetVideoCountInput(moduleVideos.length > 0 ? moduleVideos.length.toString() : '7');
                setIsSettingVideoCount(true);
              }}
              className="text-xs sm:text-sm text-[#1C1917] font-bold flex items-center gap-1.5 hover:bg-[#DDD5C7] bg-[#EAE2D7] border border-[#DDD5C7] px-3 py-1 rounded-xl transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Set Video Count</span>
            </button>
          </div>

          {moduleVideos.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-[#78716C]">
                No videos added yet. Enter video count to generate lectures:
              </p>
              <button
                type="button"
                onClick={() => {
                  setTargetVideoCountInput('7');
                  setIsSettingVideoCount(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1C1917] text-white font-bold text-sm hover:bg-black transition-colors shadow-xs cursor-pointer"
              >
                <span>Set Video Count (e.g. 7)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {moduleVideos.map((video, idx) => (
                <div
                  key={video.id}
                  onClick={() => handleToggleVideo(video)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer min-h-[46px] ${
                    video.completed ? 'bg-[#EDE7DC]/70' : 'hover:bg-[#F1ECE1]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Small clean play icon matching reference */}
                    <div className={`shrink-0 ${video.completed ? 'text-[#8C827A]' : 'text-[#78716C]'}`}>
                      <HandwrittenPlayIcon className="w-3.5 h-3.5 stroke-[2]" />
                    </div>

                    <span
                      className={`text-base sm:text-lg ${
                        video.completed
                          ? 'text-[#8C827A] line-through decoration-[#A89F95]'
                          : 'text-[#1C1917] font-semibold'
                      }`}
                    >
                      Video {video.order || idx + 1}
                    </span>
                  </div>

                  <HandwrittenCheckbox
                    checked={video.completed}
                    onChange={() => handleToggleVideo(video)}
                    color="sage"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        {nextVideo ? (
          <button
            type="button"
            onClick={() => handleToggleVideo(nextVideo)}
            className="w-full py-3.5 rounded-2xl bg-[#1C1917] text-[#FAF7F0] text-base sm:text-lg font-bold hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Complete Next: Video {nextVideo.order || 1}</span>
          </button>
        ) : modProgress.total > 0 && modProgress.remaining === 0 ? (
          <div className="w-full py-3.5 rounded-2xl bg-emerald-700 text-white text-center font-bold text-base sm:text-lg shadow-sm">
            ✓ Module 100% Completed !
          </div>
        ) : null}

        {/* Set Video Count Dialog */}
        {isSettingVideoCount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 font-handwriting text-[#1C1917]">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1C1917] font-fancy">Total Videos Count</h3>
                <p className="text-xs text-[#78716C] leading-normal">
                  Enter the number of videos in this module (e.g. 7). Videos will be generated automatically without individual naming.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseInt(targetVideoCountInput, 10);
                  if (!isNaN(val) && val >= 0) {
                    handleSetVideoCount(val);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#78716C] mb-1">
                    Number of Videos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="e.g. 7"
                    value={targetVideoCountInput}
                    onChange={(e) => setTargetVideoCountInput(e.target.value)}
                    className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-xl font-mono text-[#1C1917] text-center font-bold focus:outline-none focus:border-[#1C1917]"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSettingVideoCount(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black shadow-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modals */}
        {renderEditSubjectModal()}
        {renderEditModuleModal()}
      </div>
    );
  }

  /* ==========================================================
     PAGE 3: SUBJECT DETAIL VIEW
     ========================================================== */
  if (selectedSubject) {
    const subjectModules = gateStore.modules
      .filter((m) => m.subjectId === selectedSubject.id)
      .sort((a, b) => a.order - b.order);
    const subjProgress = calculateSubjectProgress(
      selectedSubject.id,
      gateStore.modules,
      gateStore.videos
    );

    const circleRadius = 20;
    const circumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circumference * (1 - subjProgress.percentage / 100);

    return (
      <div id="gate-subject-detail" className="space-y-4 sm:space-y-5 font-handwriting">
        {/* Back navigation & Subject Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedSubjectId(null)}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 leading-tight truncate">
              {selectedSubject.title}
            </h2>
          </div>

          <button
            type="button"
            title="Edit Subject"
            onClick={() => handleOpenEditSubject(selectedSubject)}
            className="p-2 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold border border-zinc-700 shrink-0 cursor-pointer bg-zinc-800/60"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Circular Progress Ring Card - Warm Card */}
        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-5 text-[#1C1917]">
          {/* Circular Ring: -rotate-90 origin-center ensures 0% starts at exact North / 12 o'clock */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={circleRadius}
                stroke="#E5DDD0"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r={circleRadius}
                stroke="#16A34A"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-mono font-bold text-[#1C1917]">
                {subjProgress.percentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-lg sm:text-xl font-mono font-bold text-[#1C1917]">
              {subjProgress.completed} / {subjProgress.total} videos
            </div>
            <div className="text-sm text-[#78716C] mt-0.5">
              {subjectModules.length} modules
            </div>
            <p className="text-sm font-notes text-[#78716C] italic mt-1">
              "One subject mastered at a time."
            </p>
          </div>
        </div>

        {/* Modules List - Warm Card */}
        <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 text-[#1C1917]">
          <div className="flex items-center justify-between pb-1 border-b border-[#E5DDD0]">
            <span className="text-xs sm:text-sm font-bold text-[#78716C] tracking-wider uppercase font-fancy">
              MODULES
            </span>
            <button
              type="button"
              onClick={() => setIsAddingModule(true)}
              className="text-xs sm:text-sm text-[#1C1917] font-bold flex items-center gap-1 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Module
            </button>
          </div>

          <div className="space-y-2.5">
            {subjectModules.map((mod) => {
              const modProgress = calculateModuleProgress(mod.id, gateStore.videos);
              const isDone = modProgress.total > 0 && modProgress.remaining === 0;

              return (
                <div
                  key={mod.id}
                  className="group p-3.5 bg-[#F1ECE2] hover:bg-[#E8E1D3] border border-[#DDD4C5] rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setSelectedModuleId(mod.id)}
                      className="flex-1 cursor-pointer min-w-0 pr-2"
                    >
                      <span className="text-base font-bold text-[#1C1917] truncate block">
                        {mod.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDone && <span className="text-emerald-700 font-bold text-xs">✓ Done</span>}
                      <button
                        type="button"
                        title="Edit Module"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModule(mod);
                        }}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#DDD5C7] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedModuleId(mod.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm text-[#57534E] font-mono mt-1">
                      <span>
                        {modProgress.completed} / {modProgress.total}
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {modProgress.percentage}%
                      </span>
                    </div>

                    {/* Progress bar directly underneath */}
                    <div className="w-full bg-[#DDD5C7] h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${modProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational quote at bottom */}
        <div className="text-center py-1">
          <p className="text-base font-notes text-[#78716C] italic">
            "You don't have to be perfect, just consistent."
          </p>
        </div>

        {/* Add Module Modal */}
        {isAddingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
              <h3 className="text-lg font-bold text-[#1C1917] font-fancy">Add Module</h3>
              <form onSubmit={handleAddModule} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Module 3 - Routing Protocols"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingModule(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modals */}
        {renderEditSubjectModal()}
        {renderEditModuleModal()}
      </div>
    );
  }

  /* ==========================================================
     PAGE 2: MAIN GATE OVERVIEW SCREEN
     Shows ONLY:
     1. FIXED Top Thought
     2. OVERALL PROGRESS (Count, Percentage right, Progress bar underneath)
     3. Compact SUBJECT LIST
     No Active Path, no projection summary.
     ========================================================== */
  return (
    <div id="gate-overview-screen" className="space-y-4 font-handwriting">
      {/* 1. Aligned, clean handwritten thought */}
      <div className="text-center py-2 px-1">
        <p className="text-base sm:text-lg font-notes text-zinc-400 italic">
          "Same Effort, Better Tomorrow."
        </p>
      </div>

      {/* 2. OVERALL PROGRESS (Warm Card) */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-[#78716C] tracking-wider uppercase font-fancy">
            OVERALL PROGRESS
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
            {overallProgress.percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl sm:text-2xl font-mono font-bold text-[#1C1917]">
            {overallProgress.completed} / {overallProgress.total}
          </span>
          <span className="text-xs sm:text-sm font-mono text-[#78716C]">
            {overallProgress.remaining} remaining
          </span>
        </div>

        {/* Clear Progress Bar */}
        <div className="w-full bg-[#E5DDD0] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#DDD5C7]">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* 2.5 EXPECTED COMPLETION DATE CARD (Paced at 1 video/day, extends if a day is missed) */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#78716C]" />
            <span className="text-xs sm:text-sm font-bold text-[#78716C] tracking-wider uppercase font-fancy">
              EXPECTED COMPLETION DATE
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              isTodayGateDone
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isTodayGateDone ? '✓ Today Done' : '○ Today Pending'}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <span className="text-xl sm:text-2xl font-fancy font-bold text-[#1C1917] tracking-wide">
            {overallProgress.remaining === 0 ? 'All Completed! 🎉' : expectedCompletion.formattedDate}
          </span>
          {overallProgress.remaining > 0 && (
            <span className="text-xs sm:text-sm font-mono text-[#78716C] shrink-0">
              {overallProgress.remaining} {overallProgress.remaining === 1 ? 'day' : 'days'} left
            </span>
          )}
        </div>

        <p className="text-[12px] text-[#78716C] font-notes italic pt-0.5 border-t border-[#E5DDD0]/70 leading-tight">
          {overallProgress.remaining === 0
            ? 'All GATE videos have been finished!'
            : isTodayGateDone
            ? `Paced at 1 video/day. Today's video completed; remaining ${overallProgress.remaining} videos count from tomorrow.`
            : `Paced at 1 video/day. If today is missed, expected completion dynamically extends by 1 day.`}
        </p>
      </div>

      {/* 3. COMPACT SUBJECT LIST (Warm Card) */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 text-[#1C1917]">
        <div className="flex items-center justify-between pb-1 border-b border-[#E5DDD0]">
          <span className="text-xs sm:text-sm font-bold text-[#78716C] tracking-wider uppercase font-fancy">
            SUBJECTS ({gateStore.subjects.length})
          </span>
          <button
            type="button"
            onClick={() => setIsAddingSubject(true)}
            className="text-xs sm:text-sm text-[#1C1917] font-bold flex items-center gap-1 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {gateStore.subjects.map((subj) => {
            const subjProgress = calculateSubjectProgress(
              subj.id,
              gateStore.modules,
              gateStore.videos
            );

            return (
              <div
                key={subj.id}
                className="group p-3.5 bg-[#F1ECE2] hover:bg-[#E8E1D3] rounded-xl transition-colors border border-[#DDD4C5] text-[#1C1917]"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className="flex-1 cursor-pointer min-w-0 pr-2"
                  >
                    <div className="text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-black transition-colors uppercase truncate">
                      {subj.title}
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Edit Subject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditSubject(subj);
                    }}
                    className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#DDD5C7] transition-colors cursor-pointer shrink-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                <div
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mt-1 text-sm font-mono text-[#57534E]">
                    <span className="font-bold">
                      {subjProgress.completed} / {subjProgress.total}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {subjProgress.percentage}%
                    </span>
                  </div>

                  {/* Progress bar directly underneath the count row */}
                  <div className="w-full bg-[#DDD5C7] h-2 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${subjProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3 font-handwriting text-[#1C1917]">
            <h3 className="text-lg font-bold text-[#1C1917] font-fancy">Add Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
                className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-2 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black cursor-pointer shadow-xs"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modals */}
      {renderEditSubjectModal()}
      {renderEditModuleModal()}
    </div>
  );
};
