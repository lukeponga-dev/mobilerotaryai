import React from 'react';
import { PlusIcon, XIcon, HomeIcon, ChatBubbleLeftRightIcon, BookmarkSquareIcon, RotorIcon, ShieldCheckIcon } from '@/components/icons';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
  onNewSession: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeRoute: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewSession, isSidebarOpen, onToggleSidebar, activeRoute }) => {

  const navItems = [
    { route: '#/', icon: <HomeIcon className="w-5 h-5" />, label: 'Dashboard' },
    { route: '#/sessions', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, label: 'My Sessions' },
    { route: '#/knowledge', icon: <BookmarkSquareIcon className="w-5 h-5" />, label: 'Knowledge Base' },
  ];

  const getIsActive = (route: string) => {
    if (route === '#/sessions') {
      // This correctly highlights "My Sessions" for both the list page and individual session pages.
      return activeRoute.startsWith('#/session'); 
    }
    if (route === '#/') {
      // Exact match for the dashboard to prevent it from being active on other pages.
      return activeRoute === '#/';
    }
    // For other routes like '#/knowledge'.
    return activeRoute.startsWith(route);
  }

  return (
    <>
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-700/50
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50">
          <a href="#/" onClick={onToggleSidebar} className="flex items-center gap-2" aria-label="Go to dashboard">
            <RotorIcon className="w-7 h-7 text-rose-500"/>
            <h2 className="text-lg font-semibold">RotorWise AI</h2>
          </a>
          <button onClick={onToggleSidebar} className="md:hidden p-1" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-rose-500 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Diagnosis
          </button>
        </div>

        <nav className="flex-1 p-2 flex flex-col">
            <div className="space-y-1">
                {navItems.map(item => (
                    <a href={item.route} key={item.route} onClick={onToggleSidebar}
                        className={`flex items-center gap-3 p-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                            getIsActive(item.route) 
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}>
                        {item.icon}
                        <span>{item.label}</span>
                    </a>
                ))}
            </div>
            <div className="mt-auto pt-2 space-y-1 border-t border-slate-200 dark:border-slate-700/50">
                <a href="#/privacy" onClick={onToggleSidebar}
                    className={`flex items-center gap-3 p-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                        getIsActive('#/privacy') 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Privacy Policy</span>
                </a>
                <div className="flex items-center justify-between rounded-md p-2 text-slate-600 dark:text-slate-400">
                    <span className="text-sm font-medium">Appearance</span>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
