import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import Button from './Button';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
  quickReplies?: string[];
  onQuickReply: (reply: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, quickReplies, onQuickReply }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, quickReplies]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-light-surface dark:bg-dark-surface scroll-smooth">
      {messages.map((msg, index) => {
        const isLastMessage = index === messages.length - 1;
        const isSecondLast = index === messages.length - 2;

        // REFACTORED: Fade out older messages when waiting for a new response to improve focus.
        const isFaded = isLoading && !isLastMessage && !isSecondLast;
        
        const showQuickReplies = isLastMessage && !isLoading && msg.role === 'model' && quickReplies && quickReplies.length > 0;

        return (
          <div key={msg.id} className={`transition-opacity duration-500 ${isFaded ? 'opacity-60' : 'opacity-100'}`}>
            <Message 
              message={msg} 
              isLoading={isLoading}
              isLastMessage={isLastMessage}
            />
            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 mt-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {quickReplies.map((reply, i) => (
                      <button
                          key={i}
                          className="px-4 py-2 text-sm font-medium bg-light-panel-muted text-light-text rounded-full transition-all duration-200 transform hover:-translate-y-px hover:shadow-md hover:bg-accent/20 dark:bg-dark-panel-muted dark:text-dark-text dark:hover:bg-accent/20"
                          onClick={() => onQuickReply(reply)}
                      >
                          {reply}
                      </button>
                  ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;