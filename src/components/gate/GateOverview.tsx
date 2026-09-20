import React from 'react';
import {
  GraduationCap,
  Layers,
  Video,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  GateStoreState,
  ProgressSummary,
  GateProjectionResult,
  GateVideo,
} from '../../types/gate';

interface GateOverviewProps {
  gateStore: GateStoreState;
  overallProgress: ProgressSummary;
  projection: GateProjectionResult;
  nextVideo: GateVideo | null;
  onNavigateToSubjects: () => void;
  onNavigateToActiveConnection: () => void;
  onNavigateToSettings: () => void;
  onCompleteNextVideo: () => void;
}

export const GateOverview: React.FC<GateOverviewProps> = ({
  gateStore,
  overallProgress,
  projection,
  nextVideo,
  onNavigateToSubjects,
  onNavigateToActiveConnection,
  onNavigateToSettings,
  onCompleteNextVideo,
}) => {
  const { subjects, modules, activeConnection, projectionSettings } = gateStore;
  const hasContent = subjects.length > 0 && modules.length > 0;

  const activeSubject = subjects.find((s) => s.id === activeConnection.subjectId);
  const activeModule = modules.find((m) => m.id === activeConnection.moduleId);

  return (
    <div id="gate-overview-container" className="space-y-4 sm:space-y-6">
      {/* Empty State when no subjects exist */}
      {!hasContent ? (
        <div
          id="gate-empty-state"
          className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-6 sm:p-8 text-center space-y-4 shadow-2xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EAE2D2] text-[#252522] flex items-center justify-center mx-auto border border-[#DDD6C8]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-[#252522] font-serif-heading">
              No GATE Curriculum Configured Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#736B5E]">
              Build your custom preparation syllabus by registering subjects, modules, and video lecture lists. All progress counts are derived dynamically from your records.
            </p>
          </div>
          <div className="pt-2">
            <button
              id="create-first-subject-btn"
              type="button"
              onClick={onNavigateToSubjects}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#252522] text-[#FAF7F0] font-semibold text-xs sm:text-sm hover:bg-[#3D3A34] transition-colors shadow-2xs border border-[#1E1E1C]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Subject &amp; Module</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Overall Progress Card */}
          <div
            id="gate-overall-progress-card"
            className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4.5 sm:p-5.5 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
                  Overall GATE Syllabus Ledger
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span
                    id="gate-progress-fraction"
                    className="text-3xl sm:text-4xl font-extrabold font-mono text-[#252522]"
                  >
                    {overallProgress.completed} / {overallProgress.total}
                  </span>
                  <span
                    id="gate-progress-percentage"
                    className="text-2xl font-bold font-mono text-[#4A6953]"
                  >
                    {overallProgress.percentage}%
                  </span>
                </div>
                <p className="text-xs text-[#736B5E] mt-1">
                  {overallProgress.remaining} lecture(s) remaining across {subjects.length} subject(s) and {modules.length} module(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E1EDE4] border border-[#CFDFD3] text-[#4A6953] text-xs font-mono font-semibold">
                  <Video className="w-3.5 h-3.5" />
                  <span>{overallProgress.completed} Completed</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8] text-[#5A5347] text-xs font-mono font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{overallProgress.remaining} Pending</span>
                </span>
              </div>
            </div>

            {/* Overall Progress Fill Bar */}
            <div className="mt-4 pt-3 border-t border-[#EAE2D2]">
              <div className="w-full bg-[#EAE2D2] rounded-full h-2.5 overflow-hidden border border-[#DDD6C8]">
                <div
                  id="gate-progress-fill-bar"
                  className="h-full bg-[#607C68] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${overallProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Connection & Next Incomplete Video Card */}
          <div
            id="gate-active-connection-card"
            className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4.5 sm:p-5.5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAE2D2] text-[#252522] flex items-center justify-center border border-[#DDD6C8]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252522] font-serif-heading">
                    Active Study Docket
                  </h3>
                  <p className="text-[11px] text-[#736B5E]">
                    Directly linked to Home Dashboard "GATE — 1 Video" protocol
                  </p>
                </div>
              </div>

              <button
                id="change-active-connection-btn"
                type="button"
                onClick={onNavigateToActiveConnection}
                className="text-xs font-semibold text-[#5A5347] hover:text-[#252522] transition-colors font-mono"
              >
                Change Docket →
              </button>
            </div>

            {activeSubject && activeModule ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8271]">
                      Active Subject
                    </span>
                    <p className="text-sm font-bold text-[#252522] mt-0.5 truncate font-serif-heading">
                      {activeSubject.title}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8271]">
                      Active Module
                    </span>
                    <p className="text-sm font-bold text-[#252522] mt-0.5 truncate font-serif-heading">
                      {activeModule.title}
                    </p>
                  </div>
                </div>

                {/* Next Incomplete Video */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#61584A]">
                    Next Sequential Lecture
                  </span>
                  {nextVideo ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1.5">
                      <div>
                        <p className="text-sm font-bold text-[#252522]">
                          Lecture #{nextVideo.order}: {nextVideo.title}
                        </p>
                        <p className="text-xs font-mono text-[#736B5E]">
                          Sequence position: #{nextVideo.order}
                        </p>
                      </div>

                      <button
                        id="complete-next-video-btn"
                        type="button"
                        onClick={onCompleteNextVideo}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors shrink-0 shadow-2xs border border-[#1E1E1C]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Video Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#4A6953] flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        Current module completed. Connect your next GATE module.
                      </p>
                      <button
                        type="button"
                        onClick={onNavigateToActiveConnection}
                        className="text-xs font-bold text-[#252522] hover:underline"
                      >
                        Connect Next Module →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-[#736B5E] text-xs">
                  <AlertCircle className="w-4 h-4 text-[#C98E3D] shrink-0" />
                  <span>No active module connected. Select your current study module.</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToActiveConnection}
                  className="px-3 py-1.5 rounded-lg bg-[#252522] text-[#FAF7F0] text-xs font-semibold hover:bg-[#3D3A34] transition-colors shrink-0"
                >
                  Configure Connection
                </button>
              </div>
            )}
          </div>

          {/* GATE Projection Card */}
          <div
            id="gate-projection-card"
            className="bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4.5 sm:p-5.5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAE2D2] text-[#252522] flex items-center justify-center border border-[#DDD6C8]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252522] font-serif-heading">
                    Pace &amp; Completion Projection
                  </h3>
                  <p className="text-[11px] text-[#736B5E]">
                    Calculated dynamically from configured video count &amp; daily pace
                  </p>
                </div>
              </div>

              <button
                id="edit-projection-settings-btn"
                type="button"
                onClick={onNavigateToSettings}
                className="text-xs font-semibold text-[#5A5347] hover:text-[#252522] transition-colors font-mono"
              >
                Pace Settings →
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8271]">
                  Daily Pace Target
                </span>
                <p className="text-base font-bold font-mono text-[#252522] mt-0.5">
                  {projectionSettings.dailyVideoTarget} video/day
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8271]">
                  Target Deadline
                </span>
                <p className="text-base font-bold font-mono text-[#252522] mt-0.5">
                  {projection.originalTargetDate || 'Not set'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#61584A]">
                  Estimated Completion Date
                </span>
                <p className="text-base font-bold font-mono text-[#252522] mt-0.5">
                  {projection.projectedCompletionDate}
                </p>
              </div>
            </div>

            {/* Projection status pill */}
            <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#EAE2D2]">
              <span className="text-[#736B5E]">
                Pace Assessment: <strong className="text-[#252522] font-mono font-bold">{projection.message}</strong>
              </span>
              {projection.daysRemaining > 0 && (
                <span className="font-mono text-[#736B5E] text-[11px]">
                  ~{projection.daysRemaining} study day(s) required
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

