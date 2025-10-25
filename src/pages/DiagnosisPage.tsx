import React, { useState } from 'react';
import { Session } from '@/types/diagnosis';
import Header from '@/components/Header';
import ChatWindow from '@/components/ChatWindow';
import InputBar from '@/components/InputBar';
import DiagnosisSummary from '@/components/DiagnosisSummary';

interface DiagnosisPageProps {
  session: Session;
  isLoading: boolean;
  onSendMessage: (sessionId: string, text: string, image?: string, video?: string) => void;
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
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);

  const handleSendMessage = (text: string, image?: string, video?: string) => {
    onSendMessage(session.id, text, image, video);
  };
  
  const handleExport = () => {
    onExportPDF(session.id);
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
        <Header
            sessionName={session.name}
            onExportPDF={handleExport}
            onToggleSidebar={onToggleSidebar}
            onToggleContextPanel={() => setIsContextPanelOpen(true)}
        />
        <div className="flex-1 flex min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
                <ChatWindow messages={session.messages} isLoading={isLoading} />
                <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
            <DiagnosisSummary
              context={session.context}
              isLoading={isLoading}
              isOpen={isContextPanelOpen}
              onClose={() => setIsContextPanelOpen(false)}
            />
        </div>
    </div>
  );
};

export default DiagnosisPage;
