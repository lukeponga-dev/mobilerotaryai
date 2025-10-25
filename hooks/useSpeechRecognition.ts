import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for non-standard SpeechRecognition APIs to the global Window object.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return undefined;
};

export const useSpeechRecognition = (onTranscriptChange: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscriptChange(finalTranscript);
      }
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
       if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please enable it in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech was detected. Try speaking again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscriptChange]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError(null); // Clear previous errors
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Could not start voice input.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return { isListening, startListening, stopListening, error };
};