import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { GateStoreState } from '../../types/gate';

interface CompletedModuleAlertModalProps {
  isOpen: boolean;
  gateStore: GateStoreState;
  onChooseNewConnection: (subjectId: string, moduleId: string) => void;
  onClose: () => void;
}

export const CompletedModuleAlertModal: React.FC<CompletedModuleAlertModalProps> = ({
  isOpen,
  gateStore,
  onChooseNewConnection,
  onClose,
}) => {
  const { subjects, modules, videos } = gateStore;
  const [chosenSubjectId, setChosenSubjectId] = useState<string>(subjects[0]?.id || '');
  const availableModules = modules.filter((m) => m.subjectId === chosenSubjectId);
  const [chosenModuleId, setChosenModuleId] = useState<string>(availableModules[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubjectChange = (newSubjId: string) => {
    setChosenSubjectId(newSubjId);
    const subMods = modules.filter((m) => m.subjectId === newSubjId);
    setChosenModuleId(subMods[0]?.id || '');
    setErrorMsg(null);
  };

  const handleModuleChange = (newModId: string) => {
    setChosenModuleId(newModId);
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (!chosenSubjectId || !chosenModuleId) {
      setErrorMsg('Please select both a Subject and a Module.');
      return;
    }

    const modVideos = videos.filter((v) => v.moduleId === chosenModuleId);
    const incompleteCount = modVideos.filter((v) => !v.completed).length;

    if (modVideos.length > 0 && incompleteCount === 0) {
      setErrorMsg('This module is also already completed. Choose another GATE module.');
      return;
    }

    onChooseNewConnection(chosenSubjectId, chosenModuleId);
  };

  return (
    <div
      id="completed-module-alert-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        id="completed-module-alert-card"
        className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-handwriting animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-zinc-900 leading-tight">
            Module Completed
          </h3>
          <p className="text-sm text-zinc-600">
            This module is already completed.
            <br />
            Choose another GATE module.
          </p>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold text-center">
            {errorMsg}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">
              Subject
            </label>
            <select
              value={chosenSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">
              Module
            </label>
            <select
              value={chosenModuleId}
              disabled={availableModules.length === 0}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none disabled:opacity-50"
            >
              {availableModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Save Connection
          </button>
        </div>
      </div>
    </div>
  );
};
