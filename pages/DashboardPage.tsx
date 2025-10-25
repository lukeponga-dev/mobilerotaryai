import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon, InformationCircleIcon, WaveformIcon } from '../components/icons';
import WarningLightGuideModal from '../components/WarningLightGuideModal';
import Button from '../components/Button';


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
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900">
      <Header
        sessionName="Dashboard"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth">
        
        <div className="text-center py-12 md:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Ready to Diagnose?</h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Click the button below to start a new session with AI Mazda Mechanic and get expert help for your Mazda RX-8.
          </p>
          <Button
            onClick={onNewSession}
            size="lg"
            className="group gap-3 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg hover:shadow-2xl hover:shadow-amber-500/40"
          >
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-90" />
            <span>Start New Diagnosis</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
            <div className="lg:col-span-3 bg-gradient-to-br from-amber-500 to-amber-700 p-6 sm:p-8 rounded-lg border border-amber-600 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transition-shadow hover:shadow-2xl hover:shadow-amber-500/30">
                <div className="flex items-center gap-5 text-center md:text-left">
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                        <WaveformIcon className="w-9 h-9 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Live Voice Diagnosis</h2>
                        <p className="text-sm text-amber-100 mt-1 max-w-xl">
                            Speak directly with the AI mechanic for real-time, hands-free troubleshooting.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => window.location.hash = '#/live'}
                    variant="secondary"
                    size="md"
                    className="w-full md:w-auto flex-shrink-0 !bg-white/90 !text-amber-600 hover:!bg-white"
                >
                    Start Conversation
                </Button>
            </div>


          <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Recent Sessions</h2>
            {recentSessions.length > 0 ? (
              <ul className="space-y-3">
                {recentSessions.map(session => (
                  <li key={session.id}>
                    <a 
                      href={`#/session/${session.id}`} 
                      className="block p-3 bg-white dark:bg-slate-700/50 rounded-md transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-amber-500/50 hover:-translate-y-0.5"
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
                <a href="#/sessions" className="block text-center mt-4 text-sm text-amber-500 hover:underline font-medium">View all sessions</a>
            )}
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-slate-700/50 rounded-full">
                    <BookmarkSquareIcon className="w-6 h-6 text-amber-500" />
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
                      className="block p-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/50 rounded-md transition-all duration-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 hover:text-amber-500"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            <a href="#/knowledge" className="block text-center mt-4 text-sm text-amber-500 hover:underline font-medium">View all articles</a>
          </div>
        
          <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-shadow hover:shadow-lg">
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
            <Button
              onClick={() => setIsGuideOpen(true)}
              variant="warning"
              size="md"
              className="w-full md:w-auto flex-shrink-0"
            >
              Open Guide
            </Button>
          </div>
        </div>
      </div>

      <WarningLightGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default DashboardPage;