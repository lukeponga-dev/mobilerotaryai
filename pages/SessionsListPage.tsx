import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { TrashIcon, PlusIcon } from '../components/icons';
import Modal from '../components/Modal';
import Button from '../components/Button';

interface SessionsListPageProps {
  sessions: Session[];
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

const SessionsListPage: React.FC<SessionsListPageProps> = ({ sessions, onDeleteSession, onNewSession, onToggleSidebar }) => {
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setDeletingId(sessionToDelete.id);
      setSessionToDelete(null); // Close modal immediately
      
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        onDeleteSession(sessionToDelete.id);
        setDeletingId(null);
      }, 300); 
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
      <Header
        sessionName="My Sessions"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto scroll-smooth">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">All Diagnosis Sessions</h1>
        {sortedSessions.length > 0 ? (
            <div className="space-y-4">
            {sortedSessions.map((session, index) => (
                <div 
                    key={session.id} 
                    className={`
                        group relative bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center justify-between p-4 
                        transition-all duration-300 ease-in-out hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:ring-2 hover:ring-rose-500/50
                        ${deletingId === session.id ? 'opacity-0 scale-95 -translate-x-8' : 'opacity-100'}
                    `}
                >
                    {index === 0 && (
                        <span className="absolute -top-2.5 right-3 text-xs font-bold bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-md z-10 tracking-wider">
                            RECENT
                        </span>
                    )}
                    <a href={`#/session/${session.id}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-500 transition-colors">{session.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Created on {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(session);
                        }}
                        className="text-slate-500 dark:text-slate-500 hover:text-rose-500 ml-4 flex-shrink-0"
                        aria-label={`Delete session ${session.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </Button>
                </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No Sessions Found</h2>
            <p className="text-slate-500 dark:text-slate-500 mt-2 mb-6">Get started by creating a new diagnosis session.</p>
            <Button
              onClick={onNewSession}
              variant="primary"
              size="md"
              className="gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Diagnosis</span>
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!sessionToDelete}
        onClose={cancelDelete}
        title="Confirm Deletion"
      >
        <p className="text-slate-700 dark:text-slate-300">
          Are you sure you want to permanently delete the session "{sessionToDelete?.name}"? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={cancelDelete}
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
    </div>
  );
};

export default SessionsListPage;