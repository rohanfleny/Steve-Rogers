import React, { useState } from 'react';
import { DailyRecord, DAILY_GOALS_DEFINITION, DailyGoalId } from '../../types/daily';
import { shiftDate, calculateDailyProgress, getTodayDateString } from '../../logic/calculations';

interface AnalyticsViewProps {
  allRecords: Record<string, DailyRecord>;
  selectedDate: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  allRecords,
  selectedDate,
}) => {
  const today = getTodayDateString();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Find Monday of the current week (or week around selectedDate)
  const [y, m, d] = selectedDate.split('-').map(Number);
  const currentDateObj = new Date(y, m - 1, d);
  const dayOfWeek = currentDateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDateStr = shiftDate(selectedDate, diffToMonday);

  // Generate the 7 dates of the week
  const weekDates = weekDays.map((label, idx) => ({
    label,
    dateStr: shiftDate(mondayDateStr, idx),
  }));

  // Matrix of habits for the week
  const habitRows: { id: DailyGoalId; label: string }[] = [
    { id: 'gate', label: 'GATE' },
    { id: 'academics', label: 'Academics' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'project', label: 'Project' },
    { id: 'english', label: 'English' },
  ];

  // Calculate habit stats for this week
  const habitStats = habitRows.map((h) => {
    let completedCount = 0;
    weekDates.forEach((d) => {
      const rec = allRecords[d.dateStr];
      if (rec?.goals?.[h.id] === true) {
        completedCount++;
      }
    });
    const percent = Math.round((completedCount / 7) * 100);
    return {
      ...h,
      completedCount,
      percent,
    };
  });

  // 30 Days Heatmap calculations
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const dateStr = shiftDate(today, -(29 - i));
    const rec = allRecords[dateStr];
    const { completedCount } = calculateDailyProgress(rec?.goals);
    return {
      dateStr,
      completedCount,
    };
  });

  const fullDaysCount = last30Days.filter((d) => d.completedCount >= 4).length;
  const partialDaysCount = last30Days.filter(
    (d) => d.completedCount >= 2 && d.completedCount <= 3
  ).length;
  const lowDaysCount = last30Days.filter((d) => d.completedCount <= 1).length;

  return (
    <div id="analytics-view" className="space-y-4 sm:space-y-5 font-handwriting text-[#1C1917]">
      {/* 1. Habit Completion (Full 7-Day Week: Mon - Sun) */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
            Habit Completion (This Week)
          </h3>
          <span className="text-xs sm:text-sm text-[#78716C] font-mono">
            Mon – Sun
          </span>
        </div>

        {/* 7-Day Matrix Table */}
        <div className="overflow-x-auto pb-1">
          <table className="w-full border-collapse text-left min-w-[320px]">
            <thead>
              <tr>
                <th className="pb-2 pr-2 text-xs sm:text-sm text-[#78716C] font-normal w-24">Habit</th>
                {weekDates.map((d) => (
                  <th
                    key={d.dateStr}
                    className="pb-2 px-1 text-center text-xs sm:text-sm text-[#78716C] font-semibold font-mono"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-2">
              {habitRows.map((habit) => (
                <tr key={habit.id} className="h-8 border-t border-[#E5DDD0]">
                  <td className="pr-2 text-sm sm:text-base font-bold text-[#1C1917] whitespace-nowrap">
                    {habit.label}
                  </td>
                  {weekDates.map((d) => {
                    const isCompleted = allRecords[d.dateStr]?.goals?.[habit.id] === true;
                    return (
                      <td key={d.dateStr} className="px-1 text-center">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md mx-auto transition-colors flex items-center justify-center ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#F1ECE2] border border-[#DDD5C7] text-transparent'
                          }`}
                          title={`${habit.label}: ${isCompleted ? 'Done' : 'Missed'} on ${d.label}`}
                        >
                          {isCompleted && <span className="text-[11px] font-bold">✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Circular Completion Rates - Full width across 5 habits */}
        <div className="pt-3 border-t border-[#E5DDD0]">
          <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center w-full">
            {habitStats.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#DDD5C7] bg-[#F1ECE2] flex items-center justify-center mb-1 transition-transform hover:scale-105 shadow-xs">
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#1C1917]">
                    {stat.percent}%
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#78716C] leading-tight block text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Completion Rate (Last 30 Days) Heatmap */}
      <div className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-[#1C1917]">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] font-fancy">
            Daily Completion Rate (Last 30 Days)
          </h3>
        </div>

        {/* 30-Day Heatmap Grid */}
        <div className="p-3 bg-[#F1ECE2] border border-[#DDD5C7] rounded-xl">
          <div className="grid grid-cols-10 gap-2">
            {last30Days.map((day) => {
              let bg = 'bg-[#DDD5C7]'; // 0-1 goals
              if (day.completedCount >= 4) {
                bg = 'bg-emerald-600'; // 4-5 goals completed
              } else if (day.completedCount >= 2) {
                bg = 'bg-emerald-400'; // 2-3 partial
              }

              return (
                <div
                  key={day.dateStr}
                  className={`w-full aspect-square rounded-sm ${bg} transition-transform hover:scale-110 shadow-2xs`}
                  title={`${day.dateStr}: ${day.completedCount}/5 completed`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 bg-[#F1ECE2] rounded-xl border border-[#DDD5C7]">
            <span className="text-xl font-bold font-mono text-emerald-700 block">
              {fullDaysCount}
            </span>
            <span className="text-[11px] text-[#78716C] leading-tight block">
              Days completed (≥ 4/5)
            </span>
          </div>

          <div className="p-2 bg-[#F1ECE2] rounded-xl border border-[#DDD5C7]">
            <span className="text-xl font-bold font-mono text-emerald-600 block">
              {partialDaysCount}
            </span>
            <span className="text-[11px] text-[#78716C] leading-tight block">
              Partial days (2–3/5)
            </span>
          </div>

          <div className="p-2 bg-[#F1ECE2] rounded-xl border border-[#DDD5C7]">
            <span className="text-xl font-bold font-mono text-[#78716C] block">
              {lowDaysCount}
            </span>
            <span className="text-[11px] text-[#78716C] leading-tight block">
              Low days (0–1/5)
            </span>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-center pt-2">
          <p className="text-sm font-notes text-[#78716C] italic">
            "Progress, not perfection."
          </p>
        </div>
      </div>
    </div>
  );
};
