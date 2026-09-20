import React from 'react';
import { Target, Flame, Settings, Sparkles, CheckSquare, GraduationCap, Compass } from 'lucide-react';

export type MainAppView = 'daily' | 'gate';

interface HeaderProps {
  currentStreak: number;
  totalPerfectDays: number;
  activeView: MainAppView;
  onSelectView: (view: MainAppView) => void;
  onOpenSettings: () => void;
  gateRemainingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  totalPerfectDays,
  activeView,
  onSelectView,
  onOpenSettings,
  gateRemainingCount,
}) => {
  return (
    <header
      id="app-header"
      className="w-full bg-[#FAF7F0]/95 backdrop-blur-xs border-b border-[#E5DFD3] sticky top-0 z-20 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Study Station identity + Streak & Perfect days */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#252522] text-[#F5F0E6] flex items-center justify-center border border-[#1E1E1C] shrink-0 shadow-xs">
              <Compass className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#252522] font-serif-heading tracking-tight leading-none">
                  GATE &amp; Daily System
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EAE2D2] text-[#3F4E5E] border border-[#DDD6C8]">
                  OPERATING SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-[#736B5E] font-medium hidden sm:block mt-0.5">
                5 Core Daily Protocols • Engineering Discipline • Local-First
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentStreak > 0 && (
              <div
                id="streak-badge"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8EFE9] border border-[#E9CFC7] text-[#B65C52] text-xs font-semibold font-mono"
                title={`${currentStreak} consecutive disciplined day(s)`}
              >
                <Flame className="w-3.5 h-3.5 text-[#B65C52] fill-[#B65C52]" />
                <span>{currentStreak}d</span>
              </div>
            )}

            {totalPerfectDays > 0 && (
              <div
                id="perfect-days-badge"
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFF4F0] border border-[#CFDFD3] text-[#4A6953] text-xs font-semibold font-mono"
                title={`${totalPerfectDays} day(s) with 5/5 protocols completed`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#607C68]" />
                <span>{totalPerfectDays} executed</span>
              </div>
            )}

            <button
              id="open-settings-button"
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] border border-transparent hover:border-[#DDD6C8] transition-colors focus:outline-none"
              aria-label="Settings and Data Management"
              title="Data Management & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher: Daily Protocol vs GATE Syllabus */}
        <div
          id="main-view-switcher"
          className="bg-[#EAE2D2]/70 p-1 rounded-xl flex items-center gap-1 border border-[#DDD6C8] self-stretch sm:self-auto"
        >
          <button
            id="view-tab-daily"
            type="button"
            onClick={() => onSelectView('daily')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'daily'
                ? 'bg-[#FCFAF6] text-[#252522] shadow-xs border border-[#DDD6C8]'
                : 'text-[#61584A] hover:text-[#252522]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Daily Protocol</span>
          </button>

          <button
            id="view-tab-gate"
            type="button"
            onClick={() => onSelectView('gate')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'gate'
                ? 'bg-[#FCFAF6] text-[#252522] shadow-xs border border-[#DDD6C8]'
                : 'text-[#61584A] hover:text-[#252522]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>GATE Prep</span>
            {typeof gateRemainingCount === 'number' && gateRemainingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#EAE2D2] text-[#252522] border border-[#D5CCBA]">
                {gateRemainingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

