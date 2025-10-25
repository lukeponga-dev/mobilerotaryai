import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import { MicrophoneIcon, XCircleIcon } from '../components/icons';
import { live } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { LiveTranscript } from '../types';

// FIX: Add webkitAudioContext to window type for Safari compatibility
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

type Status = 'idle' | 'connecting' | 'live' | 'error' | 'ended';

const LivePage: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<LiveTranscript[]>([]);

    const sessionPromiseRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const currentInputIdRef = useRef<string | null>(null);
    const currentOutputIdRef = useRef<string | null>(null);

    const cleanup = useCallback(() => {
        console.log('Cleaning up resources...');
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
    }, []);

    const stopSession = useCallback(async () => {
        setStatus('ended');
        cleanup();
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
    }, [cleanup]);

    // FIX: Refactored to correctly handle transcription streams and finality.
    // The 'done' property does not exist on 'Transcription'. Finality is signaled by 'turnComplete'.
    const handleMessage = useCallback(async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            const { text } = message.serverContent.inputTranscription;
            if (!currentInputIdRef.current) {
                 currentInputIdRef.current = `transcript_${Date.now()}`;
                 setTranscript(prev => [...prev, {id: currentInputIdRef.current!, speaker: 'user', text, isFinal: false}]);
            } else {
                 setTranscript(prev => prev.map(t => t.id === currentInputIdRef.current! ? {...t, text: t.text + text } : t));
            }
        }

        if (message.serverContent?.outputTranscription) {
            const { text } = message.serverContent.outputTranscription;
            if (!currentOutputIdRef.current) {
                 currentOutputIdRef.current = `transcript_${Date.now()}`;
                 setTranscript(prev => [...prev, {id: currentOutputIdRef.current!, speaker: 'model', text, isFinal: false}]);
            } else {
                 setTranscript(prev => prev.map(t => t.id === currentOutputIdRef.current! ? {...t, text: t.text + text } : t));
            }
        }
        
        if (message.serverContent?.turnComplete) {
            setTranscript(prev => prev.map(t => {
                if ((t.id === currentInputIdRef.current || t.id === currentOutputIdRef.current) && !t.isFinal) {
                    return { ...t, isFinal: true };
                }
                return t;
            }));
            currentInputIdRef.current = null;
            currentOutputIdRef.current = null;
        }
        
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
        if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await live.utils.decodeAudioData(live.utils.decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
        }
    }, []);

    const startSession = async () => {
        setError(null);
        setTranscript([]);
        setStatus('connecting');

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            sessionPromiseRef.current = live.startSession(
                handleMessage,
                () => setStatus('live'),
                (e: ErrorEvent) => {
                    console.error('Session error', e);
                    setError('A connection error occurred.');
                    stopSession();
                },
                (e: CloseEvent) => {
                    console.log('Session closed');
                    stopSession();
                }
            );

            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            mediaStreamSourceRef.current = source;
            
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const pcmBlob = live.utils.createBlob(inputData);
                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session: any) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);

        } catch (err: any) {
            console.error('Failed to start session', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone permission denied. Please enable it in your browser settings.');
            } else {
                setError('Failed to start microphone. Please check your device.');
            }
            setStatus('error');
            cleanup();
        }
    };
    
    useEffect(() => {
        return () => {
             stopSession();
        };
    }, [stopSession]);

    const renderStatusIndicator = () => {
        switch (status) {
            case 'connecting': return <span className="text-accent">Connecting...</span>;
            case 'live': return <span className="text-success flex items-center gap-2"><div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>Live</span>;
            case 'ended': return <span className="text-light-muted dark:text-dark-muted">Session Ended</span>;
            case 'error': return <span className="text-danger">Error</span>;
            default: return <span className="text-light-muted dark:text-dark-muted">Idle</span>;
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 lg:p-8 bg-light-bg dark:bg-dark-bg">
            <div className="w-full max-w-3xl text-center">
                <h1 className="text-xl font-bold mb-1">Status: {renderStatusIndicator()}</h1>
                {error && <p className="text-danger text-sm">{error}</p>}
            </div>

            <div className="flex-1 w-full max-w-3xl my-4 overflow-y-auto bg-light-surface dark:bg-dark-surface rounded-lg p-4 border border-light-border dark:border-dark-border">
                {transcript.length === 0 && (
                    <p className="text-light-muted dark:text-dark-muted text-center italic mt-4">
                        {status === 'idle' ? 'Start the session to begin conversation.' : 'Transcript will appear here...'}
                    </p>
                )}
                <div className="space-y-4">
                    {transcript.map((item) => (
                        <div key={item.id} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-lg max-w-[80%] ${item.speaker === 'user' ? 'bg-accent text-white' : 'bg-light-panel-muted dark:bg-dark-panel-muted'}`}>
                                <p style={{ opacity: item.isFinal ? 1 : 0.7 }}>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                 {status === 'live' && (
                    <div className="text-center text-light-muted dark:text-dark-muted">
                        <p>Speak into your microphone now.</p>
                        <p className="text-xs">The AI will respond automatically.</p>
                    </div>
                )}
                {status === 'idle' || status === 'error' || status === 'ended' ? (
                    <Button onClick={startSession} size="lg" className="gap-3 group">
                        <MicrophoneIcon className="w-6 h-6" />
                        <span>Start Conversation</span>
                    </Button>
                ) : (
                    <Button onClick={stopSession} variant="destructive" size="lg" className="gap-3">
                        <XCircleIcon className="w-6 h-6" />
                        <span>Stop Session</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default LivePage;