import React, { useState, useEffect } from 'react';
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
  Palette,
} from 'lucide-react';
import { UserSettings } from '../../types/daily';
import { GateStoreState } from '../../types/gate';

interface SettingsGoalsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onExportJSON: () => string;
  onImportJSON: (jsonString: string) => { success: boolean; error?: string; message?: string };
  onResetAllData: () => void;
  gateStore?: GateStoreState;
  onUpdateActiveGateModule?: (subjectId: string, moduleId: string) => void;
}

export const SettingsGoalsView: React.FC<SettingsGoalsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportJSON,
  onImportJSON,
  onResetAllData,
  gateStore,
  onUpdateActiveGateModule,
}) => {
  const [sleepTarget, setSleepTarget] = useState(settings.sleepTargetHours);
  const [name, setName] = useState(settings.name || 'Rohan');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const initialSubj = gateStore?.activeConnection?.subjectId || gateStore?.subjects[0]?.id || '';
  const [activeSubjId, setActiveSubjId] = useState<string>(initialSubj);

  const availableMods = gateStore?.modules.filter((m) => m.subjectId === activeSubjId) || [];
  const initialMod = gateStore?.activeConnection?.moduleId || availableMods[0]?.id || '';
  const [activeModId, setActiveModId] = useState<string>(initialMod);

  useEffect(() => {
    if (gateStore?.activeConnection?.subjectId) {
      setActiveSubjId(gateStore.activeConnection.subjectId);
    }
    if (gateStore?.activeConnection?.moduleId) {
      setActiveModId(gateStore.activeConnection.moduleId);
    }
  }, [gateStore?.activeConnection]);

  const handleSubjChange = (newSubj: string) => {
    setActiveSubjId(newSubj);
    const mods = gateStore?.modules.filter((m) => m.subjectId === newSubj) || [];
    const newMod = mods[0]?.id || '';
    setActiveModId(newMod);
    if (onUpdateActiveGateModule && newMod) {
      onUpdateActiveGateModule(newSubj, newMod);
    }
  };

  const handleModChange = (newMod: string) => {
    setActiveModId(newMod);
    if (onUpdateActiveGateModule && activeSubjId) {
      onUpdateActiveGateModule(activeSubjId, newMod);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      sleepTargetHours: sleepTarget,
      name,
    });
    if (onUpdateActiveGateModule && activeSubjId && activeModId) {
      onUpdateActiveGateModule(activeSubjId, activeModId);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    const json = onExportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_journal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const res = onImportJSON(text);
      setImportStatus(res.success ? 'Data successfully restored!' : (res.error || 'Failed to restore data'));
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-goals-view" className="space-y-4 font-handwriting text-[#1C1917]">
      {/* User Name & Profile */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3 text-[#1C1917]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
          Personal Profile
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-[#78716C] w-20 shrink-0">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rohan"
            className="w-full bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl px-3 py-1.5 text-base text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>
      </div>

      {/* Daily Goals List */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3 text-[#1C1917]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
          Daily Goals
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-[#E5DDD0]">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-[#1C1917]" />
              <span className="font-bold text-[#1C1917]">GATE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716C]">1 video / day</span>
              <Pencil className="w-3.5 h-3.5 text-[#A8A29E]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E5DDD0]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#1C1917]" />
              <span className="font-bold text-[#1C1917]">Academics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716C]">1 video / day</span>
              <Pencil className="w-3.5 h-3.5 text-[#A8A29E]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E5DDD0]">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-4 h-4 text-[#1C1917]" />
              <span className="font-bold text-[#1C1917]">Exercise</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716C]">30 minutes / day</span>
              <Pencil className="w-3.5 h-3.5 text-[#A8A29E]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E5DDD0]">
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-[#1C1917]" />
              <span className="font-bold text-[#1C1917]">Project / Skill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716C]">1 hour / day</span>
              <Pencil className="w-3.5 h-3.5 text-[#A8A29E]" />
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#1C1917]" />
              <span className="font-bold text-[#1C1917]">English Fluency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716C]">30 minutes / day</span>
              <Pencil className="w-3.5 h-3.5 text-[#A8A29E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Current Active GATE Subject & Module Configuration */}
      {gateStore && (
        <div id="settings-gate-active-config" className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3 text-[#1C1917]">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
              Active GATE Subject & Module
            </h3>
            <GraduationCap className="w-5 h-5 text-[#78716C]" />
          </div>
          <p className="text-xs text-[#78716C]">
            Set or change the current subject and module tracked when ticking the daily GATE video:
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Current Subject
              </label>
              <select
                id="settings-gate-subj-dropdown"
                value={activeSubjId}
                onChange={(e) => handleSubjChange(e.target.value)}
                className="w-full text-base px-3 py-2 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              >
                {gateStore.subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#FAF7F0] text-[#1C1917]">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#78716C] mb-1">
                Current Module
              </label>
              <select
                id="settings-gate-mod-dropdown"
                value={activeModId}
                disabled={availableMods.length === 0}
                onChange={(e) => handleModChange(e.target.value)}
                className="w-full text-base px-3 py-2 bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:opacity-50"
              >
                {availableMods.length === 0 ? (
                  <option value="" className="bg-[#FAF7F0] text-[#78716C]">No modules in this subject</option>
                ) : (
                  availableMods.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#FAF7F0] text-[#1C1917]">
                      {m.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Goal Section */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3 text-[#1C1917]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
          Sleep Goal
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bed className="w-4 h-4 text-[#78716C]" />
            <span className="text-sm text-[#1C1917]">Target</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="4"
              max="12"
              value={sleepTarget}
              onChange={(e) => setSleepTarget(parseFloat(e.target.value) || 7.0)}
              className="w-16 text-center font-mono text-base bg-[#F1ECE1] border border-[#DDD5C7] rounded-lg py-1 text-[#1C1917]"
            />
            <span className="text-xs text-[#78716C]">hours / day</span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-2 text-[#1C1917]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
          Appearance
        </h3>
        <div className="flex items-center justify-between text-sm py-1">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-[#78716C]" />
            <span className="text-[#1C1917]">Theme</span>
          </div>
          <span className="text-xs text-[#1C1917] bg-[#F1ECE2] px-2.5 py-1 rounded-lg border border-[#DDD5C7]">
            Warm Journal (Comfort Dark Edition)
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1C1917] text-white font-bold hover:bg-black transition-colors shadow-sm text-base cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" /> Saved !
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 shadow-sm space-y-3 text-[#1C1917]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
          Data Management
        </h3>
        <p className="text-xs text-[#78716C]">
          All your daily streaks, goals, sleep records, and GATE syllabus progress are stored locally on your device.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-800">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] text-[#1C1917] hover:bg-[#E8E1D4] text-sm font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#78716C]" />
            <span>Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#F1ECE1] border border-[#DDD5C7] text-[#1C1917] hover:bg-[#E8E1D4] text-sm font-semibold cursor-pointer relative">
            <Upload className="w-4 h-4 text-[#78716C]" />
            <span>Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-[#E5DDD0]">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                onResetAllData();
              }
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All App Data</span>
          </button>
        </div>
      </div>

      {/* Quote */}
      <div className="text-center py-2">
        <p className="text-base font-notes text-zinc-400 italic">
          "A better you, One day at a time."
        </p>
      </div>
    </div>
  );
};
