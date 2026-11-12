import React from 'react';
import { Home, BookOpen, Moon, BarChart2, CalendarCheck } from 'lucide-react';
import { AndroidNavTab } from './AndroidDrawer';
import { UserSettings, getGoalTitle } from '../types/daily';

interface AndroidBottomNavProps {
  activeTab: AndroidNavTab;
  onSelectTab: (tab: AndroidNavTab) => void;
  settings: UserSettings;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onSelectTab,
  settings,
}) => {
  const tabs = [
    {
      id: 'home' as AndroidNavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'work' as AndroidNavTab,
      label: 'Work',
      icon: CalendarCheck,
    },
    {
      id: 'gate' as AndroidNavTab,
      label: getGoalTitle('gate', settings),
      icon: BookOpen,
    },
    {
      id: 'sleep' as AndroidNavTab,
      label: 'Sleep',
      icon: Moon,
    },
    {
      id: 'analytics' as AndroidNavTab,
      label: 'Analytics',
      icon: BarChart2,
    },
  ];

  return (
    <nav
      id="android-bottom-nav"
      className="w-full bg-[#1B3A57] border-t border-[#9B1B30] px-3 pt-2 flex items-center justify-around z-30 shrink-0 select-none"
      style={{
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            id={`bottom-nav-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-xl transition-all cursor-pointer bg-transparent shadow-none ${
              isActive
                ? 'text-[#9B1B30] font-bold'
                : 'text-white font-normal'
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive
                  ? 'scale-110 stroke-[2.5] text-[#9B1B30]'
                  : 'stroke-[1.6] text-white'
              }`}
            />

            <span
              className={`text-[12px] font-handwriting mt-1 leading-none ${
                isActive
                  ? 'font-bold text-[#9B1B30]'
                  : 'font-normal text-white'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
