import React, { useState } from 'react';
import { Session } from '../types';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import ContextPanel from '../components/ContextPanel';

interface DiagnosisPageProps {
  session: Session;
  isLoading: boolean;
  onSendMessage: (sessionId: string, text: string, image?: string, video?: string, isThinkingMode?: boolean, isWebSearch?: boolean) => void;
}

const DiagnosisPage: React.FC<DiagnosisPageProps> = ({
  session,
  isLoading,
  onSendMessage,
}) => {
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);

  const handleSendMessage = (text: string, image?: string, video?: string) => {
    onSendMessage(session.id, text, image, video, isThinkingMode, isWebSearch);
  };
  
  const handleQuickReply = (replyText: string) => {
    // A quick reply should not use thinking mode or web search
    onSendMessage(session.id, replyText, undefined, undefined, false, false);
  };

  return (
    <div className="flex-1 flex min-h-0 bg-light-bg dark:bg-dark-bg">
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
              isThinkingMode={isThinkingMode}
              onToggleThinkingMode={() => setIsThinkingMode(prev => !prev)}
              isWebSearch={isWebSearch}
              onToggleWebSearch={() => setIsWebSearch(prev => !prev)}
            />
        </div>
        <ContextPanel context={session.context} isLoading={isLoading} />
    </div>
  );
};

export default DiagnosisPage;
