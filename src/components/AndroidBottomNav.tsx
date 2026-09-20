import React from 'react';
import { Home, BookOpen, Moon, BarChart2 } from 'lucide-react';
import { AndroidNavTab } from './AndroidDrawer';

interface AndroidBottomNavProps {
  activeTab: AndroidNavTab;
  onSelectTab: (tab: AndroidNavTab) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'home' as AndroidNavTab, label: 'Home', icon: Home },
    { id: 'gate' as AndroidNavTab, label: 'GATE', icon: BookOpen },
    { id: 'sleep' as AndroidNavTab, label: 'Sleep', icon: Moon },
    { id: 'analytics' as AndroidNavTab, label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <nav
      id="android-bottom-nav"
      className="w-full bg-[#121218]/95 backdrop-blur-md border-t border-zinc-800/80 py-1.5 px-3 flex items-center justify-around z-30 shrink-0 select-none"
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
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-white font-bold bg-zinc-800/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110 stroke-[2.4] text-emerald-400' : 'stroke-[1.6]'
              }`}
            />
            <span
              className={`text-[12px] font-handwriting mt-0.5 leading-none ${
                isActive ? 'font-bold text-white' : 'font-normal text-zinc-400'
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
