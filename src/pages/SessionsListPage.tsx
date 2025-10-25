import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types/diagnosis';
import { TrashIcon, PlusIcon } from '../components/icons';
import Modal from '../components/Modal';

interface SessionsListPageProps {
  sessions: Session[];
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

const SessionsListPage: React.FC<SessionsListPageProps> = ({ sessions, onDeleteSession, onNewSession, onToggleSidebar }) => {
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
      <Header
        sessionName="My Sessions"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">All Diagnosis Sessions</h1>
        {sortedSessions.length > 0 ? (
            <div className="space-y-3">
            {sortedSessions.map(session => (
                <div key={session.id} className="group bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center justify-between p-4 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors">
                    <a href={`#/session/${session.id}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-400 transition-colors">{session.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Created on {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                    </a>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(session);
                        }}
                        className="text-slate-500 dark:text-slate-500 hover:text-rose-500 transition-colors ml-4 flex-shrink-0 p-2"
                        aria-label={`Delete session ${session.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No Sessions Found</h2>
            <p className="text-slate-500 dark:text-slate-500 mt-2 mb-6">Get started by creating a new diagnosis session.</p>
            <button
              onClick={onNewSession}
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Diagnosis</span>
            </button>
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
          <button
            onClick={cancelDelete}
            className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Delete Session
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsListPage;