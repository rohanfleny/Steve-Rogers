import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  FileJson,
  Target,
} from 'lucide-react';
import { UserSettings } from '../types/daily';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onExportJSON: () => string;
  onImportJSON: (jsonString: string) => { success: boolean; error?: string };
  onResetAllData: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportJSON,
  onImportJSON,
  onResetAllData,
}) => {
  const [sleepTarget, setSleepTarget] = useState<number>(settings.sleepTargetHours);
  const [isCopied, setIsCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      sleepTargetHours: sleepTarget,
    });
  };

  const handleDownloadJSON = () => {
    const jsonStr = onExportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    const jsonStr = onExportJSON();
    try {
      await navigator.clipboard.writeText(jsonStr);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePerformImport = () => {
    if (!importText.trim()) {
      setImportError('Please paste JSON data first');
      return;
    }
    const result = onImportJSON(importText);
    if (result.success) {
      setImportSuccess(true);
      setImportError(null);
      setTimeout(() => {
        setImportSuccess(false);
        setImportText('');
        onClose();
      }, 1200);
    } else {
      setImportError(result.error || 'Failed to import JSON data');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="data-management-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="data-management-modal-container"
        className="w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-xl border border-[#DDD6C8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE2D2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAE2D2] text-[#252522] flex items-center justify-center border border-[#DDD6C8]">
              <FileJson className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#252522] font-serif-heading">Settings &amp; Ledger Data</h2>
          </div>
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8271] hover:text-[#252522] hover:bg-[#EAE2D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Configurable Sleep Target */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#736B5E]" />
              <h3 className="text-sm font-bold text-[#252522] font-serif-heading">Configurable Sleep Target</h3>
            </div>
            <p className="text-xs text-[#736B5E]">
              Set your target sleep duration. This target is logged independently and does not affect your daily 5/5 disciplined score.
            </p>
            <div className="flex items-center gap-3">
              <input
                id="sleep-target-input"
                type="number"
                step="0.5"
                min="4"
                max="12"
                value={sleepTarget}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setSleepTarget(val);
                  }
                }}
                className="w-24 px-3 py-2 border border-[#DDD6C8] bg-[#FAF7F0] rounded-xl text-center font-mono font-bold text-[#252522] focus:outline-none focus:ring-1 focus:ring-[#736B5E]"
              />
              <span className="text-sm text-[#736B5E] font-mono">hours / night</span>
              <button
                id="save-sleep-target-btn"
                type="button"
                onClick={handleSaveSettings}
                className="px-3.5 py-2 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors ml-auto border border-[#1E1E1C] shadow-2xs"
              >
                Save Target
              </button>
            </div>
          </div>

          <hr className="border-[#EAE2D2]" />

          {/* Section 2: Backup / Export */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#736B5E]" />
              <h3 className="text-sm font-bold text-[#252522] font-serif-heading">Export Application Ledger</h3>
            </div>
            <p className="text-xs text-[#736B5E]">
              Download your complete daily records, GATE progress, and study notes as a clean JSON backup file.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                id="download-backup-json-btn"
                type="button"
                onClick={handleDownloadJSON}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] text-xs font-semibold hover:bg-[#EAE2D2] transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#736B5E]" />
                <span>Download .JSON File</span>
              </button>
              <button
                id="copy-backup-json-btn"
                type="button"
                onClick={handleCopyJSON}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] text-xs font-semibold hover:bg-[#EAE2D2] transition-colors shadow-2xs font-mono"
              >
                {isCopied ? <Check className="w-4 h-4 text-[#4A6953]" /> : <FileJson className="w-4 h-4 text-[#736B5E]" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <hr className="border-[#EAE2D2]" />

          {/* Section 3: Restore / Import */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#736B5E]" />
              <h3 className="text-sm font-bold text-[#252522] font-serif-heading">Import Application Data</h3>
            </div>
            <p className="text-xs text-[#736B5E]">
              Restore previously exported JSON data to sync across devices or recover records.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="import-file-upload"
                className="block text-center py-2 px-3 border border-dashed border-[#DDD6C8] bg-[#FAF7F0] rounded-xl text-xs text-[#736B5E] hover:border-[#8C8271] hover:bg-[#EAE2D2]/40 cursor-pointer transition-colors"
              >
                <span>Click here to select a JSON file</span>
                <input
                  id="import-file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <textarea
                id="import-json-textarea"
                rows={3}
                placeholder="Or paste JSON text here..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-[#DDD6C8] bg-[#FAF7F0] text-[#252522] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#736B5E]"
              />

              {importError && (
                <p className="text-xs font-mono text-[#B65C52] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {importError}
                </p>
              )}
              {importSuccess && (
                <p className="text-xs font-mono text-[#4A6953] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Data imported successfully!
                </p>
              )}

              <button
                id="execute-import-btn"
                type="button"
                onClick={handlePerformImport}
                disabled={!importText.trim()}
                className="w-full py-2 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] disabled:opacity-50 transition-colors border border-[#1E1E1C] shadow-2xs"
              >
                Restore / Import Now
              </button>
            </div>
          </div>

          <hr className="border-[#EAE2D2]" />

          {/* Section 4: Complete Reset */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#B65C52]" />
              <h3 className="text-sm font-bold text-[#B65C52] font-serif-heading">Complete Reset</h3>
            </div>
            <p className="text-xs text-[#736B5E]">
              Clears all local storage records and resets to initial baseline. This action cannot be reversed.
            </p>

            {!showConfirmReset ? (
              <button
                id="trigger-reset-btn"
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="px-3.5 py-2 rounded-xl border border-[#E7CEBE] bg-[#F8EFE9] text-[#B65C52] text-xs font-semibold hover:bg-[#F3E2D8] transition-colors"
              >
                Reset All Application Data
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#F8EFE9] border border-[#E7CEBE] space-y-2">
                <p className="text-xs font-bold text-[#B65C52] flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 text-[#B65C52]" />
                  Are you completely sure?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    id="confirm-reset-btn"
                    type="button"
                    onClick={() => {
                      onResetAllData();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#B65C52] text-white text-xs font-bold hover:bg-[#9E4A40] transition-colors shadow-2xs border border-[#9E4A40]"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    id="cancel-reset-btn"
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#DDD6C8] text-[#736B5E] text-xs font-semibold hover:bg-[#EAE2D2]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAF7F0] border-t border-[#EAE2D2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FCFAF6] border border-[#DDD6C8] text-[#736B5E] text-xs font-semibold hover:bg-[#EAE2D2] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
