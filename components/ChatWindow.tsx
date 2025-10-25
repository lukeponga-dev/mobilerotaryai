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
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
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
                      <Button
                          key={i}
                          variant="secondary"
                          size="sm"
                          className="rounded-full !px-3 !py-1.5 transform-none active:scale-100"
                          onClick={() => onQuickReply(reply)}
                      >
                          {reply}
                      </Button>
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