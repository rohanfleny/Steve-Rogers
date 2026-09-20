import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import {
  shiftDate,
  getRelativeDateLabel,
  formatFullDate,
  getTodayDateString,
  getDateStripRange,
  calculateDailyProgress,
} from '../logic/calculations';
import { DailyRecord } from '../types/daily';

interface DateBarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  allRecords: Record<string, DailyRecord>;
}

export const DateBar: React.FC<DateBarProps> = ({
  selectedDate,
  onSelectDate,
  allRecords,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const relativeLabel = getRelativeDateLabel(selectedDate);
  const fullDateLabel = formatFullDate(selectedDate);
  const dateStrip = getDateStripRange(selectedDate, 3, 3);

  const handlePrevDay = () => {
    onSelectDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onSelectDate(shiftDate(selectedDate, 1));
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
    }
  };

  return (
    <div
      id="date-navigator-card"
      className="w-full bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4 sm:p-4.5 shadow-2xs space-y-3"
    >
      {/* Top row: Prev, Current Date, Next, and Today jump */}
      <div className="flex items-center justify-between gap-2">
        <button
          id="prev-day-btn"
          type="button"
          onClick={handlePrevDay}
          className="p-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] transition-colors flex items-center justify-center shrink-0"
          aria-label="Previous Day"
          title="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-[#252522] font-serif-heading tracking-tight">
              {relativeLabel}
            </span>
            {!isToday && (
              <button
                id="jump-to-today-btn"
                type="button"
                onClick={() => onSelectDate(today)}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F8EFE9] text-[#B65C52] border border-[#E9CFC7] hover:bg-[#F2E4DC] transition-colors"
                title="Jump to today"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>
            )}
          </div>
          <span className="text-xs sm:text-sm text-[#736B5E] font-medium truncate max-w-[240px] sm:max-w-none">
            {fullDateLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="next-day-btn"
            type="button"
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] transition-colors flex items-center justify-center"
            aria-label="Next Day"
            title="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <label
            id="date-picker-label"
            htmlFor="date-picker-input"
            className="p-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] cursor-pointer transition-colors flex items-center justify-center relative"
            title="Select specific date from calendar"
          >
            <CalendarIcon className="w-4 h-4" />
            <input
              id="date-picker-input"
              type="date"
              value={selectedDate}
              onChange={handleDatePickerChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Date Strip: 7 days centered on selectedDate */}
      <div
        id="date-strip"
        className="grid grid-cols-7 gap-1 sm:gap-2 pt-3 border-t border-[#EAE2D2]"
      >
        {dateStrip.map((dateStr) => {
          const isSelected = dateStr === selectedDate;
          const isStripToday = dateStr === today;
          const [y, m, d] = dateStr.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'narrow' });
          const dayNum = dateObj.getDate();

          const record = allRecords[dateStr];
          const progress = calculateDailyProgress(record?.goals);
          const hasGoals = progress.completedCount > 0;
          const is5of5 = progress.completedCount === 5;
          const hasSleep = record?.sleepHours !== null && record?.sleepHours !== undefined;

          return (
            <button
              key={dateStr}
              id={`date-strip-btn-${dateStr}`}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative border ${
                isSelected
                  ? 'bg-[#252522] text-[#FAF7F0] border-[#1E1E1C] shadow-xs'
                  : 'bg-[#FAF7F0]/60 border-[#E5DFD3] hover:bg-[#EAE2D2] text-[#5A5347]'
              }`}
            >
              <span
                className={`text-[10px] font-mono font-semibold tracking-wider uppercase ${
                  isSelected ? 'text-[#D5CCBA]' : 'text-[#8C8271]'
                }`}
              >
                {dayName}
              </span>
              <span className="text-sm sm:text-base font-bold my-0.5 font-mono">
                {dayNum}
              </span>

              {/* Status ink dots */}
              <div className="flex items-center gap-1 h-2">
                {is5of5 ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#98C4A3]' : 'bg-[#607C68]'
                    }`}
                    title="5/5 Protocols Completed"
                  />
                ) : hasGoals ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#E3BE7C]' : 'bg-[#C98E3D]'
                    }`}
                    title={`${progress.completedCount}/5 Protocols Completed`}
                  />
                ) : hasSleep ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#98A8B8]' : 'bg-[#4A5868]'
                    }`}
                    title="Sleep logged"
                  />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white/20' : 'bg-[#DDD6C8]'
                    }`}
                  />
                )}
              </div>

              {isStripToday && !isSelected && (
                <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-[#B65C52]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

