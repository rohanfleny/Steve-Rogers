import React from 'react';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { DailyProgressCalculation } from '../types/daily';

interface ProgressCardProps {
  progress: DailyProgressCalculation;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress }) => {
  const { completedCount, totalCount, percentage, isAllCompleted } = progress;

  return (
    <div
      id="daily-progress-summary-card"
      className={`w-full rounded-2xl p-4.5 sm:p-5.5 transition-all border ${
        isAllCompleted
          ? 'bg-[#F2F6F3] border-[#C8DACD] shadow-2xs'
          : 'bg-[#FCFAF6] border-[#E5DFD3] shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Numbers display */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
              Daily Execution Score
            </span>
            {isAllCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#E1EDE4] text-[#4A6953] border border-[#CFDFD3]">
                <Sparkles className="w-3 h-3 text-[#607C68]" />
                All Protocols Met
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span
              id="progress-fraction-display"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#252522] font-mono"
            >
              {completedCount} / {totalCount}
            </span>
            <span
              id="progress-percentage-display"
              className={`text-xl sm:text-2xl font-bold font-mono ${
                isAllCompleted ? 'text-[#4A6953]' : 'text-[#3F4E5E]'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <p className="text-xs text-[#736B5E] mt-1">
            Sleep is logged independently in your journal and never alters this tally.
          </p>
        </div>

        {/* Right: Status badge */}
        <div className="flex items-center gap-3">
          {isAllCompleted ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#607C68] text-[#FAF7F0] font-semibold text-xs sm:text-sm shadow-2xs border border-[#4E6755]">
              <CheckCircle2 className="w-4 h-4" />
              <span>All 5 Protocols Executed</span>
            </div>
          ) : completedCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EAE2D2] text-[#252522] border border-[#DDD6C8] text-xs sm:text-sm font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-[#B65C52]" />
              <span>{5 - completedCount} protocol(s) remaining</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#736B5E] border border-[#E5DFD3] text-xs sm:text-sm font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-[#8C8271]" />
              <span>0 protocols marked today</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-4 pt-3 border-t border-[#EAE2D2]">
        <div className="w-full bg-[#EAE2D2] rounded-full h-2 overflow-hidden border border-[#DDD6C8]">
          <div
            id="daily-progress-fill-bar"
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              isAllCompleted
                ? 'bg-[#607C68]'
                : percentage > 0
                ? 'bg-[#252522]'
                : 'bg-transparent'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestone ticks */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#8C8271] mt-1.5 px-0.5">
          <span>0/5</span>
          <span>1/5</span>
          <span>2/5</span>
          <span>3/5</span>
          <span>4/5</span>
          <span className={isAllCompleted ? 'font-bold text-[#4A6953]' : ''}>5/5 (Target)</span>
        </div>
      </div>
    </div>
  );
};

