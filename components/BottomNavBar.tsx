import React from 'react';
import { Squares2X2Icon, PlusIcon, BookmarkSquareIcon, WaveformIcon, BoltIcon } from './icons';

interface BottomNavBarProps {
  activeRoute: string;
  onNewSession: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, onNewSession }) => {
  const navItems = [
    { route: '#/', label: 'Dashboard', icon: Squares2X2Icon },
    { route: '#/knowledge', label: 'Knowledge', icon: BookmarkSquareIcon },
    { route: 'new_session', label: 'New', icon: PlusIcon, action: onNewSession },
    { route: '#/live', label: 'Live Chat', icon: WaveformIcon },
    { route: '#/live-dashboard', label: 'Live Data', icon: BoltIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[calc(4.5rem+env(safe-area-inset-bottom,0rem))] bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg border-t border-light-border dark:border-dark-border z-20 md:hidden">
      <nav className="flex justify-around items-start h-full pt-2 pb-[env(safe-area-inset-bottom,0rem)] px-[env(safe-area-inset-left,0rem)] pr-[env(safe-area-inset-right,0rem)]">
        {navItems.map((item) => {
          const isActive = item.route === activeRoute;
          const Icon = item.icon;
          const isNewButton = item.route === 'new_session';

          if (isNewButton) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center text-center w-16"
                aria-label="Start new session"
              >
                <div className="w-14 h-14 bg-accent text-gray-900 rounded-full flex items-center justify-center -mt-6 shadow-lg transform active:scale-90 transition-transform">
                    <Icon className="w-7 h-7" />
                </div>
              </button>
            )
          }

          return (
            <a
              key={item.label}
              href={item.route}
              className={`flex flex-col items-center justify-center text-center w-16 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-light-muted dark:text-dark-muted'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar;
