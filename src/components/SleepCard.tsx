import React, { useState, useEffect } from 'react';
import { Moon, Plus, Minus, Check, Target as TargetIcon, RotateCcw } from 'lucide-react';

interface SleepCardProps {
  sleepHours: number | null;
  targetHours: number;
  onUpdateSleep: (hours: number | null) => void;
}

const PRESET_HOURS = [6.0, 7.0, 7.5, 8.0, 8.5];

export const SleepCard: React.FC<SleepCardProps> = ({
  sleepHours,
  targetHours,
  onUpdateSleep,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    sleepHours !== null ? sleepHours.toString() : ''
  );

  useEffect(() => {
    setInputValue(sleepHours !== null ? sleepHours.toString() : '');
  }, [sleepHours]);

  const handleStep = (delta: number) => {
    const current = sleepHours !== null ? sleepHours : targetHours;
    const next = Math.max(0, Math.min(24, Math.round((current + delta) * 10) / 10));
    onUpdateSleep(next);
  };

  const handlePreset = (val: number) => {
    onUpdateSleep(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() === '') {
      onUpdateSleep(null);
      return;
    }
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 24) {
      const rounded = Math.round(parsed * 10) / 10;
      onUpdateSleep(rounded);
      setInputValue(rounded.toString());
    } else {
      // Revert to current value
      setInputValue(sleepHours !== null ? sleepHours.toString() : '');
    }
  };

  const isMetTarget = sleepHours !== null && sleepHours >= targetHours;

  return (
    <section
      id="sleep-tracker-card"
      className="w-full bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4.5 sm:p-5.5 shadow-2xs"
    >
      {/* Header with Title and Independent Isolation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#EAE2D2]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAE2D2] text-[#3F4E5E] flex items-center justify-center shrink-0 border border-[#DDD6C8]">
            <Moon className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#252522] font-serif-heading tracking-tight">
                Sleep &amp; Recovery Log
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EAE2D2] text-[#736B5E] border border-[#DDD6C8]">
                INDEPENDENT METRIC
              </span>
            </div>
            <p className="text-xs text-[#736B5E]">
              Recorded per date in your journal • Never alters the 5/5 daily protocol score
            </p>
          </div>
        </div>

        {/* Target indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#DDD6C8] text-[#5A5347] text-xs font-mono font-medium">
            <TargetIcon className="w-3 h-3 text-[#8C8271]" />
            <span>Target: {targetHours}h</span>
          </div>
          {isMetTarget && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E1EDE4] border border-[#CFDFD3] text-[#4A6953] text-xs font-mono font-semibold">
              <Check className="w-3 h-3" />
              Target Met
            </span>
          )}
        </div>
      </div>

      {/* Main Sleep Value and Controls */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Current Hours Display & Stepper */}
        <div className="sm:col-span-6 flex items-center gap-2.5">
          <button
            id="sleep-step-minus"
            type="button"
            onClick={() => handleStep(-0.5)}
            className="w-10 h-10 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] active:bg-[#D9D2C3] transition-colors flex items-center justify-center shrink-0"
            aria-label="Decrease sleep by 30 minutes"
            title="Decrease 0.5h"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-[120px] text-center p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DFD3]">
            <div className="flex items-baseline justify-center gap-1.5">
              <input
                id="sleep-hours-input"
                type="number"
                step="0.1"
                min="0"
                max="24"
                placeholder="--"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-18 text-center text-3xl font-extrabold font-mono text-[#252522] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#8C8271] rounded"
              />
              <span className="text-sm font-semibold font-mono text-[#736B5E]">hrs</span>
            </div>
            <p className="text-[11px] font-mono text-[#8C8271] mt-0.5">
              {sleepHours !== null
                ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m logged`
                : 'Not logged today'}
            </p>
          </div>

          <button
            id="sleep-step-plus"
            type="button"
            onClick={() => handleStep(0.5)}
            className="w-10 h-10 rounded-xl border border-[#DDD6C8] bg-[#FAF7F0] text-[#5A5347] hover:text-[#252522] hover:bg-[#EAE2D2] active:bg-[#D9D2C3] transition-colors flex items-center justify-center shrink-0"
            aria-label="Increase sleep by 30 minutes"
            title="Increase 0.5h"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets and reset */}
        <div className="sm:col-span-6 flex flex-col gap-1.5">
          <span className="text-[11px] font-mono font-semibold text-[#8C8271] uppercase tracking-wider">
            Quick Log Presets
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_HOURS.map((val) => {
              const isSelected = sleepHours === val;
              return (
                <button
                  key={val}
                  id={`sleep-preset-${val}h`}
                  type="button"
                  onClick={() => handlePreset(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors border ${
                    isSelected
                      ? 'bg-[#252522] text-[#FAF7F0] border-[#1E1E1C] shadow-2xs'
                      : 'bg-[#FAF7F0] hover:bg-[#EAE2D2] text-[#5A5347] border-[#DDD6C8]'
                  }`}
                >
                  {val}h
                </button>
              );
            })}

            {sleepHours !== null && (
              <button
                id="sleep-clear-btn"
                type="button"
                onClick={() => onUpdateSleep(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#736B5E] hover:text-[#B65C52] hover:bg-[#F8EFE9] transition-colors"
                title="Clear sleep entry"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

