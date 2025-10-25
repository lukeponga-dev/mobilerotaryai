import React from 'react';
// FIX: Adjust import path for types, assuming the actual definitions are in `src/types.ts`
import { Message as MessageType } from '../../src/types';
import { RotorIcon } from './icons';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const LoadingIndicator = () => (
    <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
        <RotorIcon className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">RotorWise AI is thinking...</span>
    </div>
);

const BlinkingCursor = () => (
    <span className="inline-block w-2 h-4 bg-slate-500 dark:bg-slate-300 ml-1 animate-pulse align-bottom"></span>
);

const Message: React.FC<MessageProps> = ({ message, isLoading, isLastMessage }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-rose-600 text-white rounded-br-none'
    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none';

  const showTypingIndicator = !isUser && isLoading && isLastMessage;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] sm:max-w-md md:max-w-xl px-4 py-3 rounded-xl shadow-md ${bubbleClasses}`}>
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-64" />
        )}
        {message.video && (
            <video src={message.video} controls className="rounded-lg mb-2 max-h-72 w-full"></video>
        )}
        
        {message.text && (
            <p className="whitespace-pre-wrap break-words">
                {message.text}
                {showTypingIndicator && <BlinkingCursor />}
            </p>
        )}
        {!message.text && showTypingIndicator && <LoadingIndicator />}
      </div>
    </div>
  );
};

export default Message;