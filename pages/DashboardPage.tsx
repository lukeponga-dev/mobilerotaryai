import React, { useState } from 'react';
import { Session } from '../types';
import { PlusIcon, BookmarkSquareIcon, InformationCircleIcon, WaveformIcon, LightBulbIcon, BoltIcon } from '../components/icons';
import WarningLightGuideModal from '../components/WarningLightGuideModal';
import Button from '../components/Button';

interface DashboardPageProps {
  onNewSession: () => void;
}

const quickLinks = [
    { title: 'Engine Flooding', href: '#/knowledge' },
    { title: 'Ignition Coils', href: '#/knowledge' },
    { title: 'Low Compression', href: '#/knowledge' },
    { title: 'Oil Consumption', href: '#/knowledge' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ onNewSession }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto scroll-smooth bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-2">Welcome Back</h1>
          <p className="text-base text-light-muted dark:text-dark-muted">
            Ready to diagnose your RX-8? Let's get started.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Action Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-accent to-teal p-6 rounded-lg border border-accent/20 shadow-xl h-full flex flex-col justify-between">
              <LightBulbIcon className="absolute -right-6 -bottom-10 w-36 h-36 text-white/10 transform rotate-[-15deg] pointer-events-none" />
              <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pro Tip of the Day</h2>
                  <p className="text-white/80 mb-4 max-w-md">
                      To prevent engine flooding, always allow your RX-8 to reach normal operating temperature before shutting it off.
                  </p>
              </div>
              <Button
                  onClick={onNewSession}
                  size="lg"
                  className="w-full sm:w-auto bg-white/90 text-gray-900 hover:bg-white shadow-lg !ring-offset-teal"
              >
                  Start First Diagnosis
              </Button>
          </div>

          {/* Action Sidebar */}
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm h-full flex flex-col">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">Start a New Session</h2>
              <div className="flex-grow space-y-3 flex flex-col">
                  <Button onClick={onNewSession} variant="primary" className="w-full gap-3"><PlusIcon className="w-5 h-5" />New Text Diagnosis</Button>
                  <Button onClick={() => window.location.hash = '#/live'} variant="secondary" className="w-full gap-3"><WaveformIcon className="w-5 h-5" />Start Voice Chat</Button>
                  <Button onClick={() => window.location.hash = '#/live-dashboard'} variant="secondary" className="w-full gap-3"><BoltIcon className="w-5 h-5" />Open Live Dashboard</Button>
              </div>
              <div className="mt-4 border-t border-light-border dark:border-dark-border pt-4">
                  <Button onClick={() => setIsGuideOpen(true)} variant="ghost" className="w-full gap-3 text-danger hover:bg-danger/10 hover:text-danger">
                     <InformationCircleIcon className="w-5 h-5"/> Warning Light Decoder
                  </Button>
              </div>
          </div>
        </div>
        
        {/* Quick Knowledge */}
        <div className="mt-8">
           <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal/10 rounded-full">
                      <BookmarkSquareIcon className="w-6 h-6 text-teal" />
                  </div>
                  <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Quick Knowledge</h2>
              </div>
              <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
                  Browse these common topics or search the full <a href="#/knowledge" className="text-accent hover:underline font-medium">Knowledge Base</a> for more info.
              </p>
              <div className="flex flex-wrap gap-3">
                  {quickLinks.map(link => (
                    <a
                      key={link.title}
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium bg-light-panel-muted text-light-text rounded-full transition-all duration-200 transform hover:-translate-y-px hover:shadow-md hover:bg-accent/20 dark:bg-dark-panel-muted dark:text-dark-text dark:hover:bg-accent/20"
                    >
                      {link.title}
                    </a>
                  ))}
              </div>
          </div>
        </div>

      </div>

      <WarningLightGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default DashboardPage;