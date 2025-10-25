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
        fixed inset-y-0 left-0 z-30 w-72 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text flex flex-col border-r border-light-border dark:border-dark-border
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <a href="#/" onClick={onToggleSidebar} className="flex items-center gap-2" aria-label="Go to dashboard">
            <WrenchIcon className="w-7 h-7 text-accent"/>
            <h2 className="text-lg font-semibold">AI Mazda Mechanic</h2>
          </a>
          <button onClick={onToggleSidebar} className="md:hidden p-1" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-light-border dark:border-dark-border">
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
                            ? 'bg-accent/10 text-accent border-accent' 
                            : 'text-light-muted dark:text-dark-muted border-transparent hover:bg-light-panel-muted dark:hover:bg-dark-panel-muted hover:text-light-text dark:hover:text-dark-text'
                        }`}>
                        <div className="flex items-center gap-3 min-w-0">
                             <ChatBubbleLeftRightIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{session.name}</span>
                        </div>
                        <button
                            onClick={(e) => handleDeleteClick(e, session)}
                            className="p-1 rounded-md text-light-muted dark:text-dark-muted opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger transition-opacity"
                            aria-label={`Delete session ${session.name}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </a>
                ))}
            </div>
            <div className="mt-auto pt-4 space-y-1 border-t border-light-border dark:border-dark-border">
                 <div className="flex items-center justify-between rounded-md px-3 py-2 text-light-muted dark:text-dark-muted">
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
        <p className="text-light-text dark:text-dark-text">
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