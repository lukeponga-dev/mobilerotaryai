import React from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon } from '../components/icons';

interface DashboardPageProps {
  sessions: Session[];
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ sessions, onNewSession, onToggleSidebar }) => {
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
      <Header
        sessionName="Dashboard"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Main Call to Action Section */}
        <div className="text-center py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Ready to Diagnose?</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Click the button below to start a new session with RotorWise AI and get expert help for your Mazda RX-8.
          </p>
          <button
            onClick={onNewSession}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-600/40"
          >
            <PlusIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            <span>Start New Diagnosis</span>
          </button>
        </div>

        {/* Secondary Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 max-w-5xl mx-auto w-full">
          {/* Recent Sessions */}
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Recent Sessions</h2>
            {recentSessions.length > 0 ? (
              <ul className="space-y-3">
                {recentSessions.map(session => (
                  <li key={session.id}>
                    <a 
                      href={`#/session/${session.id}`} 
                      className="block p-3 bg-white dark:bg-slate-700/50 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 hover:ring-2 hover:ring-rose-500/50 transition-all"
                    >
                      <p className="font-medium truncate text-slate-800 dark:text-slate-200">{session.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</p>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-500 italic">No recent sessions found.</p>
            )}
            {sessions.length > 3 && (
                <a href="#/sessions" className="block text-center mt-4 text-sm text-rose-500 hover:underline font-medium">View all sessions</a>
            )}
          </div>
          
          {/* Knowledge Base */}
          <a href="#/knowledge" className="group bg-slate-100 dark:bg-slate-800 p-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/20 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-700/50 shadow-lg hover:border-rose-500/50">
            <div className="p-4 bg-white dark:bg-slate-700/50 rounded-full mb-4 transition-colors duration-300 group-hover:bg-rose-500/10 dark:group-hover:bg-rose-500/20">
                <BookmarkSquareIcon className="w-10 h-10 text-rose-500 transition-colors duration-300 group-hover:text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Knowledge Base</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Browse common RX-8 issues.</p>
          </a>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;