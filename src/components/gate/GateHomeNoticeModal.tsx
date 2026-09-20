import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface GateHomeNoticeModalProps {
  isOpen: boolean;
  type: 'no_connection' | 'module_completed';
  onNavigateToActiveConnection: () => void;
  onClose: () => void;
}

export const GateHomeNoticeModal: React.FC<GateHomeNoticeModalProps> = ({
  isOpen,
  type,
  onNavigateToActiveConnection,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="gate-home-notice-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="gate-home-notice-card"
        className="w-full max-w-sm bg-[#161622] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center font-handwriting text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
            type === 'no_connection'
              ? 'bg-rose-950/50 text-rose-400 border-rose-800/60'
              : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
          }`}
        >
          {type === 'no_connection' ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-100">
            {type === 'no_connection'
              ? 'Set Active GATE Module'
              : 'Active Module Finished'}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {type === 'no_connection'
              ? 'To tick the GATE goal, select your currently active Subject and Module so your progress advances automatically.'
              : 'All videos in your current module are complete! Connect your next module to continue compounding progress.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            id="gate-home-notice-action-btn"
            type="button"
            onClick={() => {
              onClose();
              onNavigateToActiveConnection();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
          >
            <span>
              {type === 'no_connection'
                ? 'Select Active Module'
                : 'Connect Next Module'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-3 py-1.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
