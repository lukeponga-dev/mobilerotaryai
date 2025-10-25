import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon, MenuIcon, WrenchIcon, Squares2X2Icon, BookmarkSquareIcon, WaveformIcon, ShieldCheckIcon, PlusIcon } from './icons';
import Button from './Button';

interface HeaderProps {
  sessionName: string;
  onExportPDF?: () => void;
  onToggleSidebar: () => void;
}

const NavMenu: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const navItems = [
        { route: '#/knowledge', icon: <BookmarkSquareIcon className="w-5 h-5" />, label: 'Knowledge Base' },
        { route: '#/live', icon: <WaveformIcon className="w-5 h-5" />, label: 'Live Diagnosis' },
        { route: '#/privacy', icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Privacy Policy' },
    ];

    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl border border-light-border dark:border-dark-border z-20 p-2 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
            {navItems.map(item => (
                <a
                    key={item.route}
                    href={item.route}
                    onClick={onClose}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-light-text dark:text-dark-text hover:bg-light-panel-muted dark:hover:bg-dark-panel-muted transition-colors"
                >
                    {item.icon}
                    <span>{item.label}</span>
                </a>
            ))}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ sessionName, onExportPDF, onToggleSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    if (isMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border flex-shrink-0">
      <div className="flex items-center justify-between text-light-text dark:text-dark-text py-3 pl-[calc(1rem+env(safe-area-inset-left,0rem))] pr-[calc(1rem+env(safe-area-inset-right,0rem))] pt-[calc(0.75rem+env(safe-area-inset-top,0rem))]">
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
          <div className="mr-4 flex-shrink-0 hidden md:block">
            <WrenchIcon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
          </div>
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
           <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.hash = '#/'}
                aria-label="Start new diagnosis"
                title="New Diagnosis"
            >
                <PlusIcon className="w-6 h-6" />
            </Button>
           <div className="relative" ref={menuRef}>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    aria-label="Open navigation menu"
                >
                    <Squares2X2Icon className="w-6 h-6" />
                </Button>
                {isMenuOpen && <NavMenu onClose={() => setIsMenuOpen(false)} />}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;