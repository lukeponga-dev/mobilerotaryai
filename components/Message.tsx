import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const LoadingDots = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
        {!message.text && showTypingIndicator && <LoadingDots />}
      </div>
    </div>
  );
};

export default Message;