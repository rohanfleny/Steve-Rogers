import React from 'react';
import {
  Check,
  GraduationCap,
  BookOpen,
  Dumbbell,
  Code2,
  Languages,
  Layers,
} from 'lucide-react';
import { DailyGoalDefinition, DailyGoalId } from '../types/daily';

interface GoalItemProps {
  index: number;
  definition: DailyGoalDefinition;
  isCompleted: boolean;
  onToggle: (id: DailyGoalId) => void;
  customSubtitle?: string;
  customBadge?: string;
  onSubtitleAction?: () => void;
}

const GOAL_ICONS: Record<DailyGoalId, React.ElementType> = {
  gate: GraduationCap,
  academics: BookOpen,
  exercise: Dumbbell,
  project: Code2,
  english: Languages,
};

export const GoalItem: React.FC<GoalItemProps> = ({
  index,
  definition,
  isCompleted,
  onToggle,
  customSubtitle,
  customBadge,
  onSubtitleAction,
}) => {
  const Icon = GOAL_ICONS[definition.id] || BookOpen;

  const handleToggle = () => {
    onToggle(definition.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(definition.id);
    }
  };

  return (
    <div
      id={`goal-item-${definition.id}`}
      role="checkbox"
      aria-checked={isCompleted}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`group w-full rounded-2xl p-4 sm:p-4.5 transition-all duration-150 cursor-pointer select-none border flex items-center justify-between gap-3 sm:gap-4 ${
        isCompleted
          ? 'bg-[#F2F6F3] border-[#C8DACD] shadow-2xs'
          : 'bg-[#FCFAF6] border-[#E5DFD3] hover:border-[#D0C8B8] hover:bg-[#FAF6EE] shadow-2xs'
      }`}
    >
      {/* Left: Tactile Checkbox + Category Icon + Title + Target */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {/* Tactile Stamp Checkbox */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(definition.id);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0 border ${
            isCompleted
              ? 'bg-[#607C68] border-[#4E6755] text-[#FAF7F0] shadow-2xs scale-100'
              : 'bg-[#FAF7F0] border-[#D5CCBA] text-transparent group-hover:border-[#9A8F7C]'
          }`}
        >
          <Check
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3] ${
              isCompleted ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>

        {/* Category Icon */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors border ${
            isCompleted
              ? 'bg-[#E1EDE4] border-[#CFDFD3] text-[#4A6953]'
              : 'bg-[#EAE2D2] border-[#DDD6C8] text-[#5A5347] group-hover:text-[#252522]'
          }`}
        >
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>

        {/* Goal Title & Target */}
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-xs font-mono text-[#8C8271] font-semibold">
              0{index}.
            </span>
            <span
              className={`text-base sm:text-lg font-bold tracking-tight font-serif-heading ${
                isCompleted
                  ? 'text-[#4A6953] line-through decoration-[#7A9983] decoration-2'
                  : 'text-[#252522]'
              }`}
            >
              {definition.title}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold whitespace-nowrap border ${
                isCompleted
                  ? 'bg-[#E1EDE4] text-[#4A6953] border-[#CFDFD3]'
                  : 'bg-[#EAE2D2] text-[#4A5868] border-[#DDD6C8]'
              }`}
            >
              {definition.target}
            </span>
            {customBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EAE2D2] text-[#252522] border border-[#DDD6C8]">
                <Layers className="w-3 h-3 text-[#736B5E]" />
                <span>{customBadge}</span>
              </span>
            )}
          </div>

          <p
            className={`text-xs mt-0.5 truncate max-w-[280px] sm:max-w-md ${
              isCompleted ? 'text-[#607C68]' : 'text-[#736B5E]'
            }`}
          >
            {customSubtitle || definition.description}
          </p>
        </div>
      </div>

      {/* Right side: status indicator */}
      <div className="shrink-0 flex items-center">
        {isCompleted ? (
          <span className="hidden sm:inline-flex items-center text-xs font-mono font-semibold text-[#4A6953] bg-[#E1EDE4] px-2.5 py-1 rounded-lg border border-[#CFDFD3]">
            ✓ Done
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center text-xs font-mono text-[#8C8271] group-hover:text-[#252522] px-2 py-1">
            Mark protocol
          </span>
        )}
      </div>
    </div>
  );
};

