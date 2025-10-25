import React from 'react';
import { Message as MessageType } from '../types';
import { WrenchIcon, SpeakerWaveIcon, StopCircleIcon } from './icons';
import { useTTSPlayer } from '../hooks/useTTSPlayer';
import Button from './Button';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const LoadingDots = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const BlinkingCursor = () => (
    <span className="inline-block w-2 h-4 bg-light-muted dark:bg-dark-muted ml-1 animate-pulse align-bottom"></span>
);

export const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    // Split by code blocks first to isolate them
    const parts = text.split(/(```[\s\S]*?```)/g).filter(Boolean);

    return (
        <div className="text-sm leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const code = part.slice(3, -3).trim();
                    return (
                        <pre key={index} className="bg-light-panel-muted dark:bg-dark-panel-muted text-light-text dark:text-dark-text p-3 rounded-md my-2 font-mono text-xs overflow-x-auto">
                            <code>{code}</code>
                        </pre>
                    );
                }

                // Process regular text with other markdown
                return part.split('\n').map((line, lineIndex) => {
                    // Handle Headings like **Title:**
                    if (line.match(/^\*\*.*:\*\*$/) || line.match(/^\*\*.*:\*\*/)) {
                        return <h3 key={`${index}-${lineIndex}`} className="font-semibold mt-3 mb-1.5">{line.replace(/\*\*/g, '')}</h3>;
                    }

                    // Handle list items
                    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                        const content = line.substring(line.indexOf(' ') + 1);
                        const boldParts = content.split(/(\*\*.*?\*\*)/g);
                        return (
                            <div key={`${index}-${lineIndex}`} className="flex items-start pl-2 my-1">
                                <span className="mr-2 mt-1 shrink-0">•</span>
                                <span className="flex-1">
                                    {boldParts.map((p, i) =>
                                        p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
                                    )}
                                </span>
                            </div>
                        );
                    }

                    // Handle paragraphs with bold text
                    const boldParts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                        <p key={`${index}-${lineIndex}`} className={line.trim() === '' ? 'h-4' : 'my-0.5'}>
                            {boldParts.map((p, i) =>
                                p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
                            )}
                        </p>
                    );
                });
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
                <div className="w-5 h-5 border-2 border-light-muted border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
                <StopCircleIcon className="w-6 h-6 text-accent" />
            ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
            )}
        </Button>
    );
};


const Message: React.FC<MessageProps> = ({ message, isLoading, isLastMessage }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-accent to-warning text-white rounded-xl rounded-br-none'
    : 'bg-light-panel-muted dark:bg-dark-panel-muted text-light-text dark:text-dark-text rounded-xl rounded-bl-none';
  const showTypingIndicator = !isUser && isLoading && isLastMessage;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in-up`}>
      <div className={`max-w-[85%] sm:max-w-md md:max-w-xl shadow-md ${bubbleClasses}`}>
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