import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Dumbbell,
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
      {/* =====================================================
          DATE WINDOW
          ===================================================== */}
      <div
        id="date-window-container"
        className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2 sm:p-2.5 shadow-sm space-y-1.5 select-none text-[#1B3A57]"
      >
        {/* Top Navigator Row */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            id="prev-date-btn"
            onClick={() => onSelectDate(shiftDate(selectedDate, -1))}
            className="p-1.5 rounded-lg text-[#9B1B30] hover:text-[#761523] hover:bg-[#F5E4E7] transition-colors cursor-pointer shrink-0"
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
              className="group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#D6DCE8] hover:border-[#9B1B30] bg-[#F1ECE1] hover:bg-[#F5E4E7] transition-all cursor-pointer shadow-xs min-w-0"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#9B1B30] shrink-0" />

              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#1B3A57] text-white">
                  {weekdayShort}
                </span>

                <span className="text-xs sm:text-sm font-bold text-[#1B3A57] truncate">
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
              <span className="text-[9px] font-bold text-white bg-[#9B1B30] border border-[#9B1B30] px-2 py-0.5 rounded-full shrink-0">
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
                className="flex items-center gap-1 text-[9px] font-bold text-[#1B3A57] bg-[#F1ECE1] hover:bg-[#E8E1D4] border border-[#D6DCE8] px-2 py-0.5 rounded-full transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-2.5 h-2.5 text-[#9B1B30]" />
                <span>Today</span>
              </button>
            )}
          </div>

          <button
            type="button"
            id="next-date-btn"
            onClick={() => onSelectDate(shiftDate(selectedDate, 1))}
            className="p-1.5 rounded-lg text-[#9B1B30] hover:text-[#761523] hover:bg-[#F5E4E7] transition-colors cursor-pointer shrink-0"
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
                  ? 'bg-[#1B3A57] text-white shadow-md font-bold scale-[1.01]'
                  : item.isDayToday
                  ? 'bg-[#F5E4E7] text-[#9B1B30] font-bold border border-[#E1B9C0] hover:bg-[#F0DCE0]'
                  : 'hover:bg-[#EFE9DF] text-[#78716C]'
              }`}
            >
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-wider ${
                  item.isSelected
                    ? 'text-white/80 font-semibold'
                    : item.isDayToday
                    ? 'text-[#9B1B30]'
                    : 'text-[#78716C]'
                }`}
              >
                {item.dayName.slice(0, 3)}
              </span>

              <span
                className={`text-xs sm:text-sm font-mono font-bold leading-tight ${
                  item.isSelected
                    ? 'text-white'
                    : item.isDayToday
                    ? 'text-[#9B1B30]'
                    : 'text-[#1B3A57]'
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
                        ? 'bg-white'
                        : 'bg-[#9B1B30]'
                    }`}
                  />
                ) : item.hasSomeDone ? (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isSelected
                        ? 'bg-white/70'
                        : 'bg-[#1B3A57]'
                    }`}
                  />
                ) : item.isDayToday ? (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isSelected
                        ? 'bg-white/60'
                        : 'bg-[#9B1B30]'
                    }`}
                  />
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          TODAY'S WORK
          Blue outer section + warm/white inner area
          ===================================================== */}
      <div
        id="daily-checklist-card"
        className="bg-[#1B3A57] border border-[#1B3A57] rounded-xl p-2.5 sm:p-3 shadow-sm space-y-0.5 text-white"
      >
        <div className="pb-1.5 border-b border-white/20">
          <h2 className="text-xs font-bold text-white tracking-wider uppercase font-fancy">
            TODAY'S WORK
          </h2>
        </div>

        {/* Core 5 Goals */}
        <div className="bg-[#FAF7F0] rounded-lg mt-1.5 p-1.5 space-y-0.5">
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
                  isDone
                    ? 'bg-[#F5E4E7]'
                    : 'hover:bg-[#EEF2F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Compact Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-[#9B1B30] border-[#9B1B30] text-white'
                        : 'bg-[#E8EDF3] border-[#D6DCE8] text-[#1B3A57]'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>

                  {/* Title & Subtext */}
                  <div className="min-w-0">
                    <span
                      className={`text-sm sm:text-base font-bold leading-tight block truncate ${
                        isDone
                          ? 'text-[#9B1B30] line-through decoration-[#9B1B30]'
                          : 'text-[#1B3A57]'
                      }`}
                    >
                      {displayTitle}
                    </span>

                    <p className="text-[11px] sm:text-xs text-[#64748B] leading-tight">
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
          <div className="my-1 border-t border-[#D6DCE8]" />

          {/* Sleep Row */}
          <div
            onClick={onNavigateToSleep}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#EEF2F6] transition-colors cursor-pointer min-h-[42px]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#E8EDF3] border border-[#D6DCE8] text-[#1B3A57] flex items-center justify-center shrink-0">
                <Bed className="w-4 h-4 stroke-[2]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold text-[#1B3A57] leading-tight">
                    Sleep
                  </span>

                  <span className="text-[11px] sm:text-xs font-mono text-[#64748B]">
                    {sleepHours !== null
                      ? `${sleepHours.toFixed(1)} hrs`
                      : 'Log sleep'}
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-[#64748B] leading-tight">
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
              className="p-1.5 rounded-lg text-[#9B1B30] hover:text-[#761523] hover:bg-[#F5E4E7] transition-colors"
              title="Edit sleep hours"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          QUICK SLEEP EDIT DIALOG
          ===================================================== */}
      {isEditingSleep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111C]/75 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 font-handwriting text-[#1B3A57]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1B3A57]">
                Log Sleep Hours
              </h3>

              <button
                type="button"
                onClick={() => setIsEditingSleep(false)}
                className="text-[#9B1B30] hover:text-[#761523] text-base p-1 cursor-pointer"
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
                  className="w-full text-2xl font-mono text-center bg-[#F1ECE1] border border-[#D6DCE8] rounded-xl py-2 text-[#1B3A57] focus:outline-none focus:border-[#9B1B30]"
                />

                <span className="text-base text-[#64748B]">
                  hours
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSleep(false)}
                  className="px-4 py-2 rounded-xl border border-[#D6DCE8] text-sm text-[#1B3A57] hover:bg-[#E8EDF3] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9B1B30] text-white text-sm font-bold hover:bg-[#761523] shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TODAY'S PROGRESS
          Red outer section + warm/white inner area
          ===================================================== */}
      <div className="bg-[#9B1B30] border border-[#9B1B30] rounded-xl p-2.5 sm:p-3 shadow-sm space-y-1.5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-white">
            Today's Progress
          </span>

          <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-white">
            <span>
              {completedGoalsCount} / 5
            </span>

            <span>
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* White progress area */}
        <div className="bg-[#FAF7F0] rounded-lg p-1.5">
          <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#D6DCE8]">
            <div
              className="h-full rounded-full transition-all duration-300 bg-[#1B3A57]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
