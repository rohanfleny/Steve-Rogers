import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Settings,
  GraduationCap,
} from 'lucide-react';
import {
  GateStoreState,
  GateVideo,
  GateSubject,
  GateModule,
} from '../../types/gate';
import {
  calculateOverallGateProgress,
  calculateGateProjection,
  getNextIncompleteVideo,
} from '../../logic/gateCalculations';
import { GateOverview } from './GateOverview';
import { GateSubjectsView } from './GateSubjectsView';
import { GateActiveConnectionView } from './GateActiveConnectionView';
import { GateSettingsView } from './GateSettingsView';

export type GateSubTab = 'overview' | 'subjects' | 'connection' | 'settings';

interface GateContainerProps {
  gateStore: GateStoreState;
  onUpdateStore: (updater: (prev: GateStoreState) => GateStoreState) => void;
  onCheckModuleCompletionTrigger: (moduleId: string, updatedVideos: GateVideo[]) => void;
  activeSubTab?: GateSubTab;
  onSubTabChange?: (tab: GateSubTab) => void;
}

export const GateContainer: React.FC<GateContainerProps> = ({
  gateStore,
  onUpdateStore,
  onCheckModuleCompletionTrigger,
  activeSubTab = 'overview',
  onSubTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<GateSubTab>('overview');
  const currentTab = onSubTabChange ? activeSubTab : internalTab;

  const setTab = (tab: GateSubTab) => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const { videos, activeConnection, projectionSettings } = gateStore;

  // Derived metrics
  const overallProgress = calculateOverallGateProgress(videos);
  const projection = calculateGateProjection(
    projectionSettings,
    overallProgress.total,
    overallProgress.completed,
    overallProgress.remaining,
    videos
  );
  const nextVideo = getNextIncompleteVideo(activeConnection.moduleId, videos);

  // Direct video complete from overview
  const handleCompleteNextVideoFromOverview = () => {
    if (!nextVideo) return;
    const vidId = nextVideo.id;
    const affectedModuleId = nextVideo.moduleId;
    let updatedVideosList: GateVideo[] = [];

    onUpdateStore((prev) => {
      const updated = prev.videos.map((v) =>
        v.id === vidId
          ? { ...v, completed: true, completedAt: new Date().toISOString() }
          : v
      );
      updatedVideosList = updated;
      return { ...prev, videos: updated };
    });

    if (affectedModuleId && updatedVideosList.length > 0) {
      onCheckModuleCompletionTrigger(affectedModuleId, updatedVideosList);
    }
  };

  const navItems: { id: GateSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Modules', icon: BookOpen },
    { id: 'connection', label: 'Active Connection', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div id="gate-container" className="space-y-4 sm:space-y-6">
      {/* Sub-Navigation Bar - Notebook Index Tabs */}
      <div className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-1.5 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`gate-nav-tab-${item.id}`}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#252522] text-[#FAF7F0] border-[#1E1E1C] shadow-2xs'
                    : 'bg-transparent text-[#61584A] border-transparent hover:text-[#252522] hover:bg-[#EAE2D2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Content */}
      <div id="gate-tab-content">
        {currentTab === 'overview' && (
          <GateOverview
            gateStore={gateStore}
            overallProgress={overallProgress}
            projection={projection}
            nextVideo={nextVideo}
            onNavigateToSubjects={() => setTab('subjects')}
            onNavigateToActiveConnection={() => setTab('connection')}
            onNavigateToSettings={() => setTab('settings')}
            onCompleteNextVideo={handleCompleteNextVideoFromOverview}
          />
        )}

        {currentTab === 'subjects' && (
          <GateSubjectsView
            gateStore={gateStore}
            onUpdateStore={onUpdateStore}
            onCheckModuleCompletionTrigger={onCheckModuleCompletionTrigger}
          />
        )}

        {currentTab === 'connection' && (
          <GateActiveConnectionView
            gateStore={gateStore}
            onUpdateStore={onUpdateStore}
            onNavigateToSubjects={() => setTab('subjects')}
          />
        )}

        {currentTab === 'settings' && (
          <GateSettingsView
            gateStore={gateStore}
            onUpdateStore={onUpdateStore}
          />
        )}
      </div>
    </div>
  );
};
