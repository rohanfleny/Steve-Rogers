import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Layers,
  Video,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  GateSubject,
  GateModule,
  GateVideo,
  GateStoreState,
} from '../../types/gate';
import {
  calculateModuleProgress,
  calculateSubjectProgress,
  reorderItems,
} from '../../logic/gateCalculations';

interface GateSubjectsViewProps {
  gateStore: GateStoreState;
  onUpdateStore: (updater: (prev: GateStoreState) => GateStoreState) => void;
  onCheckModuleCompletionTrigger: (moduleId: string, updatedVideos: GateVideo[]) => void;
}

export const GateSubjectsView: React.FC<GateSubjectsViewProps> = ({
  gateStore,
  onUpdateStore,
  onCheckModuleCompletionTrigger,
}) => {
  const { subjects, modules, videos } = gateStore;

  // Selected / Expanded state
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    subjects[0]?.id || null
  );
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Subject Modal State
  const [subjectModal, setSubjectModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    subject?: GateSubject;
    title: string;
  }>({ isOpen: false, mode: 'add', title: '' });

  // Module Modal State
  const [moduleModal, setModuleModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    subjectId: string;
    module?: GateModule;
    title: string;
  }>({ isOpen: false, mode: 'add', subjectId: '', title: '' });

  // Video Modal State
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    moduleId: string;
    video?: GateVideo;
    title: string;
  }>({ isOpen: false, mode: 'add', moduleId: '', title: '' });

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'subject' | 'module' | 'video';
    id: string;
    title: string;
    warningText?: string;
  }>({ isOpen: false, type: 'subject', id: '', title: '' });

  // --- Subject Actions ---
  const handleOpenAddSubject = () => {
    setSubjectModal({ isOpen: true, mode: 'add', title: '' });
  };

  const handleOpenEditSubject = (subj: GateSubject) => {
    setSubjectModal({ isOpen: true, mode: 'edit', subject: subj, title: subj.title });
  };

  const handleSaveSubject = () => {
    if (!subjectModal.title.trim()) return;
    const title = subjectModal.title.trim();

    onUpdateStore((prev) => {
      if (subjectModal.mode === 'add') {
        const nextOrder = prev.subjects.length > 0
          ? Math.max(...prev.subjects.map((s) => s.order)) + 1
          : 1;
        const newSubject: GateSubject = {
          id: `subj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title,
          order: nextOrder,
        };
        const updatedSubjects = [...prev.subjects, newSubject];
        setExpandedSubjectId(newSubject.id);
        return { ...prev, subjects: updatedSubjects };
      } else if (subjectModal.subject) {
        const updatedSubjects = prev.subjects.map((s) =>
          s.id === subjectModal.subject!.id ? { ...s, title } : s
        );
        return { ...prev, subjects: updatedSubjects };
      }
      return prev;
    });

    setSubjectModal({ isOpen: false, mode: 'add', title: '' });
  };

  const handlePromptDeleteSubject = (subj: GateSubject) => {
    const subjModules = modules.filter((m) => m.subjectId === subj.id);
    const subjVideos = videos.filter((v) =>
      subjModules.some((m) => m.id === v.moduleId)
    );
    let warningText = '';
    if (subjModules.length > 0 || subjVideos.length > 0) {
      warningText = `This subject contains ${subjModules.length} module(s) and ${subjVideos.length} video(s). Deleting it will permanently remove all associated modules and videos.`;
    }
    setDeleteConfirm({
      isOpen: true,
      type: 'subject',
      id: subj.id,
      title: subj.title,
      warningText,
    });
  };

  const handleReorderSubject = (id: string, direction: 'up' | 'down') => {
    onUpdateStore((prev) => ({
      ...prev,
      subjects: reorderItems(prev.subjects, id, direction),
    }));
  };

  // --- Module Actions ---
  const handleOpenAddModule = (subjectId: string) => {
    setModuleModal({ isOpen: true, mode: 'add', subjectId, title: '' });
  };

  const handleOpenEditModule = (mod: GateModule) => {
    setModuleModal({
      isOpen: true,
      mode: 'edit',
      subjectId: mod.subjectId,
      module: mod,
      title: mod.title,
    });
  };

  const handleSaveModule = () => {
    if (!moduleModal.title.trim()) return;
    const title = moduleModal.title.trim();

    onUpdateStore((prev) => {
      if (moduleModal.mode === 'add') {
        const existingInSubj = prev.modules.filter((m) => m.subjectId === moduleModal.subjectId);
        const nextOrder = existingInSubj.length > 0
          ? Math.max(...existingInSubj.map((m) => m.order)) + 1
          : 1;
        const newModule: GateModule = {
          id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          subjectId: moduleModal.subjectId,
          title,
          order: nextOrder,
          revisionCompleted: false,
          pyqCompleted: false,
        };
        const updated = [...prev.modules, newModule];
        setExpandedModuleId(newModule.id);
        return { ...prev, modules: updated };
      } else if (moduleModal.module) {
        const updated = prev.modules.map((m) =>
          m.id === moduleModal.module!.id ? { ...m, title } : m
        );
        return { ...prev, modules: updated };
      }
      return prev;
    });

    setModuleModal({ isOpen: false, mode: 'add', subjectId: '', title: '' });
  };

  const handlePromptDeleteModule = (mod: GateModule) => {
    const modVideos = videos.filter((v) => v.moduleId === mod.id);
    let warningText = '';
    if (modVideos.length > 0) {
      warningText = `This module contains ${modVideos.length} video(s). Deleting it will permanently remove all its videos and progress.`;
    }
    setDeleteConfirm({
      isOpen: true,
      type: 'module',
      id: mod.id,
      title: mod.title,
      warningText,
    });
  };

  const handleReorderModule = (id: string, direction: 'up' | 'down') => {
    onUpdateStore((prev) => {
      const targetMod = prev.modules.find((m) => m.id === id);
      if (!targetMod) return prev;
      const subjModules = prev.modules.filter((m) => m.subjectId === targetMod.subjectId);
      const reordered = reorderItems(subjModules, id, direction);
      const reorderedMap = new Map(reordered.map((m) => [m.id, m]));
      const nextModules = prev.modules.map((m) => reorderedMap.get(m.id) || m);
      return { ...prev, modules: nextModules };
    });
  };

  const handleToggleRevision = (modId: string) => {
    onUpdateStore((prev) => {
      const updated = prev.modules.map((m) => {
        if (m.id === modId) {
          const nextVal = !m.revisionCompleted;
          return {
            ...m,
            revisionCompleted: nextVal,
            revisionCompletedAt: nextVal ? new Date().toISOString() : undefined,
          };
        }
        return m;
      });
      return { ...prev, modules: updated };
    });
  };

  const handleTogglePYQ = (modId: string) => {
    onUpdateStore((prev) => {
      const updated = prev.modules.map((m) => {
        if (m.id === modId) {
          const nextVal = !m.pyqCompleted;
          return {
            ...m,
            pyqCompleted: nextVal,
            pyqCompletedAt: nextVal ? new Date().toISOString() : undefined,
          };
        }
        return m;
      });
      return { ...prev, modules: updated };
    });
  };

  // --- Video Actions ---
  const handleOpenAddVideo = (moduleId: string) => {
    setVideoModal({ isOpen: true, mode: 'add', moduleId, title: '' });
  };

  const handleOpenEditVideo = (vid: GateVideo) => {
    setVideoModal({
      isOpen: true,
      mode: 'edit',
      moduleId: vid.moduleId,
      video: vid,
      title: vid.title,
    });
  };

  const handleSaveVideo = () => {
    if (!videoModal.title.trim()) return;
    const title = videoModal.title.trim();

    onUpdateStore((prev) => {
      if (videoModal.mode === 'add') {
        const existing = prev.videos.filter((v) => v.moduleId === videoModal.moduleId);
        const nextOrder = existing.length > 0
          ? Math.max(...existing.map((v) => v.order)) + 1
          : 1;
        const newVideo: GateVideo = {
          id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          moduleId: videoModal.moduleId,
          title,
          order: nextOrder,
          completed: false,
        };
        return { ...prev, videos: [...prev.videos, newVideo] };
      } else if (videoModal.video) {
        const updated = prev.videos.map((v) =>
          v.id === videoModal.video!.id ? { ...v, title } : v
        );
        return { ...prev, videos: updated };
      }
      return prev;
    });

    setVideoModal({ isOpen: false, mode: 'add', moduleId: '', title: '' });
  };

  const handlePromptDeleteVideo = (vid: GateVideo) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'video',
      id: vid.id,
      title: `Video ${vid.order}: ${vid.title}`,
      warningText: vid.completed ? 'This video is currently marked as completed.' : undefined,
    });
  };

  const handleToggleVideo = (vidId: string) => {
    let affectedModuleId = '';
    let updatedVideosList: GateVideo[] = [];

    onUpdateStore((prev) => {
      const targetVid = prev.videos.find((v) => v.id === vidId);
      if (!targetVid) return prev;
      affectedModuleId = targetVid.moduleId;

      const nextCompleted = !targetVid.completed;
      const updated = prev.videos.map((v) => {
        if (v.id === vidId) {
          return {
            ...v,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return v;
      });

      updatedVideosList = updated;
      return { ...prev, videos: updated };
    });

    // Check if module completion flow should trigger
    if (affectedModuleId && updatedVideosList.length > 0) {
      onCheckModuleCompletionTrigger(affectedModuleId, updatedVideosList);
    }
  };

  const handleReorderVideo = (id: string, direction: 'up' | 'down') => {
    onUpdateStore((prev) => {
      const targetVid = prev.videos.find((v) => v.id === id);
      if (!targetVid) return prev;
      const modVideos = prev.videos.filter((v) => v.moduleId === targetVid.moduleId);
      const reordered = reorderItems(modVideos, id, direction);
      const reorderedMap = new Map(reordered.map((v) => [v.id, v]));
      const nextVideos = prev.videos.map((v) => reorderedMap.get(v.id) || v);
      return { ...prev, videos: nextVideos };
    });
  };

  // --- Confirm Deletion Execution ---
  const handleExecuteDelete = () => {
    const { type, id } = deleteConfirm;

    onUpdateStore((prev) => {
      if (type === 'subject') {
        const remainingSubjects = prev.subjects.filter((s) => s.id !== id);
        const subjModuleIds = new Set(
          prev.modules.filter((m) => m.subjectId === id).map((m) => m.id)
        );
        const remainingModules = prev.modules.filter((m) => m.subjectId !== id);
        const remainingVideos = prev.videos.filter((v) => !subjModuleIds.has(v.moduleId));
        const nextConn = prev.activeConnection.subjectId === id
          ? { subjectId: null, moduleId: null }
          : prev.activeConnection;

        return {
          ...prev,
          subjects: remainingSubjects,
          modules: remainingModules,
          videos: remainingVideos,
          activeConnection: nextConn,
        };
      } else if (type === 'module') {
        const remainingModules = prev.modules.filter((m) => m.id !== id);
        const remainingVideos = prev.videos.filter((v) => v.moduleId !== id);
        const nextConn = prev.activeConnection.moduleId === id
          ? { ...prev.activeConnection, moduleId: null }
          : prev.activeConnection;

        return {
          ...prev,
          modules: remainingModules,
          videos: remainingVideos,
          activeConnection: nextConn,
        };
      } else if (type === 'video') {
        const remainingVideos = prev.videos.filter((v) => v.id !== id);
        return { ...prev, videos: remainingVideos };
      }
      return prev;
    });

    setDeleteConfirm({ isOpen: false, type: 'subject', id: '', title: '' });
  };

  const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

  return (
    <div id="gate-subjects-container" className="space-y-4">
      {/* Top action: Add Subject */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#252522] font-serif-heading">
            Curriculum Hierarchy
          </h2>
          <p className="text-xs text-[#736B5E]">
            Subject → Module → Lecture hierarchy with dynamic syllabus calculation
          </p>
        </div>

        <button
          id="add-new-subject-btn"
          type="button"
          onClick={handleOpenAddSubject}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors shadow-2xs border border-[#1E1E1C]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {sortedSubjects.length === 0 ? (
        <div className="p-8 text-center bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] shadow-2xs space-y-2">
          <BookOpen className="w-10 h-10 text-[#DDD6C8] mx-auto" />
          <p className="text-sm font-semibold text-[#5A5347]">No subjects created yet</p>
          <p className="text-xs text-[#8C8271]">
            Click "Add Subject" above to register your first GATE subject.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSubjects.map((subject, sIdx) => {
            const isExpanded = expandedSubjectId === subject.id;
            const subjectModules = modules
              .filter((m) => m.subjectId === subject.id)
              .sort((a, b) => a.order - b.order);
            const subjProgress = calculateSubjectProgress(subject.id, modules, videos);

            return (
              <div
                key={subject.id}
                id={`subject-card-${subject.id}`}
                className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs transition-all"
              >
                {/* Subject Header */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5EFE4]/40"
                  onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAE2D2] text-[#252522] flex items-center justify-center shrink-0 font-bold font-mono text-sm border border-[#DDD6C8]">
                      {sIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#252522] truncate font-serif-heading">
                          {subject.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAE2D2] text-[#5A5347] font-semibold font-mono border border-[#DDD6C8]">
                          {subjProgress.completed}/{subjProgress.total} vids • {subjProgress.percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[#736B5E] mt-0.5">
                        {subjectModules.length} module(s) configured
                      </p>
                    </div>
                  </div>

                  {/* Subject Controls */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleReorderSubject(subject.id, 'up')}
                      className="p-1 rounded text-[#8C8271] hover:text-[#252522] disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={sIdx === sortedSubjects.length - 1}
                      onClick={() => handleReorderSubject(subject.id, 'down')}
                      className="p-1 rounded text-[#8C8271] hover:text-[#252522] disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(subject)}
                      className="p-1.5 rounded-lg text-[#736B5E] hover:text-[#252522] hover:bg-[#EAE2D2]"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptDeleteSubject(subject)}
                      className="p-1.5 rounded-lg text-[#8C8271] hover:text-[#B65C52] hover:bg-[#F8EFE9]"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-4 bg-[#DDD6C8] mx-1" />

                    <button
                      type="button"
                      onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                      className="p-1.5 rounded-lg text-[#736B5E] hover:bg-[#EAE2D2]"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Modules Container */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#EAE2D2] space-y-3 bg-[#FAF7F0]/60">
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
                        Modules for {subject.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModule(subject.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#252522] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Module</span>
                      </button>
                    </div>

                    {subjectModules.length === 0 ? (
                      <div className="p-4 text-center rounded-xl border border-dashed border-[#DDD6C8] bg-[#FCFAF6] text-xs text-[#736B5E]">
                        No modules in this subject. Click "Add Module" to create one.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {subjectModules.map((module, mIdx) => {
                          const isModExpanded = expandedModuleId === module.id;
                          const modVideos = videos
                            .filter((v) => v.moduleId === module.id)
                            .sort((a, b) => a.order - b.order);
                          const modProgress = calculateModuleProgress(module.id, videos);

                          return (
                            <div
                              key={module.id}
                              id={`module-card-${module.id}`}
                              className="bg-[#FCFAF6] rounded-xl border border-[#DDD6C8] p-3 sm:p-4 space-y-3"
                            >
                              {/* Module Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div
                                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                                  onClick={() =>
                                    setExpandedModuleId(isModExpanded ? null : module.id)
                                  }
                                >
                                  <Layers className="w-4 h-4 text-[#736B5E] shrink-0" />
                                  <span className="text-sm font-bold text-[#252522] truncate font-serif-heading">
                                    {module.title}
                                  </span>
                                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EAE2D2] text-[#5A5347] border border-[#DDD6C8]">
                                    {modProgress.completed}/{modProgress.total} • {modProgress.percentage}%
                                  </span>
                                </div>

                                {/* Module Controls: Reorder, Edit, Delete */}
                                <div className="flex items-center gap-1 self-end sm:self-center">
                                  <button
                                    type="button"
                                    disabled={mIdx === 0}
                                    onClick={() => handleReorderModule(module.id, 'up')}
                                    className="p-1 rounded text-[#8C8271] hover:text-[#252522] disabled:opacity-30"
                                    title="Move module up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={mIdx === subjectModules.length - 1}
                                    onClick={() => handleReorderModule(module.id, 'down')}
                                    className="p-1 rounded text-[#8C8271] hover:text-[#252522] disabled:opacity-30"
                                    title="Move module down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModule(module)}
                                    className="p-1 rounded text-[#8C8271] hover:text-[#252522]"
                                    title="Edit module"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePromptDeleteModule(module)}
                                    className="p-1 rounded text-[#8C8271] hover:text-[#B65C52]"
                                    title="Delete module"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Independent Module Tracking: Revision & PYQ Checkboxes */}
                              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EAE2D2] text-xs">
                                {/* Revision Status */}
                                <label
                                  id={`revision-toggle-${module.id}`}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-colors font-mono ${
                                    module.revisionCompleted
                                      ? 'bg-[#E1EDE4] border-[#CFDFD3] text-[#4A6953] font-semibold'
                                      : 'bg-[#FAF7F0] border-[#DDD6C8] text-[#736B5E] hover:bg-[#EAE2D2]'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={module.revisionCompleted}
                                    onChange={() => handleToggleRevision(module.id)}
                                    className="rounded text-[#4A6953] focus:ring-[#607C68]"
                                  />
                                  <span>Revision</span>
                                  {module.revisionCompleted && (
                                    <Check className="w-3 h-3 text-[#4A6953] stroke-[3]" />
                                  )}
                                </label>

                                {/* PYQ Status */}
                                <label
                                  id={`pyq-toggle-${module.id}`}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-colors font-mono ${
                                    module.pyqCompleted
                                      ? 'bg-[#EAE2D2] border-[#DDD6C8] text-[#252522] font-semibold'
                                      : 'bg-[#FAF7F0] border-[#DDD6C8] text-[#736B5E] hover:bg-[#EAE2D2]'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={module.pyqCompleted}
                                    onChange={() => handleTogglePYQ(module.id)}
                                    className="rounded text-[#252522] focus:ring-[#8C8271]"
                                  />
                                  <span>PYQ Completed</span>
                                  {module.pyqCompleted && (
                                    <Check className="w-3 h-3 text-[#252522] stroke-[3]" />
                                  )}
                                </label>

                                <span className="text-[11px] font-mono text-[#8C8271] italic ml-auto">
                                  Revision &amp; PYQ do not affect video counts
                                </span>
                              </div>

                              {/* Videos Section Button & List */}
                              <div className="pt-2 border-t border-[#EAE2D2]">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedModuleId(isModExpanded ? null : module.id)
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A5347] hover:text-[#252522]"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>
                                      {modVideos.length} Lecture(s) •{' '}
                                      {isModExpanded ? 'Hide' : 'Manage / View'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddVideo(module.id)}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#252522] hover:underline"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Video</span>
                                  </button>
                                </div>

                                {isModExpanded && (
                                  <div className="mt-3 space-y-1.5 pl-2 sm:pl-4 border-l-2 border-[#DDD6C8]">
                                    {modVideos.length === 0 ? (
                                      <p className="text-xs text-[#8C8271] py-2">
                                        No lectures in this module. Click "Add Video" above.
                                      </p>
                                    ) : (
                                      modVideos.map((video, vIdx) => (
                                        <div
                                          key={video.id}
                                          id={`video-row-${video.id}`}
                                          className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-colors ${
                                            video.completed
                                              ? 'bg-[#F2F6F3] border-[#C8DACD] text-[#4A6953]'
                                              : 'bg-[#FAF7F0] border-[#DDD6C8] text-[#252522]'
                                          }`}
                                        >
                                          {/* Checkbox & Title */}
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleVideo(video.id)}
                                              className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                                                video.completed
                                                  ? 'bg-[#607C68] border-[#4E6755] text-white shadow-2xs'
                                                  : 'border-[#DDD6C8] hover:border-[#8C8271] bg-[#FCFAF6]'
                                              }`}
                                            >
                                              {video.completed && (
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                              )}
                                            </button>

                                            <span className="font-mono text-[11px] text-[#8C8271]">
                                              #{video.order}
                                            </span>
                                            <span
                                              className={`truncate font-medium ${
                                                video.completed ? 'line-through text-[#736B5E]' : ''
                                              }`}
                                            >
                                              {video.title}
                                            </span>
                                            {video.completed && (
                                              <span className="hidden sm:inline-block text-[10px] text-[#4A6953] font-mono font-semibold px-1.5 py-0.2 bg-[#E1EDE4] rounded border border-[#CFDFD3]">
                                                Done
                                              </span>
                                            )}
                                          </div>

                                          {/* Video Controls */}
                                          <div className="flex items-center gap-0.5 shrink-0 ml-2">
                                            <button
                                              type="button"
                                              disabled={vIdx === 0}
                                              onClick={() => handleReorderVideo(video.id, 'up')}
                                              className="p-1 text-[#8C8271] hover:text-[#252522] disabled:opacity-25"
                                              title="Move video up"
                                            >
                                              <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              disabled={vIdx === modVideos.length - 1}
                                              onClick={() => handleReorderVideo(video.id, 'down')}
                                              className="p-1 text-[#8C8271] hover:text-[#252522] disabled:opacity-25"
                                              title="Move video down"
                                            >
                                              <ChevronDown className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditVideo(video)}
                                              className="p-1 text-[#8C8271] hover:text-[#252522]"
                                              title="Edit video"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handlePromptDeleteVideo(video)}
                                              className="p-1 text-[#8C8271] hover:text-[#B65C52]"
                                              title="Delete video"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Subject Modal --- */}
      {subjectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FCFAF6] rounded-2xl p-5 shadow-xl border border-[#DDD6C8] space-y-4">
            <h3 className="text-base font-bold text-[#252522] font-serif-heading">
              {subjectModal.mode === 'add' ? 'Add Subject' : 'Edit Subject'}
            </h3>
            <div>
              <label className="block text-xs font-mono font-semibold text-[#736B5E] mb-1">
                Subject Title
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Engineering Mathematics"
                value={subjectModal.title}
                onChange={(e) =>
                  setSubjectModal({ ...subjectModal, title: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSubject()}
                className="w-full text-sm px-3 py-2 border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectModal({ ...subjectModal, isOpen: false })}
                className="px-3 py-1.5 text-xs font-semibold text-[#736B5E] hover:bg-[#EAE2D2] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubject}
                disabled={!subjectModal.title.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[#252522] text-[#FAF7F0] rounded-lg hover:bg-[#3D3A34] disabled:opacity-50 border border-[#1E1E1C]"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Module Modal --- */}
      {moduleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FCFAF6] rounded-2xl p-5 shadow-xl border border-[#DDD6C8] space-y-4">
            <h3 className="text-base font-bold text-[#252522] font-serif-heading">
              {moduleModal.mode === 'add' ? 'Add Module' : 'Edit Module'}
            </h3>
            <div>
              <label className="block text-xs font-mono font-semibold text-[#736B5E] mb-1">
                Module Title
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Linear Algebra"
                value={moduleModal.title}
                onChange={(e) =>
                  setModuleModal({ ...moduleModal, title: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSaveModule()}
                className="w-full text-sm px-3 py-2 border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModuleModal({ ...moduleModal, isOpen: false })}
                className="px-3 py-1.5 text-xs font-semibold text-[#736B5E] hover:bg-[#EAE2D2] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModule}
                disabled={!moduleModal.title.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[#252522] text-[#FAF7F0] rounded-lg hover:bg-[#3D3A34] disabled:opacity-50 border border-[#1E1E1C]"
              >
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Video Modal --- */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FCFAF6] rounded-2xl p-5 shadow-xl border border-[#DDD6C8] space-y-4">
            <h3 className="text-base font-bold text-[#252522] font-serif-heading">
              {videoModal.mode === 'add' ? 'Add Video' : 'Edit Video'}
            </h3>
            <div>
              <label className="block text-xs font-mono font-semibold text-[#736B5E] mb-1">
                Lecture Title
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Matrices & Determinants"
                value={videoModal.title}
                onChange={(e) =>
                  setVideoModal({ ...videoModal, title: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSaveVideo()}
                className="w-full text-sm px-3 py-2 border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
                className="px-3 py-1.5 text-xs font-semibold text-[#736B5E] hover:bg-[#EAE2D2] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVideo}
                disabled={!videoModal.title.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[#252522] text-[#FAF7F0] rounded-lg hover:bg-[#3D3A34] disabled:opacity-50 border border-[#1E1E1C]"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FCFAF6] rounded-2xl p-6 shadow-xl border border-[#DDD6C8] space-y-4">
            <div className="flex items-center gap-3 text-[#B65C52]">
              <div className="w-10 h-10 rounded-xl bg-[#F8EFE9] flex items-center justify-center border border-[#E7CEBE]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#252522] font-serif-heading">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#736B5E]">
              Are you sure you want to delete{' '}
              <strong className="text-[#252522]">{deleteConfirm.title}</strong>?
            </p>

            {deleteConfirm.warningText && (
              <div className="p-3 rounded-xl bg-[#F8EFE9] border border-[#E7CEBE] text-xs text-[#B65C52] font-medium font-mono">
                {deleteConfirm.warningText}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ isOpen: false, type: 'subject', id: '', title: '' })
                }
                className="px-4 py-2 text-xs font-semibold text-[#736B5E] hover:bg-[#EAE2D2] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-semibold bg-[#B65C52] text-white hover:bg-[#9E4A40] rounded-xl shadow-2xs border border-[#9E4A40]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
