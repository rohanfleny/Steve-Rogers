import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  ArrowRight,
  Video,
} from 'lucide-react';
import {
  GateStoreState,
  GateSubject,
  GateModule,
  GateVideo,
} from '../../types/gate';
import { getNextIncompleteVideo } from '../../logic/gateCalculations';

interface GateActiveConnectionViewProps {
  gateStore: GateStoreState;
  onUpdateStore: (updater: (prev: GateStoreState) => GateStoreState) => void;
  onNavigateToSubjects: () => void;
}

export const GateActiveConnectionView: React.FC<GateActiveConnectionViewProps> = ({
  gateStore,
  onUpdateStore,
  onNavigateToSubjects,
}) => {
  const { subjects, modules, videos, activeConnection } = gateStore;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeConnection.subjectId || (subjects[0]?.id ?? '')
  );

  // Filter modules belonging to currently selected subject
  const availableModules = modules
    .filter((m) => m.subjectId === selectedSubjectId)
    .sort((a, b) => a.order - b.order);

  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    if (
      activeConnection.moduleId &&
      modules.some((m) => m.id === activeConnection.moduleId && m.subjectId === selectedSubjectId)
    ) {
      return activeConnection.moduleId;
    }
    return availableModules[0]?.id ?? '';
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // When subject changes, pick first module in that subject if current selection is invalid
  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    const subModules = modules.filter((m) => m.subjectId === newSubjectId);
    setSelectedModuleId(subModules[0]?.id ?? '');
    setSavedSuccess(false);
  };

  const handleModuleChange = (newModuleId: string) => {
    setSelectedModuleId(newModuleId);
    setSavedSuccess(false);
  };

  const handleSaveConnection = () => {
    onUpdateStore((prev) => ({
      ...prev,
      activeConnection: {
        subjectId: selectedSubjectId || null,
        moduleId: selectedModuleId || null,
      },
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Compute preview for selected module
  const selectedModuleVideos = videos
    .filter((v) => v.moduleId === selectedModuleId)
    .sort((a, b) => a.order - b.order);

  const nextVideo = getNextIncompleteVideo(selectedModuleId, videos);
  const isModuleFullyCompleted =
    selectedModuleVideos.length > 0 && selectedModuleVideos.every((v) => v.completed);

  const currentActiveSubj = subjects.find((s) => s.id === activeConnection.subjectId);
  const currentActiveMod = modules.find((m) => m.id === activeConnection.moduleId);

  return (
    <div id="gate-active-connection-view" className="space-y-4 sm:space-y-6">
      {/* Current Active Connection Status Banner */}
      <div className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-5 shadow-2xs">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
          Current Live Active Connection
        </span>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-base sm:text-lg font-bold text-[#252522] font-serif-heading">
              {currentActiveSubj ? currentActiveSubj.title : 'No active subject'}
              {' → '}
              <span className="text-[#607C68]">
                {currentActiveMod ? currentActiveMod.title : 'No active module'}
              </span>
            </p>
            <p className="text-xs text-[#736B5E] mt-0.5">
              Ticking "GATE — 1 Video" on the Home Dashboard will automatically advance the next lecture in this module.
            </p>
          </div>

          <div className="shrink-0">
            {currentActiveMod && isModuleFullyCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E1EDE4] text-[#4A6953] text-xs font-mono font-semibold border border-[#CFDFD3]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Module 100% Completed</span>
              </span>
            ) : currentActiveMod ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE2D2] text-[#252522] text-xs font-mono font-semibold border border-[#DDD6C8]">
                <Layers className="w-3.5 h-3.5" />
                <span>Connected &amp; Ready</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8EFE9] text-[#B65C52] text-xs font-mono font-semibold border border-[#E7CEBE]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Not Connected</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connection Selection Form */}
      {subjects.length === 0 ? (
        <div className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-8 text-center space-y-3 shadow-2xs">
          <AlertCircle className="w-10 h-10 text-[#B65C52] mx-auto" />
          <h3 className="text-base font-bold text-[#252522] font-serif-heading">No Subjects Available</h3>
          <p className="text-xs sm:text-sm text-[#736B5E] max-w-sm mx-auto">
            You must create at least one subject and module before configuring your active GATE connection.
          </p>
          <button
            type="button"
            onClick={onNavigateToSubjects}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors border border-[#1E1E1C]"
          >
            <span>Create Subjects &amp; Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-5 sm:p-6 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#252522] font-serif-heading">
              Select Active Subject &amp; Module
            </h3>
            <p className="text-xs text-[#736B5E] mt-0.5">
              Changing active connection will never modify or erase your historical progress.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1.5">
                Target Subject
              </label>
              <select
                id="active-subject-select"
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] font-medium text-[#252522]"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1.5">
                Target Module
              </label>
              <select
                id="active-module-select"
                value={selectedModuleId}
                disabled={availableModules.length === 0}
                onChange={(e) => handleModuleChange(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] font-medium text-[#252522] disabled:opacity-50"
              >
                {availableModules.length === 0 ? (
                  <option value="">No modules in this subject</option>
                ) : (
                  availableModules.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Module Video Queue Preview */}
          {selectedModuleId && (
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
                  Module Video Queue Preview
                </span>
                <span className="text-xs text-[#736B5E] font-mono">
                  {selectedModuleVideos.filter((v) => v.completed).length} /{' '}
                  {selectedModuleVideos.length} completed
                </span>
              </div>

              {selectedModuleVideos.length === 0 ? (
                <p className="text-xs text-[#8C8271]">
                  This module has no videos yet. Add videos to start watching.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedModuleVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                        vid.completed
                          ? 'bg-[#F2F6F3] border-[#C8DACD] text-[#4A6953]'
                          : vid.id === nextVideo?.id
                          ? 'bg-[#EAE2D2] border-[#DDD6C8] text-[#252522] font-semibold ring-1 ring-[#8C8271]'
                          : 'bg-[#FCFAF6] border-[#DDD6C8] text-[#5A5347]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[#8C8271] shrink-0">
                          #{vid.order}
                        </span>
                        <span className="truncate">{vid.title}</span>
                      </div>

                      <div className="shrink-0 ml-2">
                        {vid.completed ? (
                          <span className="text-[10px] font-mono font-semibold text-[#4A6953] bg-[#E1EDE4] px-1.5 py-0.5 rounded border border-[#CFDFD3]">
                            ✓ Done
                          </span>
                        ) : vid.id === nextVideo?.id ? (
                          <span className="text-[10px] font-mono font-bold text-[#252522] bg-[#EAE2D2] px-2 py-0.5 rounded-full border border-[#DDD6C8]">
                            ★ Next Lecture
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#8C8271]">Queued</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Message */}
              {isModuleFullyCompleted ? (
                <div className="p-3 rounded-xl bg-[#E1EDE4] border border-[#CFDFD3] text-xs text-[#4A6953] font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4A6953] shrink-0" />
                  <span>
                    Active module completed. Connect your next GATE module.
                  </span>
                </div>
              ) : nextVideo ? (
                <div className="p-3 rounded-xl bg-[#EAE2D2]/70 border border-[#DDD6C8] text-xs text-[#252522] flex items-center justify-between font-mono">
                  <span>
                    Next in line: <strong>Lecture {nextVideo.order} — {nextVideo.title}</strong>
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Confirm & Save Button */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE2D2]">
            {savedSuccess ? (
              <span className="text-xs font-mono font-bold text-[#4A6953] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Connection Updated Successfully!</span>
              </span>
            ) : (
              <span className="text-xs font-mono text-[#8C8271]">
                Confirm your choice to apply across the app.
              </span>
            )}

            <button
              id="confirm-active-connection-btn"
              type="button"
              disabled={!selectedSubjectId || !selectedModuleId}
              onClick={handleSaveConnection}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors disabled:opacity-50 shadow-2xs border border-[#1E1E1C]"
            >
              <Save className="w-4 h-4" />
              <span>Confirm &amp; Save Active Connection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
