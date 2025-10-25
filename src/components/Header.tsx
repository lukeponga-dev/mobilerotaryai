import React from 'react';
import { DownloadIcon, MenuIcon, RotorIcon, BookmarkSquareIcon } from '@/components/icons';

interface HeaderProps {
  sessionName: string;
  onExportPDF?: () => void;
  onToggleSidebar: () => void;
  onToggleContextPanel?: () => void;
}

const Header: React.FC<HeaderProps> = ({ sessionName, onExportPDF, onToggleSidebar, onToggleContextPanel }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 flex-shrink-0">
      <div className="flex items-center min-w-0">
        <button onClick={onToggleSidebar} className="mr-3 md:hidden flex-shrink-0" aria-label="Open sidebar">
            <MenuIcon className="w-6 h-6" />
        </button>
        <a href="#/" aria-label="Go to dashboard" className="mr-3 flex-shrink-0">
          <RotorIcon className="w-7 h-7 sm:w-8 h-8 text-rose-500" />
        </a>
        <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate" title={sessionName}>{sessionName}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-rose-500 transition-colors flex-shrink-0"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
        {onToggleContextPanel && (
          <button
            onClick={onToggleContextPanel}
            className="lg:hidden flex items-center justify-center p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors"
            aria-label="View diagnosis summary"
          >
            <BookmarkSquareIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
