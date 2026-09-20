import React from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { GateStoreState } from '../types/gate';
import {
  calculateOverallGateProgress,
  getNextIncompleteVideo,
} from '../logic/gateCalculations';

interface FutureGateNoticeProps {
  gateStore: GateStoreState;
  onOpenGate: () => void;
}

export const FutureGateNotice: React.FC<FutureGateNoticeProps> = ({
  gateStore,
  onOpenGate,
}) => {
  const { subjects, modules, videos, activeConnection } = gateStore;
  const overall = calculateOverallGateProgress(videos);
  const activeSubj = subjects.find((s) => s.id === activeConnection.subjectId);
  const activeMod = modules.find((m) => m.id === activeConnection.moduleId);
  const nextVideo = getNextIncompleteVideo(activeConnection.moduleId, videos);

  return (
    <div
      id="architecture-foundation-card"
      className="w-full bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4 sm:p-4.5 shadow-2xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAE2D2] text-[#252522] flex items-center justify-center shrink-0 border border-[#DDD6C8]">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#252522] font-serif-heading tracking-tight">
              GATE Syllabus Engine
            </h3>
            <p className="text-xs text-[#736B5E]">
              {subjects.length === 0
                ? 'No subjects configured yet • Dynamic curriculum'
                : `${overall.completed} of ${overall.total} videos completed across ${subjects.length} subject(s)`}
            </p>
          </div>
        </div>

        <button
          id="open-gate-prep-btn"
          type="button"
          onClick={onOpenGate}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors shrink-0 shadow-2xs border border-[#1E1E1C]"
        >
          <span>Open GATE System</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini status indicator */}
      {subjects.length > 0 && (
        <div className="pt-2.5 border-t border-[#EAE2D2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#5A5347] truncate">
            <span className="font-semibold text-[#8C8271]">Active Queue:</span>
            {activeSubj && activeMod ? (
              <span className="truncate font-medium text-[#252522] font-mono text-[11px]">
                {activeSubj.title} → {activeMod.title}
                {nextVideo ? ` (Next: #${nextVideo.order} ${nextVideo.title})` : ' (Module 100% Done)'}
              </span>
            ) : (
              <span className="text-[#C98E3D] italic font-mono">No active module connected</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[#736B5E] font-semibold">
              {overall.percentage}% Overall
            </span>
            <div className="w-20 bg-[#EAE2D2] rounded-full h-1.5 overflow-hidden border border-[#DDD6C8]">
              <div
                className="bg-[#607C68] h-full rounded-full transition-all duration-300"
                style={{ width: `${overall.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

