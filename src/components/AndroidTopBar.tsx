import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ArrowLeft,
  Sun,
  MoreVertical,
  Settings,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface AndroidTopBarProps {
  title: string;
  icon?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  onOpenDrawer?: () => void;
  onOpenSettings?: () => void;
  onExportData?: () => void;
  onImportData?: () => void;
  onResetData?: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  title,
  icon,
  showBack = false,
  onBack,
  onOpenDrawer,
  onOpenSettings,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header
      id="android-top-bar"
      className="w-full bg-[#121218] px-4 py-3 flex items-center justify-between border-b border-zinc-800/80 select-none sticky top-0 z-20 shrink-0"
    >
      {/* Left icon: Hamburger or Back */}
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <button
            type="button"
            id="top-bar-back-btn"
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full text-zinc-200 hover:bg-zinc-800/70 transition-colors focus:outline-none"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
        ) : (
          <button
            type="button"
            id="top-bar-drawer-btn"
            onClick={onOpenDrawer}
            className="p-1.5 -ml-1 rounded-full text-zinc-200 hover:bg-zinc-800/70 transition-colors focus:outline-none"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
        )}

        <div className="flex items-center gap-1.5">
          {icon}
          <h1 className="text-xl font-handwriting font-bold text-zinc-100 leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 relative" ref={menuRef}>
        {!showBack && (
          <button
            type="button"
            title="Study focus mode"
            onClick={() => {
              // gentle toast / visual indicator
            }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors focus:outline-none"
          >
            <Sun className="w-4 h-4 stroke-[1.8]" />
          </button>
        )}

        <button
          type="button"
          id="top-bar-overflow-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors focus:outline-none"
          aria-label="Menu options"
        >
          <MoreVertical className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Overflow Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-9 w-48 bg-[#181824] border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-40 text-sm font-handwriting text-zinc-200 animate-in fade-in duration-100">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-zinc-800/60 transition-colors text-zinc-200"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings &amp; Goals</span>
              </button>
            )}

            {onExportData && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onExportData();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-zinc-800/60 transition-colors text-zinc-200"
              >
                <Download className="w-4 h-4 text-zinc-400" />
                <span>Backup Data (JSON)</span>
              </button>
            )}

            {onImportData && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onImportData();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-zinc-800/60 transition-colors text-zinc-200"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span>Restore Data</span>
              </button>
            )}

            {onResetData && (
              <div className="border-t border-zinc-800 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onResetData();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset All Data</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
