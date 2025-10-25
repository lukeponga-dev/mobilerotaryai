import React, { useState } from 'react';
import { Session } from '../types';
import { PlusIcon, XIcon, WrenchIcon, TrashIcon, ChatBubbleLeftRightIcon } from './icons';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import Modal from './Modal';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onNewSession, onDeleteSession, isSidebarOpen, onToggleSidebar }) => {
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, session: Session) => {
        e.preventDefault();
        e.stopPropagation();
        setSessionToDelete(session);
    };

    const confirmDelete = () => {
        if (sessionToDelete) {
            onDeleteSession(sessionToDelete.id);
            setSessionToDelete(null);
        }
    };

  return (
    <>
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 flex flex-col border-r border-slate-200 dark:border-slate-700/50
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50">
          <a href="#/" onClick={onToggleSidebar} className="flex items-center gap-2" aria-label="Go to dashboard">
            <WrenchIcon className="w-7 h-7 text-orange-500"/>
            <h2 className="text-lg font-semibold">AI Mazda Mechanic</h2>
          </a>
          <button onClick={onToggleSidebar} className="md:hidden p-1" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
          <Button
            onClick={onNewSession}
            variant="primary"
            className="w-full gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Diagnosis
          </Button>
        </div>

        <nav className="flex-1 p-2 flex flex-col overflow-y-auto">
            <div className="space-y-1">
                {sessions.map(session => (
                    <a href={`#/session/${session.id}`} key={session.id} onClick={onToggleSidebar}
                        className={`group flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors border-l-4 ${
                            activeSessionId === session.id
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500' 
                            : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}>
                        <div className="flex items-center gap-3 min-w-0">
                             <ChatBubbleLeftRightIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{session.name}</span>
                        </div>
                        <button
                            onClick={(e) => handleDeleteClick(e, session)}
                            className="p-1 rounded-md text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-opacity"
                            aria-label={`Delete session ${session.name}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </a>
                ))}
            </div>
            <div className="mt-auto pt-4 space-y-1 border-t border-slate-200 dark:border-slate-700/50">
                 <div className="flex items-center justify-between rounded-md px-3 py-2 text-slate-600 dark:text-slate-400">
                    <span className="text-sm font-medium">Appearance</span>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
      </div>

      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        title="Confirm Deletion"
      >
        <p className="text-slate-700 dark:text-slate-300">
          Are you sure you want to permanently delete the session "{sessionToDelete?.name}"? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={() => setSessionToDelete(null)}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="destructive"
          >
            Delete Session
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
