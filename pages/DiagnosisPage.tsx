import React, { useState } from 'react';
import { Session } from '../types';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import ContextPanel from '../components/ContextPanel';

interface DiagnosisPageProps {
  session: Session;
  isLoading: boolean;
  onSendMessage: (sessionId: string, text: string, image?: string, video?: string, isDeepAnalysis?: boolean) => void;
  onExportPDF: (sessionId: string) => void;
  onToggleSidebar: () => void;
}

const DiagnosisPage: React.FC<DiagnosisPageProps> = ({
  session,
  isLoading,
  onSendMessage,
  onExportPDF,
  onToggleSidebar,
}) => {
  const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);

  const handleSendMessage = (text: string, image?: string, video?: string) => {
    onSendMessage(session.id, text, image, video, isDeepAnalysis);
  };
  
  const handleQuickReply = (replyText: string) => {
    // A quick reply should not be a deep analysis
    onSendMessage(session.id, replyText, undefined, undefined, false);
  };

  const handleExport = () => {
    onExportPDF(session.id);
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900">
        <Header
            sessionName={session.name}
            onExportPDF={handleExport}
            onToggleSidebar={onToggleSidebar}
        />
        <div className="flex-1 flex min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
                <ChatWindow
                    messages={session.messages}
                    isLoading={isLoading}
                    quickReplies={session.quickReplies}
                    onQuickReply={handleQuickReply}
                />
                <InputBar 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading} 
                  isDeepAnalysis={isDeepAnalysis}
                  onToggleDeepAnalysis={() => setIsDeepAnalysis(prev => !prev)}
                />
            </div>
            <ContextPanel context={session.context} isLoading={isLoading} />
        </div>
    </div>
  );
};

export default DiagnosisPage;