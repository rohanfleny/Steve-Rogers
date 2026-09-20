import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Calendar, Target } from 'lucide-react';
import { GateStoreState } from '../../types/gate';

interface GateSettingsViewProps {
  gateStore: GateStoreState;
  onUpdateStore: (updater: (prev: GateStoreState) => GateStoreState) => void;
}

export const GateSettingsView: React.FC<GateSettingsViewProps> = ({
  gateStore,
  onUpdateStore,
}) => {
  const { projectionSettings, subjects, modules, activeConnection } = gateStore;

  const [dailyTarget, setDailyTarget] = useState<number>(
    projectionSettings.dailyVideoTarget || 1
  );
  const [startDate, setStartDate] = useState<string>(
    projectionSettings.startDate || new Date().toISOString().slice(0, 10)
  );
  const [originalTargetDate, setOriginalTargetDate] = useState<string>(
    projectionSettings.originalTargetDate || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeConnection.subjectId || ''
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    activeConnection.moduleId || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableModules = modules.filter((m) => m.subjectId === selectedSubjectId);

  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    const subMods = modules.filter((m) => m.subjectId === newSubjectId);
    setSelectedModuleId(subMods[0]?.id || '');
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore((prev) => ({
      ...prev,
      projectionSettings: {
        dailyVideoTarget: Math.max(1, Number(dailyTarget) || 1),
        startDate: startDate || new Date().toISOString().slice(0, 10),
        originalTargetDate: originalTargetDate || '',
      },
      activeConnection: {
        subjectId: selectedSubjectId || null,
        moduleId: selectedModuleId || null,
      },
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="gate-settings-view" className="space-y-5">
      <div className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAE2D2]">
          <div className="w-8 h-8 rounded-lg bg-[#EAE2D2] text-[#252522] flex items-center justify-center border border-[#DDD6C8]">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#252522] font-serif-heading">
              GATE Preparation Parameters
            </h3>
            <p className="text-xs text-[#736B5E]">
              Configure targets and baseline dates for realistic velocity projections
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Daily Video Target */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1">
              Daily Lecture Target (Videos / Day)
            </label>
            <input
              id="gate-daily-target-input"
              type="number"
              min={1}
              max={20}
              value={dailyTarget}
              onChange={(e) => {
                setDailyTarget(Math.max(1, parseInt(e.target.value) || 1));
                setSavedSuccess(false);
              }}
              className="w-full sm:w-48 text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] font-mono text-[#252522]"
            />
            <p className="text-[11px] font-mono text-[#8C8271] mt-1">
              Default is 1 video/day. Used in pace and trajectory calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE2D2]">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1">
                GATE Preparation Start Date
              </label>
              <input
                id="gate-start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSavedSuccess(false);
                }}
                className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] font-mono text-[#252522]"
              />
              <p className="text-[11px] font-mono text-[#8C8271] mt-1">
                The date you began your GATE preparation schedule.
              </p>
            </div>

            {/* Original Target Date */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1">
                Original Target Completion Date
              </label>
              <input
                id="gate-original-target-date-input"
                type="date"
                value={originalTargetDate}
                onChange={(e) => {
                  setOriginalTargetDate(e.target.value);
                  setSavedSuccess(false);
                }}
                className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] font-mono text-[#252522]"
              />
              <p className="text-[11px] font-mono text-[#8C8271] mt-1">
                Your target deadline. Stays fixed unless you change it.
              </p>
            </div>
          </div>

          {/* Active Connection In Settings */}
          <div className="pt-2 border-t border-[#EAE2D2]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E] mb-3">
              Active Connection Shortcut
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1">
                  Active Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] text-[#252522]"
                >
                  <option value="">-- None Selected --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#736B5E] mb-1">
                  Active Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(e.target.value);
                    setSavedSuccess(false);
                  }}
                  disabled={availableModules.length === 0}
                  className="w-full text-sm px-3.5 py-2.5 bg-[#FAF7F0] border border-[#DDD6C8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E] text-[#252522] disabled:opacity-50"
                >
                  <option value="">-- None Selected --</option>
                  {availableModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE2D2]">
            {savedSuccess ? (
              <span className="text-xs font-mono font-bold text-[#4A6953] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved!</span>
              </span>
            ) : (
              <span className="text-xs font-mono text-[#8C8271]">
                Changes will take effect across projections immediately.
              </span>
            )}

            <button
              id="save-gate-settings-btn"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors shadow-2xs border border-[#1E1E1C]"
            >
              <Save className="w-4 h-4" />
              <span>Save Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
