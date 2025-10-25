import React, { useState, useRef } from 'react';
import { SendIcon, MicrophoneIcon, VideoCameraIcon, PaperclipIcon, XIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface InputBarProps {
  onSendMessage: (text: string, image?: string, video?: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscriptChange = (transcript: string) => {
    setText(prev => (prev.trim() ? prev.trim() + ' ' : '') + transcript);
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition(handleTranscriptChange);

  const clearAttachments = () => {
    setImagePreview(null);
    setVideoPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // FIX: Add a runtime check to ensure the file is a Blob. This prevents the
      // "parameter 1 is not of type 'Blob'" error if an invalid value is passed.
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
      const base64 = await fileToBase64(e.target.files[0]);
      setImagePreview(base64);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        clearAttachments();
        const base64 = await fileToBase64(e.target.files[0]);
        setVideoPreview(base64);
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

  return (
    <div className="p-3 md:p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/50">
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
        <div className="flex items-end gap-2 md:gap-3">
            <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                aria-label="Attach image"
                disabled={isLoading}
            >
                <PaperclipIcon className="w-6 h-6" />
            </button>
             <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                aria-label="Attach video"
                disabled={isLoading}
            >
                <VideoCameraIcon className="w-6 h-6" />
            </button>
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
            <button
            type="button"
            onClick={toggleListening}
            className={`p-2 transition-colors relative ${isListening ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            disabled={isLoading}
            >
            {isListening && <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-pulse"></div>}
            <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button
            type="submit"
            className="p-2 text-white bg-rose-600 rounded-full hover:bg-rose-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || (!text.trim() && !imagePreview && !videoPreview)}
            aria-label="Send message"
            >
            <SendIcon className="w-6 h-6" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default InputBar;