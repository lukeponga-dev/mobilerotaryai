import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon, InformationCircleIcon, WaveformIcon, LightBulbIcon, WrenchIcon } from '../components/icons';
import WarningLightGuideModal from '../components/WarningLightGuideModal';
import Button from '../components/Button';

interface DashboardPageProps {
  sessions: Session[];
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

const quickLinks = [
    { title: 'Engine Flooding', href: '#/knowledge' },
    { title: 'Ignition Coils', href: '#/knowledge' },
    { title: 'Low Compression', href: '#/knowledge' },
    { title: 'Oil Consumption', href: '#/knowledge' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ sessions, onNewSession, onToggleSidebar }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentSessions = sortedSessions.slice(0, 3);
  const latestSession = sortedSessions[0];
  const hasRecentSessions = sessions.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900">
      <Header
        sessionName="Dashboard"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Ready to diagnose your RX-8? Let's get started.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {hasRecentSessions && latestSession ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-lg border border-orange-500/20 shadow-xl h-full flex flex-col justify-between">
                   <WrenchIcon className="absolute -right-6 -bottom-10 w-36 h-36 text-white/10 transform rotate-[-15deg] pointer-events-none" />
                   <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Continue Your Diagnosis</h2>
                        <p className="text-orange-100 mb-4 max-w-md">
                            You were last working on: <strong className="font-semibold">{latestSession.name}</strong>
                        </p>
                   </div>
                   <Button
                        onClick={() => window.location.hash = `#/session/${latestSession.id}`}
                        size="lg"
                        className="w-full sm:w-auto bg-white/90 text-orange-600 hover:bg-white shadow-lg !ring-offset-orange-500"
                    >
                        Jump Back In
                    </Button>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-lg border border-teal-500/20 shadow-xl h-full flex flex-col justify-between">
                    <LightBulbIcon className="absolute -right-6 -bottom-10 w-36 h-36 text-white/10 transform rotate-[-15deg] pointer-events-none" />
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pro Tip of the Day</h2>
                        <p className="text-teal-100 mb-4 max-w-md">
                            To prevent engine flooding, always allow your RX-8 to reach normal operating temperature before shutting it off.
                        </p>
                    </div>
                    <Button
                        onClick={onNewSession}
                        size="lg"
                        className="w-full sm:w-auto bg-white/90 text-teal-600 hover:bg-white shadow-lg !ring-offset-teal-500"
                    >
                        Start First Diagnosis
                    </Button>
                </div>
              )}
            </div>

            {/* Action Sidebar */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm h-full flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Start a New Session</h2>
                    <div className="flex-grow space-y-3 flex flex-col">
                        <Button onClick={onNewSession} variant="primary" className="w-full gap-3"><PlusIcon className="w-5 h-5" />New Text Diagnosis</Button>
                        <Button onClick={() => window.location.hash = '#/live'} variant="secondary" className="w-full gap-3"><WaveformIcon className="w-5 h-5" />Start Voice Chat</Button>
                    </div>
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <Button onClick={() => setIsGuideOpen(true)} variant="ghost" className="w-full gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-500">
                           <InformationCircleIcon className="w-5 h-5"/> Warning Light Decoder
                        </Button>
                    </div>
                </div>
            </div>
          </div>
          
          {/* Recent Sessions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Recent Sessions</h2>
            {recentSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentSessions.map(session => (
                    <a
                      key={session.id}
                      href={`#/session/${session.id}`}
                      className="group block p-5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-orange-500/80 hover:-translate-y-1"
                    >
                      <p className="font-semibold truncate text-slate-800 dark:text-slate-100 group-hover:text-orange-500 dark:group-hover:text-orange-400">{session.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{`Last updated: ${new Date(session.createdAt).toLocaleDateString()}`}</p>
                    </a>
                  ))}
                  {sessions.length > 3 && (
                    <a href="#/sessions" className="flex items-center justify-center p-5 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-orange-500 hover:text-orange-500 transition-colors">
                        View All Sessions...
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No recent sessions found.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start a new diagnosis to see it here.</p>
                </div>
              )}
          </div>
          
          {/* Quick Knowledge */}
          <div className="mt-8">
             <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-full">
                        <BookmarkSquareIcon className="w-6 h-6 text-teal-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Knowledge</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Browse these common topics or search the full <a href="#/knowledge" className="text-orange-500 hover:underline font-medium">Knowledge Base</a> for more info.
                </p>
                <div className="flex flex-wrap gap-3">
                    {quickLinks.map(link => (
                      <a
                        key={link.title}
                        href={link.href}
                        className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 rounded-full transition-all duration-200 transform hover:-translate-y-px hover:shadow-md hover:bg-orange-400/30 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-orange-500/20"
                      >
                        {link.title}
                      </a>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </div>

      <WarningLightGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default DashboardPage;