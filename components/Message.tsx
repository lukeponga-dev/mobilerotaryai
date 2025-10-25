import React from 'react';
import { Message as MessageType } from '../types';
import { RotorIcon, SpeakerWaveIcon, StopCircleIcon } from './icons';
import { useTTSPlayer } from '../hooks/useTTSPlayer';
import Button from './Button';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const LoadingDots = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const BlinkingCursor = () => (
    <span className="inline-block w-2 h-4 bg-slate-500 dark:bg-slate-300 ml-1 animate-pulse align-bottom"></span>
);

export const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    return (
      <div>
        {text.split('\n').map((line, index) => {
          // Handle lists
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const content = line.substring(line.indexOf(' ') + 1);
            const parts = content.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={index} className="flex items-start pl-4">
                <span className="mr-2 mt-1">•</span>
                <span className="flex-1">
                  {parts.map((part, i) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : (
                      part
                    )
                  )}
                </span>
              </div>
            );
          }
  
          // Handle bold text and headers
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={index} className={line.trim() === '' ? 'h-4' : ''}>
              {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>
    );
};

const TTSButton: React.FC<{ text: string }> = ({ text }) => {
    const { play, stop, isLoading, isPlaying, error } = useTTSPlayer();

    if (error) {
        return null; // Don't render button if TTS fails to initialize
    }

    const handleTogglePlay = () => {
        if (isPlaying) {
            stop();
        } else {
            play(text);
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="rounded-full"
            aria-label={isPlaying ? "Stop audio" : "Play audio"}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
                <StopCircleIcon className="w-6 h-6 text-rose-500" />
            ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
            )}
        </Button>
    );
};


const Message: React.FC<MessageProps> = ({ message, isLoading, isLastMessage }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-tr-lg'
    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-lg';
  const showTypingIndicator = !isUser && isLoading && isLastMessage;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in-up`}>
        {!isUser && (
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1 self-start">
                <RotorIcon className="w-5 h-5 text-rose-500" />
            </div>
        )}
      <div className={`max-w-[85%] sm:max-w-md md:max-w-xl rounded-2xl shadow-md ${bubbleClasses}`}>
        {message.image && (
          <img src={message.image} alt="User upload" className={`rounded-lg max-h-64 ${message.text ? 'mb-2' : ''}`} />
        )}
        {message.video && (
            <video src={message.video} controls className={`rounded-lg max-h-72 w-full ${message.text ? 'mb-2' : ''}`}></video>
        )}
        
        <div className="flex items-start justify-between gap-2 px-4 py-3">
          <div className="flex-1 min-w-0">
            {message.text ? (
                <div className="break-words">
                    <MessageContent text={message.text} />
                    {showTypingIndicator && message.text.length > 0 && <BlinkingCursor />}
                </div>
            ) : (
                showTypingIndicator && <LoadingDots />
            )}
          </div>
          {!isUser && message.text && !showTypingIndicator && (
              <div className="flex-shrink-0 self-center -mr-2">
                  <TTSButton text={message.text} />
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;