import React, { useState, useEffect, useCallback } from 'react';
import { Session, Message } from './types';
import Sidebar from './components/Sidebar';
import DiagnosisPage from './pages/DiagnosisPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import DashboardPage from './pages/DashboardPage';
import SessionsListPage from './pages/SessionsListPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LivePage from './pages/LivePage';
import AdBanner from './components/AdBanner';
import { getDiagnosticResponseStream, generateSessionTitle, extractConversationContext, generateQuickReplies } from './services/geminiService';

declare global {
    interface Window {
        jspdf: any;
    }
}

const App: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [route, setRoute] = useState(window.location.hash || '#/');

    // --- Routing ---
    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string) => {
        window.location.hash = path;
    };

    // --- Session Management ---
    const createNewSession = useCallback((): Session => ({
        id: `session_${Date.now()}`,
        name: `New Diagnosis...`,
        messages: [{
            id: `msg_${Date.now()}`,
            role: 'model',
            text: 'Welcome to AI Mazda Mechanic. How can I help you with your Mazda RX-8 today? Please describe the issue you are experiencing.'
        }],
        createdAt: new Date().toISOString(),
        context: {symptoms: [], parts: [], actions: []},
        quickReplies: []
    }), []);

    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem('rotorwise_sessions');
            if (savedSessions) {
                const parsedSessions: Session[] = JSON.parse(savedSessions);
                setSessions(parsedSessions);
            } else {
                setSessions([createNewSession()]);
            }
        } catch (error) {
            console.error("Failed to load sessions from localStorage", error);
            setSessions([createNewSession()]);
        }
    }, [createNewSession]);

    // Auto-save sessions with debounce
    useEffect(() => {
        const autoSave = setTimeout(() => {
            if (sessions.length > 0) {
                try {
                    localStorage.setItem('rotorwise_sessions', JSON.stringify(sessions));
                } catch (error) {
                    console.error("Failed to auto-save sessions to localStorage", error);
                }
            } else {
                localStorage.removeItem('rotorwise_sessions');
            }
        }, 1000); // Debounce save by 1 second

        return () => clearTimeout(autoSave);
    }, [sessions]);
    
    const handleNewSession = () => {
        const newSession = createNewSession();
        setSessions(prev => [newSession, ...prev]);
        navigate(`#/session/${newSession.id}`);
        setIsSidebarOpen(false);
    };

    const handleDeleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (route === `#/session/${id}`) {
            navigate('#/sessions');
        }
    };
    
    // --- AI Interaction ---
    const updateSessionData = (sessionId: string, updates: Partial<Session>) => {
        setSessions(prev => prev.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
        ));
    };

    const handleSendMessage = async (sessionId: string, text: string, image?: string, video?: string, isDeepAnalysis?: boolean) => {
        const currentSession = sessions.find(s => s.id === sessionId);
        if (!currentSession) return;
        
        // Clear previous quick replies when user sends a new message
        updateSessionData(sessionId, { quickReplies: [] });

        const userMessage: Message = { id: `msg_user_${Date.now()}`, role: 'user', text, image, video };
        const messagesWithUser = [...currentSession.messages, userMessage];
        updateSessionData(sessionId, { messages: messagesWithUser });
        setIsLoading(true);

        if (currentSession.name === 'New Diagnosis...' && text.trim()) {
            const title = await generateSessionTitle(text);
            updateSessionData(sessionId, { name: title });
        }

        const modelMessageId = `msg_model_${Date.now()}`;
        const modelMessagePlaceholder: Message = { id: modelMessageId, role: 'model', text: '' };
        updateSessionData(sessionId, { messages: [...messagesWithUser, modelMessagePlaceholder] });

        const history = currentSession.messages.slice(1);
        
        try {
            const stream = getDiagnosticResponseStream(history, userMessage, isDeepAnalysis);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSessions(prev => prev.map(session =>
                    session.id === sessionId
                        ? {
                            ...session,
                            messages: session.messages.map(msg =>
                                msg.id === modelMessageId
                                    ? { ...msg, text: fullResponse }
                                    : msg
                            ),
                        }
                        : session
                ));
            }
            
            const finalMessages = [...messagesWithUser, { ...modelMessagePlaceholder, text: fullResponse }];
            const context = await extractConversationContext(finalMessages);
            const replies = await generateQuickReplies(finalMessages);
            updateSessionData(sessionId, { context, quickReplies: replies });

        } catch (error) {
            console.error("Error handling stream in App.tsx", error);
            setSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? {
                        ...session,
                        messages: session.messages.map(msg =>
                            msg.id === modelMessageId
                                ? { ...msg, text: 'An error occurred while streaming the response.' }
                                : msg
                        ),
                    }
                    : session
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // --- PDF Export ---
    const handleExportPDF = (sessionId: string) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        doc.setFontSize(18);
        doc.text("AI Mazda Mechanic Diagnostic Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Session: ${session.name}`, 14, 30);
        doc.line(14, 32, 196, 32);
        let y = 40;

        session.messages.forEach(message => {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.setFont(undefined, message.role === 'user' ? 'bold' : 'normal');
            doc.setTextColor(message.role === 'user' ? '#be123c' : '#333333');
            const prefix = message.role === 'user' ? 'You:' : 'AI:';
            const splitText = doc.splitTextToSize(`${prefix} ${message.text}`, 180);
            doc.text(splitText, 14, y);
            y += (splitText.length * 5) + 5;
        });
        
        doc.save(`AI-Mazda-Mechanic-Report-${session.id}.pdf`);
    };

    // --- Page Rendering ---
    const renderPage = () => {
        const sessionId = route.startsWith('#/session/') ? route.split('/')[2] : null;
        const onToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
        
        if (sessionId) {
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return <SessionsListPage sessions={sessions} onDeleteSession={handleDeleteSession} onNewSession={handleNewSession} onToggleSidebar={onToggleSidebar} />;
            return (
                <DiagnosisPage
                    session={session}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    onExportPDF={handleExportPDF}
                    onToggleSidebar={onToggleSidebar}
                />
            );
        }

        switch (route) {
            case '#/sessions':
                return <SessionsListPage sessions={sessions} onDeleteSession={handleDeleteSession} onNewSession={handleNewSession} onToggleSidebar={onToggleSidebar} />;
            case '#/knowledge':
                return <KnowledgeBasePage onToggleSidebar={onToggleSidebar} />;
            case '#/live':
                return <LivePage onToggleSidebar={onToggleSidebar} />;
            case '#/privacy':
                return <PrivacyPolicyPage onToggleSidebar={onToggleSidebar} />;
            case '#/':
            default:
                return <DashboardPage sessions={sessions} onNewSession={handleNewSession} onToggleSidebar={onToggleSidebar} />;
        }
    };

    return (
        <div className="h-screen w-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <Sidebar 
                activeRoute={route}
                onNewSession={handleNewSession}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 flex flex-col min-w-0">
                    {renderPage()}
                </main>
                <AdBanner />
            </div>
        </div>
    );
};

export default App;