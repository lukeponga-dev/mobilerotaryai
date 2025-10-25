import React, { useState, useEffect, useCallback } from 'react';
import { Session, Message } from './types';
import Sidebar from './components/Sidebar';
import DiagnosisPage from './pages/DiagnosisPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import DashboardPage from './pages/DashboardPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LivePage from './pages/LivePage';
import AdBanner from './components/AdBanner';
import Header from './components/Header';
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
        }, 1000);

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
            navigate('#/');
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
            doc.setTextColor(message.role === 'user' ? '#d97706' : '#333333');
            const prefix = message.role === 'user' ? 'You:' : 'AI:';
            const splitText = doc.splitTextToSize(`${prefix} ${message.text}`, 180);
            doc.text(splitText, 14, y);
            y += (splitText.length * 5) + 5;
        });
        
        doc.save(`AI-Mazda-Mechanic-Report-${session.id}.pdf`);
    };

    const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // --- Page Rendering ---
    const renderContent = () => {
        const sessionId = route.startsWith('#/session/') ? route.split('/')[2] : null;
        const activeSession = sessionId ? sessions.find(s => s.id === sessionId) : null;
        
        if (activeSession) {
            return {
                page: (
                    <DiagnosisPage
                        session={activeSession}
                        isLoading={isLoading}
                        onSendMessage={handleSendMessage}
                    />
                ),
                headerText: activeSession.name,
                showExport: true,
            };
        }

        switch (route) {
            case '#/knowledge':
                return { page: <KnowledgeBasePage />, headerText: "Knowledge Base", showExport: false };
            case '#/live':
                return { page: <LivePage />, headerText: "Live Diagnosis", showExport: false };
            case '#/privacy':
                return { page: <PrivacyPolicyPage />, headerText: "Privacy Policy", showExport: false };
            case '#/':
            default:
                return { page: <DashboardPage onNewSession={handleNewSession} />, headerText: "Dashboard", showExport: false };
        }
    };

    // FIX: Destructure the rendered page element directly to fix TypeScript prop type mismatch issues.
    const { page, headerText, showExport } = renderContent();
    const activeSessionId = route.startsWith('#/session/') ? route.split('/')[2] : null;

    return (
        <div className="h-screen w-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans relative">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <Sidebar 
                sessions={sortedSessions}
                activeSessionId={activeSessionId}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                 <Header
                    sessionName={headerText}
                    onExportPDF={showExport && activeSessionId ? () => handleExportPDF(activeSessionId) : undefined}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 flex flex-col min-w-0">
                    {page}
                </main>
                <AdBanner />
            </div>
        </div>
    );
};

export default App;