import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { GateStoreState } from '../../types/gate';

interface ModuleCompletionModalProps {
  isOpen: boolean;
  completedSubjectName: string;
  completedModuleName: string;
  completedCount: number;
  totalCount: number;
  gateStore: GateStoreState;
  onConfirmNextModule: (nextSubjectId: string, nextModuleId: string) => void;
  onDismiss: () => void;
}

export const ModuleCompletionModal: React.FC<ModuleCompletionModalProps> = ({
  isOpen,
  completedSubjectName,
  completedModuleName,
  completedCount,
  totalCount,
  gateStore,
  onConfirmNextModule,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const { subjects, modules } = gateStore;

  const [chosenSubjectId, setChosenSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );

  const availableModules = modules.filter((m) => m.subjectId === chosenSubjectId);

  const [chosenModuleId, setChosenModuleId] = useState<string>(
    availableModules[0]?.id || ''
  );

  const handleSubjectChange = (newSubjId: string) => {
    setChosenSubjectId(newSubjId);
    const subMods = modules.filter((m) => m.subjectId === newSubjId);
    setChosenModuleId(subMods[0]?.id || '');
  };

  const handleConfirm = () => {
    if (!chosenSubjectId || !chosenModuleId) return;
    onConfirmNextModule(chosenSubjectId, chosenModuleId);
  };

  return (
    <div
      id="module-completion-modal-overlay"
      className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="module-completion-modal-card"
        className="w-full max-w-sm bg-[#FBF8F0] border border-[#D9D1C3] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-handwriting animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Celebration Header matching reference style */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EDE4] text-[#4A6953] text-xs font-bold uppercase tracking-wider border border-[#CFDFD3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MODULE COMPLETED</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#252522] leading-tight">
            {completedSubjectName}
          </h2>
          <p className="text-base text-[#607C68] font-bold">
            {completedModuleName}
          </p>
          <p className="text-sm font-mono text-[#706B61]">
            {completedCount} / {totalCount} videos completed (100%)
          </p>
        </div>

        {/* Selection Form */}
        <div className="p-3.5 rounded-2xl bg-[#F5F0E6] border border-[#D9D1C3] space-y-3">
          <p className="text-sm font-bold text-[#252522] text-center">
            What would you like to study next?
          </p>

          <div>
            <label className="block text-xs font-bold text-[#706B61] mb-1">
              Subject
            </label>
            <select
              id="next-gate-subject-selector"
              value={chosenSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-[#FBF8F0] border border-[#D9D1C3] rounded-xl text-[#252522] focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#706B61] mb-1">
              Module
            </label>
            <select
              id="next-gate-module-selector"
              value={chosenModuleId}
              disabled={availableModules.length === 0}
              onChange={(e) => setChosenModuleId(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-[#FBF8F0] border border-[#D9D1C3] rounded-xl text-[#252522] focus:outline-none disabled:opacity-50"
            >
              {availableModules.length === 0 ? (
                <option value="">No modules in subject</option>
              ) : (
                availableModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Action buttons matching reference */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#706B61] hover:bg-[#EAE2D2] transition-colors"
          >
            Choose Later
          </button>

          <button
            id="confirm-and-save-next-module-btn"
            type="button"
            disabled={!chosenSubjectId || !chosenModuleId}
            onClick={handleConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#B65C52] text-white text-sm font-bold hover:bg-[#A34E44] transition-colors disabled:opacity-50 shadow-2xs"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
