import { useState, useEffect, useMemo, useCallback } from 'react';
import { AndroidDrawer, AndroidNavTab } from './components/AndroidDrawer';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { HomeDashboardView } from './components/views/HomeDashboardView';
import { GateView } from './components/views/GateView';
import { SleepTrackerView } from './components/views/SleepTrackerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsGoalsView } from './components/views/SettingsGoalsView';
import { GateHomeNoticeModal } from './components/gate/GateHomeNoticeModal';
import { TodayGateSelectionModal } from './components/gate/TodayGateSelectionModal';
import { DailyGoalId, DailyRecord, UserSettings } from './types/daily';
import { GateStoreState, GateVideo } from './types/gate';
import {
  getTodayDateString,
  getEmptyDailyGoals,
} from './logic/calculations';
import {
  getNextIncompleteVideo,
} from './logic/gateCalculations';
import {
  loadAllDailyRecords,
  saveDailyRecord,
  loadUserSettings,
  saveUserSettings,
  loadGateStore,
  saveGateStore,
  exportAppDataJSON,
  importAppDataJSON,
  clearAllAppData,
  DEFAULT_USER_SETTINGS,
  DEFAULT_GATE_STORE,
} from './storage/storage';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [allRecords, setAllRecords] = useState<Record<string, DailyRecord>>({});
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [gateStore, setGateStore] = useState<GateStoreState>(DEFAULT_GATE_STORE);
  const [activeTab, setActiveTab] = useState<AndroidNavTab>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Today Gate Selection Modal
  const [isTodayGateModalOpen, setIsTodayGateModalOpen] = useState(false);

  // Home Gate Notice Modal
  const [homeNoticeModal, setHomeNoticeModal] = useState<{
    isOpen: boolean;
    type: 'no_connection' | 'module_completed';
  }>({
    isOpen: false,
    type: 'no_connection',
  });

  // Initialize data on mount
  useEffect(() => {
    const loadedRecords = loadAllDailyRecords();
    const loadedSettings = loadUserSettings();
    const loadedGateStore = loadGateStore();

    setAllRecords(loadedRecords);
    setSettings(loadedSettings);
    setGateStore(loadedGateStore);
    setIsLoaded(true);
  }, []);

  // Update GATE store helper
  const handleUpdateGateStore = useCallback(
    (updater: (prev: GateStoreState) => GateStoreState) => {
      setGateStore((prev) => {
        const next = updater(prev);
        saveGateStore(next);
        return next;
      });
    },
    []
  );

  // Get active record for selectedDate
  const currentRecord: DailyRecord = useMemo(() => {
    if (allRecords[selectedDate]) {
      return allRecords[selectedDate];
    }

    return {
      date: selectedDate,
      goals: getEmptyDailyGoals(),
      sleepHours: null,
      note: '',
      updatedAt: new Date().toISOString(),
    };
  }, [allRecords, selectedDate]);

  // Active GATE connection metrics
  const activeSubject = useMemo(() => {
    return (
      gateStore.subjects.find(
        (s) => s.id === gateStore.activeConnection.subjectId
      ) || null
    );
  }, [gateStore.subjects, gateStore.activeConnection.subjectId]);

  const activeModule = useMemo(() => {
    return (
      gateStore.modules.find(
        (m) => m.id === gateStore.activeConnection.moduleId
      ) || null
    );
  }, [gateStore.modules, gateStore.activeConnection.moduleId]);

  const nextIncompleteVideo = useMemo(() => {
    return getNextIncompleteVideo(
      gateStore.activeConnection.moduleId,
      gateStore.videos
    );
  }, [gateStore.activeConnection.moduleId, gateStore.videos]);

  // Toggle goal handler on Home Dashboard
  const handleToggleGoal = useCallback(
    (id: DailyGoalId) => {
      // Non-GATE goals
      if (id !== 'gate') {
        const updatedGoals = {
          ...currentRecord.goals,
          [id]: !currentRecord.goals[id],
        };

        const updatedRecord: DailyRecord = {
          ...currentRecord,
          goals: updatedGoals,
          updatedAt: new Date().toISOString(),
        };

        saveDailyRecord(updatedRecord);

        setAllRecords((prev) => ({
          ...prev,
          [selectedDate]: updatedRecord,
        }));

        return;
      }

      // GATE goal connection to GATE video completion
      const isCurrentlyCompleted = Boolean(currentRecord.goals.gate);

      if (!isCurrentlyCompleted) {
        const activeSubjId = gateStore.activeConnection.subjectId;
        const activeModId = gateStore.activeConnection.moduleId;

        const activeMod = activeModId
          ? gateStore.modules.find((m) => m.id === activeModId)
          : null;

        const nextVideo = activeModId
          ? getNextIncompleteVideo(activeModId, gateStore.videos)
          : null;

        // If no active connection or current module is completed,
        // ask which subject and module
        if (
          !activeSubjId ||
          !activeModId ||
          !activeMod ||
          !nextVideo
        ) {
          setIsTodayGateModalOpen(true);
          return;
        }

        // Module continuation: silent tick
        const completionTime = new Date().toISOString();

        handleUpdateGateStore((prev) => {
          const updated = prev.videos.map((v) =>
            v.id === nextVideo.id
              ? {
                  ...v,
                  completed: true,
                  completedAt: completionTime,
                }
              : v
          );

          return {
            ...prev,
            videos: updated,
          };
        });

        const updatedRecord: DailyRecord = {
          ...currentRecord,
          goals: {
            ...currentRecord.goals,
            gate: true,
          },
          gateVideoCompletedId: nextVideo.id,
          updatedAt: completionTime,
        };

        saveDailyRecord(updatedRecord);

        setAllRecords((prev) => ({
          ...prev,
          [selectedDate]: updatedRecord,
        }));
      } else {
        // Un-tick GATE goal
        const linkedVideoId = currentRecord.gateVideoCompletedId;

        if (linkedVideoId) {
          handleUpdateGateStore((prev) => {
            const updated = prev.videos.map((v) =>
              v.id === linkedVideoId
                ? {
                    ...v,
                    completed: false,
                    completedAt: undefined,
                  }
                : v
            );

            return {
              ...prev,
              videos: updated,
            };
          });
        }

        const updatedRecord: DailyRecord = {
          ...currentRecord,
          goals: {
            ...currentRecord.goals,
            gate: false,
          },
          gateVideoCompletedId: undefined,
          updatedAt: new Date().toISOString(),
        };

        saveDailyRecord(updatedRecord);

        setAllRecords((prev) => ({
          ...prev,
          [selectedDate]: updatedRecord,
        }));
      }
    },
    [
      currentRecord,
      selectedDate,
      gateStore,
      handleUpdateGateStore,
    ]
  );

  // Confirm Today's Gate Selection
  const handleConfirmTodayGate = useCallback(
    (subjId: string, modId: string) => {
      setIsTodayGateModalOpen(false);

      let currentVideos = gateStore.videos;

      const existingInMod = currentVideos.filter(
        (v) => v.moduleId === modId
      );

      let nextVid = getNextIncompleteVideo(
        modId,
        currentVideos
      );

      // Auto-generate 7 videos if module doesn't have any yet
      if (existingInMod.length === 0) {
        const generated: GateVideo[] = [];

        for (let i = 1; i <= 7; i++) {
          generated.push({
            id: `vid-${Date.now()}-${i}`,
            moduleId: modId,
            title: `Video ${i}`,
            order: i,
            completed: false,
          });
        }

        currentVideos = [...currentVideos, ...generated];
        nextVid = generated[0];
      } else if (!nextVid) {
        // If all existing videos were completed,
        // reset them when explicitly selected again
        currentVideos = currentVideos.map((v) =>
          v.moduleId === modId
            ? {
                ...v,
                completed: false,
                completedAt: undefined,
              }
            : v
        );

        nextVid = getNextIncompleteVideo(
          modId,
          currentVideos
        );
      }

      if (!nextVid) return;

      const completionTime = new Date().toISOString();

      const updatedVideos = currentVideos.map((v) =>
        v.id === nextVid!.id
          ? {
              ...v,
              completed: true,
              completedAt: completionTime,
            }
          : v
      );

      // Save sticky active connection
      handleUpdateGateStore((prev) => ({
        ...prev,
        activeConnection: {
          subjectId: subjId,
          moduleId: modId,
        },
        videos: updatedVideos,
      }));

      // Tick today's GATE goal
      const updatedRecord: DailyRecord = {
        ...currentRecord,
        goals: {
          ...currentRecord.goals,
          gate: true,
        },
        gateVideoCompletedId: nextVid.id,
        updatedAt: completionTime,
      };

      saveDailyRecord(updatedRecord);

      setAllRecords((prev) => ({
        ...prev,
        [selectedDate]: updatedRecord,
      }));
    },
    [
      gateStore.videos,
      currentRecord,
      selectedDate,
      handleUpdateGateStore,
    ]
  );

  // Update sleep handler
  const handleUpdateSleep = useCallback(
    (hours: number | null) => {
      const updatedRecord: DailyRecord = {
        ...currentRecord,
        sleepHours: hours,
        updatedAt: new Date().toISOString(),
      };

      saveDailyRecord(updatedRecord);

      setAllRecords((prev) => ({
        ...prev,
        [selectedDate]: updatedRecord,
      }));
    },
    [currentRecord, selectedDate]
  );

  // Update note handler
  const handleUpdateNote = useCallback(
    (noteText: string) => {
      const updatedRecord: DailyRecord = {
        ...currentRecord,
        note: noteText,
        updatedAt: new Date().toISOString(),
      };

      saveDailyRecord(updatedRecord);

      setAllRecords((prev) => ({
        ...prev,
        [selectedDate]: updatedRecord,
      }));
    },
    [currentRecord, selectedDate]
  );

  // Update user settings
  const handleUpdateSettings = useCallback(
    (newSettings: UserSettings) => {
      setSettings(newSettings);
      saveUserSettings(newSettings);
    },
    []
  );

  // Reset data
  const handleResetAllData = useCallback(() => {
    clearAllAppData();

    setAllRecords({});
    setSettings(DEFAULT_USER_SETTINGS);
    setGateStore(DEFAULT_GATE_STORE);
  }, []);

  // Import JSON data
  const handleImportJSON = useCallback(
    (jsonString: string) => {
      const res = importAppDataJSON(jsonString);

      if (res.success) {
        setAllRecords(loadAllDailyRecords());
        setSettings(loadUserSettings());
        setGateStore(loadGateStore());
      }

      return res;
    },
    []
  );

  // Subtitle & badge for Home GATE item
  const gateSubtitle = useMemo(() => {
    if (!activeSubject || !activeModule) {
      return '1 video (tap to set active subject)';
    }

    if (!nextIncompleteVideo) {
      return `${activeSubject.title} • Module complete`;
    }

    return `${activeSubject.title} • ${activeModule.title} (Video #${nextIncompleteVideo.order})`;
  }, [
    activeSubject,
    activeModule,
    nextIncompleteVideo,
  ]);

  const gateBadge = useMemo(() => {
    if (!activeSubject || !activeModule) {
      return undefined;
    }

    return `${activeSubject.title.slice(0, 10)}..`;
  }, [activeSubject, activeModule]);

  if (!isLoaded) {
    return (
      <div className="h-dvh bg-[#060608] flex items-center justify-center font-handwriting text-zinc-400 text-lg">
        Opening Study Journal...
      </div>
    );
  }

  // Titles for the Top Bar
  const viewTitles: Record<AndroidNavTab, string> = {
    home: 'Dashboard',
    gate: 'GATE',
    sleep: 'Sleep Tracker',
    analytics: 'Analytics',
    settings: 'Settings & Goals',
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#060608] flex flex-col justify-center items-center p-0 sm:py-6 select-none">
      {/* Real Android Phone Shell Frame */}
      <div
        id="android-phone-frame"
        className="w-full h-full sm:max-w-[430px] sm:max-h-[920px] bg-[#0C0C12] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-[#1E1E28] flex flex-col overflow-hidden relative text-zinc-100"
      >
        {/* Android Simulated Status Bar */}
        <div className="w-full bg-[#0C0C12] px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-mono font-bold text-zinc-400 z-30 shrink-0">
          <span>9:41</span>

          <div className="w-16 h-4 bg-zinc-800/80 rounded-full mx-auto hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span>5G</span>

            <span className="w-4 h-2 rounded-[2px] border border-zinc-500 inline-block p-0.5">
              <span className="w-full h-full bg-zinc-400 block rounded-[1px]" />
            </span>
          </div>
        </div>

        {/* Top App Bar */}
        <AndroidTopBar
          title={viewTitles[activeTab]}
          showBack={activeTab !== 'home'}
          onBack={() => setActiveTab('home')}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          onExportData={() => exportAppDataJSON()}
          onImportData={() => {
            const input = document.createElement('input');

            input.type = 'file';
            input.accept = '.json';

            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];

              if (file) {
                const reader = new FileReader();

                reader.onload = (ev) => {
                  handleImportJSON(
                    ev.target?.result as string
                  );
                };

                reader.readAsText(file);
              }
            };

            input.click();
          }}
          onResetData={handleResetAllData}
        />

        {/* ONLY THIS AREA SCROLLS */}
        <main
          id="android-content-area"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4"
        >
          {activeTab === 'home' && (
            <HomeDashboardView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentRecord={currentRecord}
              onToggleGoal={handleToggleGoal}
              settings={settings}
              gateSubtitle={gateSubtitle}
              gateBadge={gateBadge}
              onNavigateToGate={() => setActiveTab('gate')}
              onNavigateToSleep={() => setActiveTab('sleep')}
              sleepHours={currentRecord.sleepHours}
              sleepTargetHours={settings.sleepTargetHours}
              onUpdateSleep={handleUpdateSleep}
              onSaveNote={handleUpdateNote}
              dailyNote={currentRecord.note}
              allRecords={allRecords}
            />
          )}

          {activeTab === 'gate' && (
            <GateView
              gateStore={gateStore}
              onUpdateStore={handleUpdateGateStore}
              onBackToHome={() => setActiveTab('home')}
              currentRecord={currentRecord}
              allRecords={allRecords}
              selectedDate={selectedDate}
            />
          )}

          {activeTab === 'sleep' && (
            <SleepTrackerView
              selectedDate={selectedDate}
              allRecords={allRecords}
              sleepTargetHours={settings.sleepTargetHours}
              onUpdateSleep={handleUpdateSleep}
              onUpdateTarget={(val) =>
                handleUpdateSettings({
                  ...settings,
                  sleepTargetHours: val,
                })
              }
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              allRecords={allRecords}
              selectedDate={selectedDate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsGoalsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onExportJSON={exportAppDataJSON}
              onImportJSON={handleImportJSON}
              onResetAllData={handleResetAllData}
              gateStore={gateStore}
              onUpdateActiveGateModule={(subjectId, moduleId) => {
                handleUpdateGateStore((prev) => ({
                  ...prev,
                  activeConnection: {
                    subjectId,
                    moduleId,
                  },
                }));
              }}
            />
          )}
        </main>

        {/* FIXED BOTTOM NAVIGATION */}
        <div className="shrink-0 z-40">
          <AndroidBottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            settings={settings}
          />
        </div>

        {/* Android Drawer */}
        <AndroidDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userName={settings.name || 'Rohan'}
          settings={settings}
          onOpenAcademics={() => {
            setActiveTab('home');
          }}
        />

        {/* Today Gate Selection Modal */}
        <TodayGateSelectionModal
          isOpen={isTodayGateModalOpen}
          gateStore={gateStore}
          onConfirm={handleConfirmTodayGate}
          onCancel={() => setIsTodayGateModalOpen(false)}
        />

        {/* Home Gate Notice Modal */}
        <GateHomeNoticeModal
          isOpen={homeNoticeModal.isOpen}
          type={homeNoticeModal.type}
          onNavigateToActiveConnection={() => {
            setActiveTab('gate');
          }}
          onClose={() =>
            setHomeNoticeModal({
              isOpen: false,
              type: 'no_connection',
            })
          }
        />
      </div>
    </div>
  );
}
