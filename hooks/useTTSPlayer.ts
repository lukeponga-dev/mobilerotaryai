import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { live } from '../services/geminiService';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

export const useTTSPlayer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            } catch (e) {
                console.error("Failed to create AudioContext", e);
                setError("Audio playback is not supported in your browser.");
                return null;
            }
        }
        return audioContextRef.current;
    }, []);

    const play = useCallback(async (text: string) => {
        if (isLoading || isPlaying) {
            return;
        }

        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        // Resume context if it's suspended (e.g., due to browser autoplay policies)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        setIsLoading(true);
        setError(null);

        try {
            const base64Audio = await generateSpeech(text);
            const decodedAudio = live.utils.decode(base64Audio);
            const audioBuffer = await live.utils.decodeAudioData(decodedAudio, audioCtx, 24000, 1);
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                sourceRef.current = null;
            };

            source.start(0);
            sourceRef.current = source;
            setIsPlaying(true);

        } catch (err: any) {
            console.error("TTS playback error:", err);
            setError(err.message || "Failed to play audio.");
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }

    }, [isLoading, isPlaying, getAudioContext]);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch(e) {
                console.warn("Audio source could not be stopped:", e)
            }
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stop();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stop]);

    return { play, stop, isLoading, isPlaying, error };
};