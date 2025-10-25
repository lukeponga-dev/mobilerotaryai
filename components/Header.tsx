import React from 'react';
import { DownloadIcon, MenuIcon, RotorIcon } from './icons';
import Button from './Button';

interface HeaderProps {
  sessionName: string;
  onExportPDF?: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sessionName, onExportPDF, onToggleSidebar }) => {
  return (
    <header className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0">
      <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 pb-3 pt-[calc(1rem+env(safe-area-inset-top,0rem))] pl-[calc(1rem+env(safe-area-inset-left,0rem))] pr-[calc(1rem+env(safe-area-inset-right,0rem))]">
        <div className="flex items-center min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar} 
            className="mr-2 md:hidden flex-shrink-0" 
            aria-label="Open sidebar"
          >
              <MenuIcon className="w-6 h-6" />
          </Button>
          <a href="#/" aria-label="Go to dashboard" className="mr-4 flex-shrink-0">
            <RotorIcon className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" />
          </a>
          <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate" title={sessionName}>{sessionName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onExportPDF && (
            <Button
              onClick={onExportPDF}
              variant="secondary"
              size="md"
              className="gap-2 flex-shrink-0"
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;