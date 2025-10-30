import React from 'react';
import { Message as MessageType } from '../types';
import { WrenchIcon, SpeakerWaveIcon, StopCircleIcon, LinkIcon } from './icons';
import { useTTSPlayer } from '../hooks/useTTSPlayer';
import Button from './Button';
import Tooltip from './Tooltip';
import { technicalTerms } from '../data/technicalTerms';

const termsKeys = Object.keys(technicalTerms);
const termsRegex = new RegExp(`\\b(${termsKeys.join('|')})\\b`, 'gi');
const termsMap = new Map(termsKeys.map(key => [key.toLowerCase(), technicalTerms[key]]));

const applyTooltips = (text: string): React.ReactNode[] => {
    if (!text) return [text];
    const parts = text.split(termsRegex);
    return parts.map((part, index) => {
        const lowerCasePart = part.toLowerCase();
        const definition = termsMap.get(lowerCasePart);
        if (definition) {
            return <Tooltip key={`${part}-${index}`} content={definition}>{part}</Tooltip>;
        }
        return part;
    });
};

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
                        const content = line.replace(/\*\*/g, '');
                        return <h3 key={`${index}-${lineIndex}`} className="font-semibold mt-3 mb-1.5">{applyTooltips(content)}</h3>;
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
                                        p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{applyTooltips(p.slice(2, -2))}</strong> : applyTooltips(p)
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
                                p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{applyTooltips(p.slice(2, -2))}</strong> : applyTooltips(p)
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

// FIX: Defined missing MessageProps interface
interface MessageProps {
  message: MessageType;
  isLoading: boolean;
  isLastMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLoading, isLastMessage }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-accent to-warning text-white rounded-xl rounded-br-none'
    : 'bg-light-panel-muted dark:bg-dark-panel-muted text-light-text dark:text-dark-text rounded-xl rounded-bl-none';
  const showTypingIndicator = !isUser && isLoading && isLastMessage;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in-up`}>
      <div className={`max-w-[85%] sm:max-w-md md:max-w-xl shadow-md flex flex-col ${bubbleClasses}`}>
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
         {!isUser && message.sources && message.sources.length > 0 && !showTypingIndicator && (
            <div className="px-4 pb-3 pt-2 border-t border-light-border/20 dark:border-dark-border/40">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Sources</h4>
                <ul className="space-y-1.5">
                    {message.sources.map((source, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <LinkIcon className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted mt-0.5 flex-shrink-0" />
                            <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-accent hover:underline text-xs truncate"
                                title={source.title || source.uri}
                            >
                                {source.title || source.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;
