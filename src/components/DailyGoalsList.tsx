import React from 'react';
import { DAILY_GOALS_DEFINITION, DailyGoalId, DailyGoalsState } from '../types/daily';
import { GoalItem } from './GoalItem';

interface DailyGoalsListProps {
  goals: DailyGoalsState;
  onToggleGoal: (id: DailyGoalId) => void;
  gateSubtitle?: string;
  gateBadge?: string;
  onNavigateToGateConnection?: () => void;
}

export const DailyGoalsList: React.FC<DailyGoalsListProps> = ({
  goals,
  onToggleGoal,
  gateSubtitle,
  gateBadge,
  onNavigateToGateConnection,
}) => {
  const completedCount = Object.values(goals).filter(Boolean).length;

  return (
    <section id="daily-goals-container" className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#736B5E]">
            Daily Core Protocol
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAE2D2] text-[#252522] border border-[#DDD6C8] font-bold">
            {completedCount} / 5
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#8C8271] hidden sm:inline">
          Tap card or checkbox to check off
        </span>
      </div>

      <div className="space-y-2.5">
        {DAILY_GOALS_DEFINITION.map((definition, idx) => {
          const isGate = definition.id === 'gate';
          return (
            <GoalItem
              key={definition.id}
              index={idx + 1}
              definition={definition}
              isCompleted={Boolean(goals[definition.id])}
              onToggle={onToggleGoal}
              customSubtitle={isGate ? gateSubtitle : undefined}
              customBadge={isGate ? gateBadge : undefined}
              onSubtitleAction={isGate ? onNavigateToGateConnection : undefined}
            />
          );
        })}
      </div>
    </section>
  );
};

