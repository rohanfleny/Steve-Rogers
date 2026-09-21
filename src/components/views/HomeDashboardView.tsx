import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Dumbbell,
  Shield,
  Laptop,
  MessageSquare,
  Bed,
  Pencil,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';
import {
  DailyGoalId,
  DailyRecord,
  DAILY_GOALS_DEFINITION,
  UserSettings,
  getGoalTitle,
  getGoalTarget,
} from '../../types/daily';
import { HandwrittenCheckbox } from '../HandwrittenDoodles';
import { shiftDate, getTodayDateString } from '../../logic/calculations';

interface HomeDashboardViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentRecord: DailyRecord;
  onToggleGoal: (id: DailyGoalId) => void;
  gateSubtitle?: string;
  gateBadge?: string;
  onNavigateToGate: () => void;
  onNavigateToSleep: () => void;
  sleepHours: number | null;
  sleepTargetHours: number;
  onUpdateSleep: (hours: number | null) => void;
  onSaveNote?: (note: string) => void;
  dailyNote?: string;
  allRecords?: Record<string, DailyRecord>;
  settings: UserSettings;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  selectedDate,
  onSelectDate,
  currentRecord,
  onToggleGoal,
  onNavigateToSleep,
  sleepHours,
  sleepTargetHours,
  onUpdateSleep,
  allRecords,
  settings,
}) => {
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [tempSleepHours, setTempSleepHours] = useState(
    sleepHours !== null ? String(sleepHours) : '7.0'
  );

  const todayDate = getTodayDateString();
  const isToday = selectedDate === todayDate;

  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenDatePicker = () => {
    try {
      if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.focus();
        dateInputRef.current?.click();
      }
    } catch {
      dateInputRef.current?.focus();
      dateInputRef.current?.click();
    }
  };

  // Format date parts
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  const weekdayShort = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
  });

  const monthShort = dateObj.toLocaleDateString('en-US', {
    month: 'short',
  });

  // Compute 7 days of current week (Monday to Sunday)
  const dayOfWeek = dateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDateStr = shiftDate(selectedDate, diffToMonday);

  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const dStr = shiftDate(mondayDateStr, offset);
    const [y, m, d] = dStr.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);

    const dayName = dObj.toLocaleDateString('en-US', {
      weekday: 'short',
    });

    const dayNum = dObj.getDate();
    const isSelected = dStr === selectedDate;
    const isDayToday = dStr === todayDate;

    const rec = allRecords ? allRecords[dStr] : undefined;

    const completedGoals = rec
      ? DAILY_GOALS_DEFINITION.filter(
          (def) => rec.goals[def.id] === true
        ).length
      : 0;

    const isAllDone = completedGoals === 5;
    const hasSomeDone = completedGoals > 0;

    return {
      dateStr: dStr,
      dayName,
      dayNum,
      isSelected,
      isDayToday,
      completedGoals,
      isAllDone,
      hasSomeDone,
    };
  });

  // Calculate 5/5 goals progress
  const completedGoalsCount = DAILY_GOALS_DEFINITION.filter(
    (def) => currentRecord.goals[def.id] === true
  ).length;

  const progressPercent = Math.round((completedGoalsCount / 5) * 100);

  // Icon mapping
  const goalIcons: Record<DailyGoalId, React.ElementType> = {
    gate: GraduationCap,
    academics: BookOpen,
    exercise: Dumbbell,
    project: Laptop,
    english: MessageSquare,
  };

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = parseFloat(tempSleepHours);

    if (!isNaN(parsed) && parsed >= 0 && parsed <= 24) {
      onUpdateSleep(Math.round(parsed * 10) / 10);
    }

    setIsEditingSleep(false);
  };

  return (
    <div
      id="home-dashboard"
      className="space-y-2.5 sm:space-y-3 font-handwriting"
    >
      {/* Date Window */}
      <div
        id="date-window-container"
        className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2 sm:p-2.5 shadow-sm space-y-1.5 select-none text-[#1C1917]"
      >
        {/* Top Navigator Row */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            id="prev-date-btn"
            onClick={() => onSelectDate(shiftDate(selectedDate, -1))}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFE9DF] transition-colors cursor-pointer shrink-0"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Central Interactive Date Capsule */}
          <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
            <button
              type="button"
              id="date-picker-trigger"
              onClick={handleOpenDatePicker}
              title="Click to select date"
              className="group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#DDD4C5] hover:border-[#BDB3A1] bg-[#F1ECE1] hover:bg-[#E8E0D2] transition-all cursor-pointer shadow-xs min-w-0"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#78716C] shrink-0" />

              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#E5DDD0] text-[#44403C]">
                  {weekdayShort}
                </span>

                <span className="text-xs sm:text-sm font-bold text-[#1C1917] truncate">
                  {day} {monthShort} {year}
                </span>
              </div>
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                }
              }}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />

            {isToday ? (
              <span className="text-[9px] font-bold text-[#1E3A24] bg-[#D8EADB] border border-[#B9D9BE] px-2 py-0.5 rounded-full shrink-0">
                Today
              </span>
            ) : (
              <button
                type="button"
                id="jump-to-today-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDate(todayDate);
                }}
                title="Jump to today"
                className="flex items-center gap-1 text-[9px] font-bold text-[#1C1917] bg-[#EAE2D7] hover:bg-[#DDD4C5] border border-[#DDD4C5] px-2 py-0.5 rounded-full transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Today</span>
              </button>
            )}
          </div>

          <button
            type="button"
            id="next-date-btn"
            onClick={() => onSelectDate(shiftDate(selectedDate, 1))}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFE9DF] transition-colors cursor-pointer shrink-0"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Interactive 7-Day Week Strip */}
        <div className="grid grid-cols-7 gap-0.5 pt-1 border-t border-[#E5DDD0]">
          {weekDays.map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer relative ${
                item.isSelected
                  ? 'bg-[#1C1917] text-[#FAF7F0] shadow-md font-bold scale-[1.01]'
                  : item.isDayToday
                  ? 'bg-[#E5DDD0] text-[#1E3A24] font-bold border border-[#B9D9BE] hover:bg-[#DDD5C7]'
                  : 'hover:bg-[#EFE9DF] text-[#78716C]'
              }`}
            >
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-wider ${
                  item.isSelected
                    ? 'text-[#D6CEBF] font-semibold'
                    : 'text-[#78716C]'
                }`}
              >
                {item.dayName.slice(0, 3)}
              </span>

              <span
                className={`text-xs sm:text-sm font-mono font-bold leading-tight ${
                  item.isSelected
                    ? 'text-[#FAF7F0]'
                    : 'text-[#1C1917]'
                }`}
              >
                {item.dayNum}
              </span>

              {/* Status indicator dot */}
              <div className="flex items-center gap-0.5 mt-0 h-1">
                {item.isAllDone ? (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isSelected
                        ? 'bg-emerald-300'
                        : 'bg-emerald-600'
                    }`}
                  />
                ) : item.hasSomeDone ? (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isSelected
                        ? 'bg-amber-300'
                        : 'bg-amber-600'
                    }`}
                  />
                ) : item.isDayToday ? (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isSelected
                        ? 'bg-zinc-400'
                        : 'bg-zinc-500'
                    }`}
                  />
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#EAF1FF] border border-[#B8C7E6]">
  <Shield className="w-5 h-5 text-blue-700 shrink-0" />

  <p className="text-sm sm:text-base font-fancy font-bold text-[#1C1917] text-center">
    “I can do this all day.”
  </p>
</div>

      {/* Checklist Card */}
      <div
        id="daily-checklist-card"
        className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2.5 sm:p-3 shadow-sm space-y-0.5 text-[#1C1917]"
      >
        <div className="pb-1 border-b border-[#E5DDD0]">
          <h2 className="text-xs font-bold text-[#78716C] tracking-wider uppercase font-fancy">
            TODAY'S WORK
          </h2>
        </div>

        {/* Core 5 Goals */}
        {DAILY_GOALS_DEFINITION.map((goal) => {
          const isDone = currentRecord.goals[goal.id] === true;
          const Icon = goalIcons[goal.id];

          const displayTitle = getGoalTitle(goal.id, settings);
          const subtext = getGoalTarget(goal.id, settings);

          return (
            <div
              key={goal.id}
              onClick={() => onToggleGoal(goal.id)}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer min-h-[42px] ${
                isDone ? 'bg-[#EDE7DC]/70' : 'hover:bg-[#F1ECE1]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Compact Icon */}
                <div className="w-7 h-7 rounded-lg bg-[#F1ECE1] border border-[#DDD5C7] text-[#2D2A26] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>

                {/* Title & Subtext */}
                <div className="min-w-0">
                  <span
                    className={`text-sm sm:text-base font-bold leading-tight block truncate ${
                      isDone
                        ? 'text-[#8C827A] line-through decoration-[#A89F95]'
                        : 'text-[#1C1917]'
                    }`}
                  >
                    {displayTitle}
                  </span>

                  <p className="text-[11px] sm:text-xs text-[#78716C] leading-tight">
                    {subtext}
                  </p>
                </div>
              </div>

              {/* Handwritten Checkbox */}
              <HandwrittenCheckbox
                checked={isDone}
                onChange={() => onToggleGoal(goal.id)}
                color="sage"
                size="sm"
              />
            </div>
          );
        })}

        {/* Thin divider before Sleep row */}
        <div className="my-1 border-t border-[#E5DDD0]" />

        {/* Sleep Row */}
        <div
          onClick={onNavigateToSleep}
          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F1ECE1] transition-colors cursor-pointer min-h-[42px]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F1ECE1] border border-[#DDD5C7] text-[#2D2A26] flex items-center justify-center shrink-0">
              <Bed className="w-4 h-4 stroke-[2]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-[#1C1917] leading-tight">
                  Sleep
                </span>

                <span className="text-[11px] sm:text-xs font-mono text-[#78716C]">
                  {sleepHours !== null
                    ? `${sleepHours.toFixed(1)} hrs`
                    : 'Log sleep'}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-[#78716C] leading-tight">
                Target {sleepTargetHours} h
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingSleep(true);
              setTempSleepHours(
                sleepHours !== null ? String(sleepHours) : '7.0'
              );
            }}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#E5DDD0] transition-colors"
            title="Edit sleep hours"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Sleep Edit Dialog / Popover */}
      {isEditingSleep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border border-[#DDD5C7] rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 font-handwriting text-[#1C1917]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1C1917]">
                Log Sleep Hours
              </h3>

              <button
                type="button"
                onClick={() => setIsEditingSleep(false)}
                className="text-[#78716C] hover:text-[#1C1917] text-base p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSleepSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={tempSleepHours}
                  onChange={(e) => setTempSleepHours(e.target.value)}
                  className="w-full text-2xl font-mono text-center bg-[#F1ECE1] border border-[#DDD5C7] rounded-xl py-2 text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />

                <span className="text-base text-[#78716C]">
                  hours
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSleep(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-sm text-[#57534E] hover:bg-[#E8E1D4] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-white text-sm font-bold hover:bg-black shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Today's Progress Bar */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2.5 sm:p-3 shadow-sm space-y-1.5 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-[#1C1917]">
            Today's Progress
          </span>

          <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-[#1C1917]">
            <span>
              {completedGoalsCount} / 5
            </span>

            <span className="text-emerald-700">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#DDD5C7]">
          <div
            className="h-full rounded-full transition-all duration-300 bg-emerald-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
