import React from 'react';
import {
  Check,
  Home,
  BookOpen,
  Moon,
  BarChart2,
  Settings,
  GraduationCap,
  Dumbbell,
  Laptop,
  MessageSquare,
  Bed,
  Sparkles,
} from 'lucide-react';

/**
 * Hand-drawn SVG mountain doodle matching the left drawer in reference
 */
export const MountainDoodle: React.FC<{ className?: string }> = ({ className = 'w-24 h-12' }) => (
  <svg
    viewBox="0 0 120 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-zinc-500`}
  >
    {/* Sun / moon sketch */}
    <circle cx="95" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1 1" />
    {/* Mountain peaks */}
    <path
      d="M10 42 L38 12 L52 26 L68 8 L95 38 L110 42"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hatching lines for mountain shadow */}
    <path
      d="M38 12 L38 42 M34 20 L30 42 M44 20 L48 42 M68 8 L66 42 M64 16 L58 42 M74 18 L80 42"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Base ground line */}
    <path
      d="M5 43 Q 40 41, 75 43 T 115 42"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Small hand-drawn leaf doodle matching Analytics screen
 */
export const LeafDoodle: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-emerald-600`}
  >
    <path
      d="M4 20 C10 18, 16 12, 19 5 C12 6, 6 12, 4 20 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20 L13 11"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M8 16 Q 11 15, 12 13"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Hand-drawn mini graph doodle for GATE card
 */
export const MiniGraphDoodle: React.FC<{ className?: string }> = ({ className = 'w-6 h-5' }) => (
  <svg
    viewBox="0 0 28 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-zinc-500`}
  >
    <path d="M2 18 L26 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 18 L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 18 L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 18 L18 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M24 18 L24 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M5 13 L12 8 L18 5 L24 2"
      stroke="#16A34A"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Minimal hand-drawn play outline icon matching Android reference
 */
export const HandwrittenPlayIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7.5 5.5V18.5L18 12L7.5 5.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Handwritten Checkbox component (✓ or □)
 */
interface HandwrittenCheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: 'brick' | 'sage' | 'black';
  size?: 'sm' | 'md' | 'lg';
}

export const HandwrittenCheckbox: React.FC<HandwrittenCheckboxProps> = ({
  checked,
  onChange,
  size = 'md',
}) => {
  const boxSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-7 h-7';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`${boxSize} rounded-[8px] border-2 border-black bg-white/80 hover:bg-white flex items-center justify-center transition-all cursor-pointer shrink-0 focus:outline-none shadow-xs`}
    >
      {checked ? (
        <span className={`font-serif font-black ${size === 'sm' ? 'text-lg' : 'text-xl'} leading-none text-emerald-600 select-none`}>
          ✓
        </span>
      ) : null}
    </button>
  );
};
