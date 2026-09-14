import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  History, 
  Calendar,
  Clock
} from 'lucide-react';
import { MineIntelLogo } from './MineIntelLogo';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenSamples?: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenHistory,
  historyCount,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-blue-900/30 dark:border-blue-500/20 bg-white/90 dark:bg-[#070e1c]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <MineIntelLogo variant="icon-only" size={44} showGlow={true} />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
                Mine<span className="text-amber-500">Intel</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Intelligence Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-blue-200/70">
              AI Powered Report Generator Program
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Current Date & Time Display in place of Sample Documents */}
          <div 
            id="current-datetime-header"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-200/90 dark:border-blue-900/60 bg-neutral-50/90 dark:bg-[#0b162a]/90 text-neutral-700 dark:text-blue-100 shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-neutral-300 dark:text-blue-800">•</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* History Drawer Trigger */}
          <button
            id="btn-report-history"
            type="button"
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all border border-neutral-200 dark:border-blue-900/50 bg-white dark:bg-[#0b162a] hover:bg-neutral-50 dark:hover:bg-blue-950/50 text-neutral-700 dark:text-neutral-200 shadow-xs active:scale-95"
            title="Saved reports history"
          >
            <History className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Saved Reports</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white shadow-xs">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl transition-all text-neutral-600 hover:text-neutral-900 dark:text-blue-200 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-blue-950/60 border border-neutral-200 dark:border-blue-900/50 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
