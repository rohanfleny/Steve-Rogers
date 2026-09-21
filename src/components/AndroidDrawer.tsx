import React from 'react';
import {
  Home,
  BookOpen,
  GraduationCap,
  Moon,
  BarChart2,
  Settings,
  X,
} from 'lucide-react';
import { MountainDoodle } from './HandwrittenDoodles';
import { UserSettings, getGoalTitle } from '../types/daily';

export type AndroidNavTab =
  | 'home'
  | 'gate'
  | 'sleep'
  | 'analytics'
  | 'settings';

interface AndroidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AndroidNavTab;
  onSelectTab: (tab: AndroidNavTab) => void;
  userName?: string;
  onOpenAcademics?: () => void;
  settings: UserSettings;
}

export const AndroidDrawer: React.FC<AndroidDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  userName = 'Rohan',
  onOpenAcademics,
  settings,
}) => {
  if (!isOpen) return null;

  const gateTitle = getGoalTitle('gate', settings);
  const academicsTitle = getGoalTitle('academics', settings);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer surface */}
      <div className="relative w-4/5 max-w-[280px] bg-[#FAF7F0] h-full shadow-2xl flex flex-col justify-between p-5 border-r border-[#E5DDD0] z-10 overflow-y-auto text-[#1C1917]">
        <div>
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#E8E1D4] focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Greeting Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-fancy font-bold text-[#1C1917] leading-tight">
              Good Day,
              <br />
              {userName}
            </h2>
          </div>

          {/* Mountain sketch */}
          <div className="my-3 py-1 flex justify-center">
            <MountainDoodle className="w-28 h-14 text-[#A8A29E]" />
          </div>

          {/* Quote */}
          <div className="mb-6 text-center">
            <p className="text-xs font-notes text-[#78716C] italic">
              "Same Effort, Better Tomorrow."
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 font-handwriting text-base">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                  : 'text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* GATE - dynamic name */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('gate');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'gate'
                  ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                  : 'text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{gateTitle}</span>
            </button>

            {/* Academics - dynamic name */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('home');
                onClose();
                if (onOpenAcademics) onOpenAcademics();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{academicsTitle}</span>
            </button>

            {/* Sleep */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('sleep');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'sleep'
                  ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                  : 'text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Sleep</span>
            </button>

            {/* Analytics */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('analytics');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                  : 'text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917]'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                  : 'text-[#57534E] hover:bg-[#E8E1D4] hover:text-[#1C1917]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Pinned sticky note */}
        <div className="mt-6 pt-4">
          <div className="p-3.5 bg-[#F1ECE2] border border-[#DDD5C7] rounded-xl shadow-xs rotate-[-1deg]">
            <p className="text-xs font-notes text-[#57534E] leading-relaxed text-center">
              "Discipline today
              <br />
              is freedom
              <br />
              tomorrow."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
