import React, { useState, useRef } from 'react';
import { SendIcon, MicrophoneIcon, VideoCameraIcon, PaperclipIcon, XIcon, BrainIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import Button from './Button';

interface InputBarProps {
  onSendMessage: (text: string, image?: string, video?: string) => void;
  isLoading: boolean;
  isDeepAnalysis?: boolean;
  onToggleDeepAnalysis?: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, isDeepAnalysis, onToggleDeepAnalysis }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscriptChange = (transcript: string) => {
    setText(prev => (prev.trim() ? prev.trim() + ' ' : '') + transcript);
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      clearAttachments();
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setImagePreview(base64);
      } catch (err) {
        console.error("Error converting image to base64", err);
        setFileError("Could not load image. Please try another file.");
      }
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        clearAttachments();
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            setVideoPreview(base64);
        } catch (err) {
            console.error("Error converting video to base64", err);
            setFileError("Could not load video. Please try another file.");
        }
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
      <div className="pt-3 md:pt-4 pl-[calc(0.75rem+env(safe-area-inset-left,0rem))] md:pl-[calc(1rem+env(safe-area-inset-left,0rem))] pr-[calc(0.75rem+env(safe-area-inset-right,0rem))] md:pr-[calc(1rem+env(safe-area-inset-right,0rem))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0rem))] md:pb-[calc(1rem+env(safe-area-inset-bottom,0rem))]">
        <form onSubmit={handleSubmit} className="w-full">
          {(imagePreview || videoPreview) && (
              <div className="relative w-full max-w-xs mb-3">
                  <div className="relative bg-slate-200/50 dark:bg-slate-900/50 p-2 rounded-lg">
                      {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover rounded-lg max-h-48" />}
                      {videoPreview && <video src={videoPreview} muted autoPlay loop className="w-full h-auto object-contain rounded-lg max-h-48" />}
                      <button
                          type="button"
                          onClick={clearAttachments}
                          className="absolute -top-2 -right-2 bg-slate-500 dark:bg-slate-600 text-white rounded-full p-1 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 hover:bg-rose-600 transition-colors"
                          aria-label="Remove attachment"
                      >
                          <XIcon className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          )}
          {errorMessage && (
              <div className="text-rose-500 text-xs text-center mb-2 px-2">
                  {errorMessage}
              </div>
          )}
          <div className="flex items-end gap-2 md:gap-3">
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Attach image"
                  disabled={isLoading}
              >
                  <PaperclipIcon className="w-6 h-6" />
              </Button>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => videoInputRef.current?.click()}
                  aria-label="Attach video"
                  disabled={isLoading}
              >
                  <VideoCameraIcon className="w-6 h-6" />
              </Button>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
              <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoChange} className="hidden" />
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
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 max-h-40 transition overflow-y-auto"
                  rows={1}
                  disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleDeepAnalysis}
                className={`relative rounded-full ${isDeepAnalysis ? 'text-rose-500' : ''}`}
                aria-label={isDeepAnalysis ? 'Disable deep analysis' : 'Enable deep analysis'}
                title={isDeepAnalysis ? 'Deep analysis enabled' : 'Enable deep analysis for complex issues'}
                disabled={isLoading}
              >
                {isDeepAnalysis && <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-pulse"></div>}
                <BrainIcon className="w-6 h-6" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={`relative rounded-full ${isListening ? 'text-rose-500' : ''}`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                disabled={isLoading}
              >
                {isListening && <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-pulse"></div>}
                <MicrophoneIcon className="w-6 h-6" />
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="icon"
                className="rounded-full transform transition-transform duration-150 ease-out active:scale-90 active:-translate-y-0.5"
                disabled={isLoading || (!text.trim() && !imagePreview && !videoPreview)}
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