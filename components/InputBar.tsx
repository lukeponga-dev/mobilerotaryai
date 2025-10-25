import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicrophoneIcon, VideoCameraIcon, PaperclipIcon, XIcon, BrainIcon, PhotoIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import Button from './Button';

interface InputBarProps {
  onSendMessage: (text: string, image?: string, video?: string) => void;
  isLoading: boolean;
  isDeepAnalysis?: boolean;
  onToggleDeepAnalysis?: () => void;
}

const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 25;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, isDeepAnalysis, onToggleDeepAnalysis }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentContainerRef = useRef<HTMLDivElement>(null);

  const handleTranscriptChange = (transcript: string) => {
    setText(prev => (prev.trim() ? prev.trim() + ' ' : '') + transcript);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (attachmentContainerRef.current && !attachmentContainerRef.current.contains(event.target as Node)) {
            setIsAttachmentMenuOpen(false);
        }
    };
    if (isAttachmentMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);


  const { isListening, startListening, stopListening, error: speechError } = useSpeechRecognition(handleTranscriptChange);

  const clearAttachments = () => {
    setImagePreview(null);
    setVideoPreview(null);
    setFileError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof Blob)) {
        return reject(new Error("Attempted to read a non-Blob file."));
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || imagePreview || videoPreview) && !isLoading) {
      onSendMessage(text, imagePreview || undefined, videoPreview || undefined);
      setText('');
      clearAttachments();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    const inputRef = fileType === 'image' ? imageInputRef : videoInputRef;

    if (!file) return;

    clearAttachments();
    setFileError(null);

    const isImage = fileType === 'image';
    const maxSize = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
    const maxSizeMB = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    const expectedType = isImage ? 'image/' : 'video/';
    const friendlyTypeName = isImage ? 'Image' : 'Video';

    if (file.size > maxSize) {
        setFileError(`${friendlyTypeName} file is too large. Maximum size is ${maxSizeMB}MB.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
    }

    if (!file.type.startsWith(expectedType)) {
        setFileError(`Invalid file type. Please select a${isImage ? 'n' : ''} ${fileType}.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
    }

    setIsAttaching(true);
    try {
        const base64 = await fileToBase64(file);
        if (isImage) {
            setImagePreview(base64);
        } else {
            setVideoPreview(base64);
        }
    } catch (err) {
        console.error(`Error converting ${fileType} to base64`, err);
        setFileError(`Could not load ${fileType}. Please try another file.`);
    } finally {
        setIsAttaching(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const errorMessage = speechError || fileError;

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/50">
      <div className="pt-4 pl-[calc(0.75rem+env(safe-area-inset-left,0rem))] md:pl-[calc(1rem+env(safe-area-inset-left,0rem))] pr-[calc(0.75rem+env(safe-area-inset-right,0rem))] md:pr-[calc(1rem+env(safe-area-inset-right,0rem))] pb-[calc(1rem+env(safe-area-inset-bottom,0rem))]">
        <form onSubmit={handleSubmit} className="w-full">
          {(imagePreview || videoPreview) && (
              <div className="relative w-full max-w-xs mb-3">
                  <div className="relative bg-slate-200/50 dark:bg-slate-900/50 p-2 rounded-lg">
                      {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover rounded-lg max-h-48" />}
                      {videoPreview && <video src={videoPreview} muted autoPlay loop className="w-full h-auto object-contain rounded-lg max-h-48" />}
                      <button
                          type="button"
                          onClick={clearAttachments}
                          className="absolute -top-2 -right-2 bg-slate-500 dark:bg-slate-600 text-white rounded-full p-1 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 hover:bg-red-600 transition-colors"
                          aria-label="Remove attachment"
                      >
                          <XIcon className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          )}
          {(errorMessage || isAttaching) && (
              <div className="text-xs text-center mb-2 px-2">
                  {errorMessage && <span className="text-red-500">{errorMessage}</span>}
                  {isAttaching && !errorMessage && <span className="text-slate-500 dark:text-slate-400">Loading attachment preview...</span>}
              </div>
          )}
          <div className="flex items-end gap-2 md:gap-3">
              <div className="relative" ref={attachmentContainerRef}>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
                    aria-label="Attach file"
                    disabled={isLoading || isAttaching}
                >
                    <PaperclipIcon className="w-6 h-6" />
                </Button>
                {isAttachmentMenuOpen && (
                    <div 
                        className="absolute bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700/50 z-10 p-2 animate-fade-in-up"
                        style={{animationDuration: '0.2s'}}
                    >
                        <button
                            type="button"
                            onClick={() => { imageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <PhotoIcon className="w-5 h-5" />
                            <span>Attach Image</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { videoInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <VideoCameraIcon className="w-5 h-5" />
                            <span>Attach Video</span>
                        </button>
                    </div>
                )}
              </div>

              <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
              <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
              <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                      }
                  }}
                  placeholder="Describe your issue..."
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 max-h-40 transition overflow-y-auto border border-slate-300 dark:border-slate-600/50"
                  rows={1}
                  disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleDeepAnalysis}
                className={`relative rounded-full ${isDeepAnalysis ? 'text-amber-500' : ''}`}
                aria-label={isDeepAnalysis ? 'Disable deep analysis' : 'Enable deep analysis'}
                title={isDeepAnalysis ? 'Deep analysis enabled' : 'Enable deep analysis for complex issues'}
                disabled={isLoading}
              >
                {isDeepAnalysis && <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse"></div>}
                <BrainIcon className="w-6 h-6" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={`relative rounded-full ${isListening ? 'text-amber-500' : ''}`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                disabled={isLoading}
              >
                {isListening && <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse"></div>}
                <MicrophoneIcon className="w-6 h-6" />
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="icon"
                className="rounded-full"
                disabled={isLoading || isAttaching || (!text.trim() && !imagePreview && !videoPreview)}
                aria-label="Send message"
              >
                <SendIcon className="w-6 h-6" />
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputBar;