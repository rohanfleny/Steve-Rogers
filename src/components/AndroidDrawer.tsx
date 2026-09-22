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

  const navItemClass =
    'text-[#9B1B30] hover:bg-[#F1ECE1]';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer surface */}
      <div className="relative w-4/5 max-w-[280px] bg-[#FAF7F0] h-full shadow-2xl flex flex-col p-5 border-r border-[#D6DCE8] z-10 overflow-y-auto text-[#9B1B30]">
        {/* Main drawer content */}
        <div className="flex-1">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[#6B7280] hover:text-[#9B1B30] hover:bg-[#F1ECE1] focus:outline-none cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Greeting Header */}
          <div className="mb-3">
            <h2 className="text-2xl font-fancy font-bold text-[#1B3A57] leading-tight">
              WELCOME, {userName.toUpperCase()}
            </h2>
          </div>

          {/* Captain America image */}
          <div className="my-3 flex justify-center">
            <img
              src="/captain-america-drawer.jpg"
              alt="Captain America"
              className="w-full h-[170px] object-contain object-center block"
              loading="eager"
            />
          </div>

          {/* Captain America quote */}
          <div className="mb-5 px-2">
            <p className="text-xs font-notes text-[#9B1B30] italic text-center">
              "I can do this all day."
            </p>
            <p className="text-[10px] font-notes text-[#9B1B30] mt-1 text-right pr-1">
              — Steve Rogers
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${navItemClass}`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* GATE - dynamic name */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('gate');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${navItemClass}`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[#9B1B30] hover:bg-[#F1ECE1] transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{academicsTitle}</span>
            </button>

            {/* Sleep */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('sleep');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${navItemClass}`}
            >
              <Moon className="w-4 h-4 shrink-0" />
              <span>Sleep</span>
            </button>

            {/* Analytics */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('analytics');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${navItemClass}`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>Analytics</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${navItemClass}`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AndroidDrawer;
