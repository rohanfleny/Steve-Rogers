import React, { useState } from 'react';
import {
  Pencil,
  Plus,
  Minus,
  Sparkles,
  Check,
  Moon,
  AlertCircle,
} from 'lucide-react';
import { DailyRecord } from '../../types/daily';
import { getTodayDateString, shiftDate } from '../../logic/calculations';

interface SleepTrackerViewProps {
  selectedDate: string;
  allRecords: Record<string, DailyRecord>;
  sleepTargetHours: number;
  onUpdateSleep: (hours: number | null) => void;
  onUpdateTarget?: (target: number) => void;
}

export const SleepTrackerView: React.FC<SleepTrackerViewProps> = ({
  selectedDate,
  allRecords,
  sleepTargetHours,
  onUpdateSleep,
  onUpdateTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Get sleep for current selectedDate
  const currentRecord = allRecords[selectedDate];
  const currentSleep = currentRecord?.sleepHours ?? null;

  // Calculate 7-day week records (ending on selectedDate or current week)
  // Let's get Mon..Sun or the 7 days ending with selectedDate
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Find Monday of the week containing selectedDate
  const [y, m, d] = selectedDate.split('-').map(Number);
  const currentDateObj = new Date(y, m - 1, d);
  // day of week: 0 is Sun, 1 is Mon...
  const dayOfWeek = currentDateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const mondayDateStr = shiftDate(selectedDate, diffToMonday);

  const weekData = weekDays.map((label, idx) => {
    const dateStr = shiftDate(mondayDateStr, idx);
    const rec = allRecords[dateStr];
    const hours = rec?.sleepHours ?? 0;
    return {
      label,
      dateStr,
      hours,
      isTargetMet: hours >= sleepTargetHours,
      isSelected: dateStr === selectedDate,
    };
  });

  // Calculate Weekly Average from logged days in week
  const loggedDays = weekData.filter((d) => d.hours > 0);
  const weeklyAvg =
    loggedDays.length > 0
      ? Math.round(
          (loggedDays.reduce((acc, cur) => acc + cur.hours, 0) / loggedDays.length) * 10
        ) / 10
      : currentSleep ?? sleepTargetHours;

  const handleAdjustSleep = (delta: number) => {
    const base = currentSleep !== null ? currentSleep : sleepTargetHours;
    const next = Math.max(0, Math.min(24, Math.round((base + delta) * 10) / 10));
    onUpdateSleep(next);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customInput);
    if (!isNaN(val) && val >= 0 && val <= 24) {
      onUpdateSleep(Math.round(val * 10) / 10);
    }
    setIsEditingCustom(false);
  };

  const isGood = currentSleep !== null && currentSleep >= sleepTargetHours;

  return (
    <div
      id="sleep-tracker-view"
      className="space-y-4 font-handwriting text-[#1B3A57]"
    >
      {/* 1. Top Cards Side-by-Side: Today's Sleep & Target */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Sleep Card */}
        <div className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm flex flex-col justify-between text-[#1B3A57]">
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B] block uppercase tracking-wider font-fancy">
              Today's Sleep
            </span>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#1B3A57]">
                {currentSleep !== null ? currentSleep.toFixed(1) : '—'}
              </span>
              <span className="text-sm text-[#64748B]">hours</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#D6DCE8] mt-2">
            <span
              className={`text-xs font-notes flex items-center gap-1 font-semibold ${
                isGood ? 'text-[#9B1B30]' : 'text-[#9B1B30]'
              }`}
            >
              {isGood ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Good !
                </>
              ) : currentSleep !== null ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Need rest
                </>
              ) : (
                'Not logged'
              )}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustSleep(-0.5)}
                className="w-6 h-6 rounded-md bg-[#EEF2F6] text-[#1B3A57] flex items-center justify-center hover:bg-[#E8EDF3] transition-colors cursor-pointer border border-[#D6DCE8]"
                title="Decrease 0.5h"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSleep(0.5)}
                className="w-6 h-6 rounded-md bg-[#EEF2F6] text-[#1B3A57] flex items-center justify-center hover:bg-[#E8EDF3] transition-colors cursor-pointer border border-[#D6DCE8]"
                title="Increase 0.5h"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Target Card */}
        <div className="bg-[#FAF7F0] border border-[#D6DCE8] rounded-2xl p-4 shadow-sm flex flex-col justify-between text-[#1B3A57]">
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#64748B] block uppercase tracking-wider font-fancy">
              Target
            </span>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#1B3A57]">
                {sleepTargetHours.toFixed(1)}
              </span>
              <span className="text-sm text-[#64748B]">h</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D6DCE8] mt-2 flex items-center gap-1.5 text-xs font-notes text-[#64748B]">
            <Sparkles className="w-3.5 h-3.5 text-[#9B1B30]" />
            <span>Keep it consistent.</span>
          </div>
        </div>
      </div>

      {/* 2. Weekly Average Card */}
      <div className="bg-[#1B3A57] border border-[#1B3A57] rounded-2xl p-4 sm:p-5 shadow-sm text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider block font-fancy">
              Weekly Average
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white">
                {weeklyAvg.toFixed(1)}
              </span>
              <span className="text-base text-white/80 font-mono">hours</span>
            </div>
            <p className="text-sm sm:text-base font-notes text-[#F5E4E7] mt-1 font-semibold">
              {weeklyAvg >= sleepTargetHours
                ? 'Good recovery this week.'
                : 'Aim for 7+ hours for optimal recovery.'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <Moon className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* 3. This Week Graph Card */}
      <div className="bg-[#9B1B30] border border-[#9B1B30] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white font-fancy">
            This Week
          </h3>
          <span className="text-xs sm:text-sm text-white/80">
            Target: {sleepTargetHours}h / night
          </span>
        </div>

        <div className="bg-[#FAF7F0] rounded-xl p-3">
          <div className="pt-2 pb-2">
            <div className="relative h-36 border-b-2 border-[#D6DCE8]">
              <div
                className="absolute left-0 right-0 border-b border-dashed border-[#9AA8BE] z-0 pointer-events-none flex justify-end"
                style={{ bottom: `${(sleepTargetHours / 10) * 100}%` }}
              >
                <span className="text-[10px] font-mono text-[#64748B] bg-[#FAF7F0] px-1 -translate-y-1/2">
                  Target {sleepTargetHours}h
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-full relative z-10 px-1">
                {weekData.map((day) => {
                  const maxScale = 10;
                  const heightPercent = Math.min(
                    100,
                    Math.max(0, (day.hours / maxScale) * 100)
                  );

                  return (
                    <div
                      key={day.dateStr}
                      className="flex flex-col items-center h-full justify-end"
                    >
                      <span className="text-xs font-mono text-[#1B3A57] mb-1 font-semibold">
                        {day.hours > 0 ? day.hours.toFixed(1) : '—'}
                      </span>

                      <div
                        className={`w-5 sm:w-6 rounded-t-md transition-all duration-300 ${
                          day.hours >= sleepTargetHours
                            ? 'bg-[#9B1B30]'
                            : day.hours > 0
                            ? 'bg-[#1B3A57]'
                            : 'h-[2px] bg-[#D6DCE8] w-4'
                        }`}
                        style={{
                          height: day.hours > 0 ? `${heightPercent}%` : '2px',
                          minHeight: day.hours > 0 ? '6px' : '2px',
                        }}
                        title={`${day.label}: ${
                          day.hours > 0 ? `${day.hours}h` : 'No log'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 px-1 pt-2">
              {weekData.map((day) => (
                <div key={day.dateStr} className="text-center">
                  <span
                    className={`text-xs sm:text-sm font-handwriting block ${
                      day.isSelected
                        ? 'font-bold text-[#9B1B30] underline decoration-[#9B1B30]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
