import React, { useEffect, useRef } from 'react';
// FIX: Adjust import path for types, assuming the actual definitions are in `src/types.ts`
import { Message as MessageType } from '../../src/types';
import Message from './Message';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-white dark:bg-slate-900">
      {messages.map((msg, index) => (
        <Message 
          key={msg.id} 
          message={msg} 
          isLoading={isLoading}
          isLastMessage={index === messages.length - 1}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;