import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon, InformationCircleIcon } from '../components/icons';
import WarningLightGuideModal from '../components/WarningLightGuideModal';


interface DashboardPageProps {
  sessions: Session[];
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

const quickLinks = [
    { title: 'Engine Flooding', href: '#/knowledge' },
    { title: 'Ignition Coil Failure', href: '#/knowledge' },
    { title: 'Low Compression / Apex Seal Wear', href: '#/knowledge' },
    { title: 'Oil Consumption', href: '#/knowledge' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ sessions, onNewSession, onToggleSidebar }) => {
  const recentSessions = sessions.slice(0, 3);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
      <Header
        sessionName="Dashboard"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Main Call to Action Section */}
        <div className="text-center py-12 md:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-4">Ready to Diagnose?</h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl xl:max-w-3xl mx-auto">
            Click the button below to start a new session with RotorWise AI and get expert help for your Mazda RX-8.
          </p>
          <button
            onClick={onNewSession}
            className="group inline-flex items-center justify-center gap-3 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-white bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-600/40"
          >
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-90" />
            <span>Start New Diagnosis</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          {/* Recent Sessions (takes 2 columns on lg) */}
          <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-lg">
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
            {sessions.length > 0 && (
                <a href="#/sessions" className="block text-center mt-4 text-sm text-rose-500 hover:underline font-medium">View all sessions</a>
            )}
          </div>
          
          {/* Knowledge Base & Quick Links */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-slate-700/50 rounded-full">
                    <BookmarkSquareIcon className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Knowledge Base</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Browse common issues or use these quick links to learn more.
            </p>
             <ul className="space-y-2">
                {quickLinks.map(link => (
                  <li key={link.title}>
                    <a 
                      href={link.href} 
                      className="block p-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/50 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 hover:text-rose-500 transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            <a href="#/knowledge" className="block text-center mt-4 text-sm text-rose-500 hover:underline font-medium">View all articles</a>
          </div>
        
          {/* Warning Light Decoder */}
          <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="p-3 bg-white dark:bg-slate-700/50 rounded-full flex-shrink-0 hidden sm:block">
                  <InformationCircleIcon className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Warning Light Decoder</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    Confused by a dashboard light? Use this quick guide to understand what it means and what to do.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0 w-full md:w-auto"
            >
              Open Guide
            </button>
          </div>
        </div>
      </div>

      <WarningLightGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default DashboardPage;