import React, { useState, useEffect } from 'react';
import { PenTool, Check, FileText } from 'lucide-react';

interface DailyNotesCardProps {
  dateStr: string;
  initialNote: string;
  onSaveNote: (note: string) => void;
}

export const DailyNotesCard: React.FC<DailyNotesCardProps> = ({
  dateStr,
  initialNote,
  onSaveNote,
}) => {
  const [note, setNote] = useState<string>(initialNote || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setNote(initialNote || '');
    setIsSaved(false);
  }, [dateStr, initialNote]);

  const handleBlur = () => {
    if (note !== initialNote) {
      onSaveNote(note);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  return (
    <section
      id="daily-notes-card"
      className="w-full bg-[#FCFAF6] rounded-2xl border border-[#E5DFD3] p-4.5 sm:p-5.5 shadow-2xs space-y-3"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE2D2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EAE2D2] text-[#3F4E5E] flex items-center justify-center shrink-0 border border-[#DDD6C8]">
            <PenTool className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#252522] font-serif-heading tracking-tight">
              Study Journal &amp; Docket Notes
            </h2>
            <p className="text-[11px] text-[#736B5E]">
              Key formulas, lecture takeaways, or daily reflection • Auto-persists
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4A6953] bg-[#E1EDE4] px-2 py-0.5 rounded border border-[#CFDFD3]">
              <Check className="w-3 h-3" /> Saved
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#8C8271] uppercase tracking-wider hidden sm:inline">
              Notebook Journal
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="daily-study-note-textarea"
          value={note}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Jot down notes, topics covered, problems solved, or tomorrow's agenda..."
          rows={3}
          className="w-full text-xs sm:text-sm font-mono text-[#252522] placeholder:text-[#8C8271] p-3 rounded-xl bg-[#FAF7F0] border border-[#DDD6C8] focus:outline-none focus:ring-1 focus:ring-[#736B5E] notebook-ruled leading-[28px] resize-y min-h-[96px]"
        />
      </div>
    </section>
  );
};
