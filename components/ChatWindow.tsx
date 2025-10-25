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
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-smooth">
      {messages.map((msg, index) => {
        const isLastMessage = index === messages.length - 1;
        const showQuickReplies = isLastMessage && !isLoading && msg.role === 'model' && quickReplies && quickReplies.length > 0;

        return (
          <div key={msg.id}>
            <Message 
              message={msg} 
              isLoading={isLoading}
              isLastMessage={isLastMessage}
            />
            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 mt-3 ml-11 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {quickReplies.map((reply, i) => (
                      <button
                          key={i}
                          className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 rounded-full transition-all duration-200 transform hover:-translate-y-px hover:shadow-md hover:bg-amber-400/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/20"
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