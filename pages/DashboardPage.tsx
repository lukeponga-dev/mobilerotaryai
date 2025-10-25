import React, { useState } from 'react';
import Header from '../components/Header';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon, InformationCircleIcon, WaveformIcon, BoltIcon } from '../components/icons';
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
    { title: 'Low Compression', href: '#/knowledge' },
    { title: 'Oil Consumption', href: '#/knowledge' },
    { title: 'Catalytic Converter', href: '#/knowledge' },
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
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Ready to diagnose your RX-8? Here are your quick actions and recent activity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <BoltIcon className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Jump right into a diagnostic session. Use the standard text-based chat or go hands-free with a live voice conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onNewSession}
                  size="lg"
                  className="w-full sm:w-auto group gap-3 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg hover:shadow-xl hover:shadow-amber-500/30"
                >
                  <PlusIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                  <span>New Text Diagnosis</span>
                </Button>
                <Button
                    onClick={() => window.location.hash = '#/live'}
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto gap-3"
                >
                    <WaveformIcon className="w-5 h-5" />
                    <span>Start Voice Chat</span>
                </Button>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col justify-between transition-shadow hover:shadow-lg">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <InformationCircleIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Warning Lights</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Confused by a dashboard light? Use this quick guide to understand what it means.
                </p>
              </div>
              <Button
                onClick={() => setIsGuideOpen(true)}
                variant="destructive"
                className="w-full mt-2"
              >
                Open Decoder Guide
              </Button>
            </div>

            <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Recent Sessions</h2>
              {recentSessions.length > 0 ? (
                <ul className="space-y-3">
                  {recentSessions.map(session => (
                    <li key={session.id}>
                      <a
                        href={`#/session/${session.id}`}
                        className="block p-4 bg-white dark:bg-slate-700/50 rounded-md transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-amber-500/50 hover:-translate-y-0.5"
                      >
                        <p className="font-medium truncate text-slate-800 dark:text-slate-200">{session.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</p>
                      </a>
                    </li>
                  ))}
                  {sessions.length > 3 && (
                    <li>
                        <a href="#/sessions" className="block text-center mt-2 p-2 text-sm text-amber-500 hover:underline font-medium">View all sessions</a>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-500">No recent sessions found.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Start a new diagnosis to see it here.</p>
                </div>
              )}
            </div>

             <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-full">
                        <BookmarkSquareIcon className="w-6 h-6 text-teal-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Common Issues</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Browse these common topics or search the full <a href="#/knowledge" className="text-amber-500 hover:underline font-medium">Knowledge Base</a> for more info.
                </p>
                <div className="flex flex-wrap gap-3">
                    {quickLinks.map(link => (
                      <a
                        key={link.title}
                        href={link.href}
                        className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 rounded-full transition-all duration-200 transform hover:-translate-y-px hover:shadow-md hover:bg-amber-400/30 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-amber-500/20"
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