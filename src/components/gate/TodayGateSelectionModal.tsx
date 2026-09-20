import React, { useState, useEffect } from 'react';
import { GateStoreState } from '../../types/gate';

interface TodayGateSelectionModalProps {
  isOpen: boolean;
  gateStore: GateStoreState;
  onConfirm: (subjectId: string, moduleId: string) => void;
  onCancel: () => void;
}

export const TodayGateSelectionModal: React.FC<TodayGateSelectionModalProps> = ({
  isOpen,
  gateStore,
  onConfirm,
  onCancel,
}) => {
  const { subjects, modules } = gateStore;

  const [selectedSubjId, setSelectedSubjId] = useState<string>(
    gateStore.activeConnection.subjectId || subjects[0]?.id || ''
  );

  const availableModules = modules.filter((m) => m.subjectId === selectedSubjId);

  const [selectedModId, setSelectedModId] = useState<string>(
    gateStore.activeConnection.moduleId || availableModules[0]?.id || ''
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeSubj = gateStore.activeConnection.subjectId || subjects[0]?.id || '';
      setSelectedSubjId(activeSubj);
      const subMods = modules.filter((m) => m.subjectId === activeSubj);
      const activeMod = gateStore.activeConnection.moduleId;
      const modExists = subMods.some((m) => m.id === activeMod);
      setSelectedModId(modExists && activeMod ? activeMod : subMods[0]?.id || '');
    }
  }, [isOpen, gateStore.activeConnection, subjects, modules]);

  if (!isOpen) return null;

  const handleSubjectChange = (newSubjId: string) => {
    setSelectedSubjId(newSubjId);
    const subMods = modules.filter((m) => m.subjectId === newSubjId);
    setSelectedModId(subMods[0]?.id || '');
  };

  const handleModuleChange = (newModId: string) => {
    setSelectedModId(newModId);
  };

  const handleOk = () => {
    if (!selectedSubjId || !selectedModId) return;
    onConfirm(selectedSubjId, selectedModId);
  };

  return (
    <div
      id="today-gate-selection-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="today-gate-selection-card"
        className="w-full max-w-sm bg-[#161622] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-handwriting text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-wide uppercase">
            Select Subject & Module
          </h2>
          <p className="text-sm text-zinc-400">
            Choose what you are studying for GATE:
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">
              Subject
            </label>
            <select
              id="today-gate-subj-dropdown"
              value={selectedSubjId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-base px-3 py-2 bg-[#1F1F2C] border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1F1F2C] text-zinc-100">
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">
              Module
            </label>
            <select
              id="today-gate-mod-dropdown"
              value={selectedModId}
              disabled={availableModules.length === 0}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="w-full text-base px-3 py-2 bg-[#1F1F2C] border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
            >
              {availableModules.length === 0 ? (
                <option value="" className="bg-[#1F1F2C] text-zinc-400">No modules in this subject</option>
              ) : (
                availableModules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1F1F2C] text-zinc-100">
                    {m.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
          <button
            type="button"
            id="today-gate-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="today-gate-ok-btn"
            onClick={handleOk}
            className="px-6 py-2 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
