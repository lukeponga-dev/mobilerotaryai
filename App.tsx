import React, { useState, useEffect, useCallback } from 'react';
import { Session, Message, GroundingSource } from './types';
import Sidebar from './components/Sidebar';
import DiagnosisPage from './pages/DiagnosisPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import DashboardPage from './pages/DashboardPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LivePage from './pages/LivePage';
import LiveDashboardPage from './pages/LiveDashboardPage'; // Import the new page
import AdBanner from './components/AdBanner';
import Header from './components/Header';
import { getDiagnosticResponseStream, generateSessionTitle, extractConversationContext, generateQuickReplies } from './services/geminiService';

declare global {
    interface Window {
        jspdf: any;
    }
}

// Helper function to get image dimensions from base64 string
const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = base64;
    });
};

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
            text: 'Welcome to Rotary Mechanic. How can I help you with your Mazda RX-8 today? Please describe the issue you are experiencing.'
        }],
        createdAt: new Date().toISOString(),
        context: {symptoms: [], parts: [], actions: []},
        quickReplies: []
    }), []);

    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem('rotary_mechanic_sessions');
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
                    localStorage.setItem('rotary_mechanic_sessions', JSON.stringify(sessions));
                } catch (error) {
                    console.error("Failed to auto-save sessions to localStorage", error);
                }
            } else {
                localStorage.removeItem('rotary_mechanic_sessions');
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

    const handleSendMessage = async (sessionId: string, text: string, image?: string, video?: string, isThinkingMode?: boolean, isWebSearch?: boolean) => {
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
            const stream = getDiagnosticResponseStream(history, userMessage, isThinkingMode, isWebSearch);
            let fullResponse = '';
            const sources: GroundingSource[] = [];

            for await (const chunk of stream) {
                fullResponse += chunk.text;

                // Aggregate grounding sources from chunks if web search is enabled
                const chunkSources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
                    ?.map((c: any) => ({ uri: c.web?.uri, title: c.web?.title }))
                    .filter((s: any) => s.uri) || [];
                
                for (const source of chunkSources) {
                    if (!sources.some(s => s.uri === source.uri)) {
                        sources.push(source);
                    }
                }

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
            
            const finalModelMessage: Message = { 
                ...modelMessagePlaceholder, 
                text: fullResponse, 
                sources: sources.length > 0 ? sources : undefined 
            };
            const finalMessages = [...messagesWithUser, finalModelMessage];

            updateSessionData(sessionId, { messages: finalMessages });

            const context = await extractConversationContext(finalMessages);
            const replies = await generateQuickReplies(finalMessages);
            updateSessionData(sessionId, { context, quickReplies: replies });

        } catch (error: any) {
            console.error("Error handling stream in App.tsx", error);
            const errorMessage = error.message || 'An error occurred while streaming the response.';
            setSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? {
                        ...session,
                        messages: session.messages.map(msg =>
                            msg.id === modelMessageId
                                ? { ...msg, text: `Sorry, I ran into a problem: ${errorMessage}` }
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
    const handleExportPDF = async (sessionId: string) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        // --- Constants ---
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentW = pageW - (margin * 2);
        const accentColor = '#6366f1';
        const textColor = '#0F1724';
        const mutedColor = '#64748b';
        const lightGray = '#f1f5f9';
        const rotorIconBase64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0gMTkgMTcuNSBBIDE0IDE0IDAgMCAwIDUgMTcuNSBBIDE0IDE0IDAgMCAwIDEyIDUgQSAxNCAxNCAwIDAgMCAxOSAxNy41IFoiIC8+Cjwvc3ZnPg==`;
        let y = margin + 15; // Initial Y position after header

        // --- Helper Functions ---
        const addHeader = () => {
            doc.addImage(rotorIconBase64, 'SVG', margin, 8, 8, 8);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(textColor);
            doc.text('Rotary Mechanic', margin + 10, 14);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(mutedColor);
            doc.text('Diagnostic Report', pageW - margin, 14, { align: 'right' });
            doc.setDrawColor(mutedColor);
            doc.line(margin, 20, pageW - margin, 20);
        };

        const addFooter = () => {
            const pageCount = doc.internal.pages.length;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setDrawColor(mutedColor);
                doc.line(margin, pageH - 18, pageW - margin, pageH - 18);
                doc.setFontSize(9);
                doc.setTextColor(mutedColor);
                doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, margin, pageH - 12);
                doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 12, { align: 'right' });
            }
        };
        
        const checkPageBreak = (heightNeeded: number) => {
            if (y + heightNeeded > pageH - 25) { // 25 for footer margin
                doc.addPage();
                addHeader();
                y = margin + 15;
            }
        };

        // --- PDF Content ---
        addHeader();

        // Title Section
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(textColor);
        doc.text(session.name, margin, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        doc.text(`Session Date: ${new Date(session.createdAt).toLocaleString()}`, margin, y);
        y += 12;
        
        // Diagnosis Summary
        if (session.context && (session.context.symptoms.length > 0 || session.context.parts.length > 0 || session.context.actions.length > 0)) {
            const summaryStartY = y;
            let summaryContentHeight = 10; // For padding and title
            const listToText = (items: string[]) => items.map(item => `- ${item}`);
            
            const symptoms = listToText(session.context.symptoms);
            const parts = listToText(session.context.parts);
            const actions = listToText(session.context.actions);

            const calculateListHeight = (title: string, items: string[]) => {
                if (items.length === 0) return 0;
                let height = 8; // title height
                items.forEach(item => {
                    height += doc.splitTextToSize(item, contentW - 20).length * 5;
                });
                return height;
            };

            summaryContentHeight += calculateListHeight('Symptoms', symptoms);
            summaryContentHeight += calculateListHeight('Mentioned Parts', parts);
            summaryContentHeight += calculateListHeight('Suggested Actions', actions);
            
            checkPageBreak(summaryContentHeight + 10);
            
            doc.setFillColor(lightGray);
            doc.setDrawColor(lightGray);
            doc.roundedRect(margin, summaryStartY, contentW, summaryContentHeight, 3, 3, 'FD');

            y = summaryStartY + 8;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(textColor);
            doc.text('Diagnosis Summary', margin + 5, y);
            y += 8;

            const renderList = (title: string, items: string[]) => {
                if (items.length === 0) return;
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(mutedColor);
                doc.text(title, margin + 5, y);
                y += 5;
                doc.setFont(undefined, 'normal');
                doc.setTextColor(textColor);
                items.forEach(item => {
                    const splitText = doc.splitTextToSize(item, contentW - 20);
                    checkPageBreak(splitText.length * 5);
                    doc.text(splitText, margin + 5, y);
                    y += splitText.length * 5;
                });
                y += 4;
            };

            renderList('Symptoms', symptoms);
            renderList('Mentioned Parts', parts);
            renderList('Suggested Actions', actions);

            y = summaryStartY + summaryContentHeight + 10;
        }

        // Conversation Transcript
        checkPageBreak(15);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(textColor);
        doc.text('Conversation Transcript', margin, y);
        y += 10;

        for (const message of session.messages) {
            let textHeight = 0;
            let imageH = 0;
            const bubblePadding = 3;
            const bubbleW = contentW * 0.8;

            const splitText = message.text ? doc.setFontSize(10).splitTextToSize(message.text, bubbleW - (bubblePadding * 2)) : [];
            textHeight = splitText.length * 4.5;
            
            if (message.image) {
                try {
                    const dims = await getImageDimensions(message.image);
                    const ratio = dims.width / dims.height;
                    const width = Math.min(dims.width, bubbleW - (bubblePadding * 2));
                    imageH = width / ratio;
                } catch (e) {
                    imageH = 10; // Placeholder height for failed image
                }
            }
             if (message.video) {
                imageH += 10; // Placeholder height for video
            }

            const totalBubbleHeight = textHeight + imageH + (bubblePadding * 2) + (message.image && message.text ? 3 : 0);
            checkPageBreak(totalBubbleHeight + 5);

            const isUser = message.role === 'user';
            const x = isUser ? pageW - margin - bubbleW : margin;
            
            // Draw bubble
            doc.setFillColor(isUser ? accentColor : lightGray);
            doc.roundedRect(x, y, bubbleW, totalBubbleHeight, 3, 3, 'F');
            
            // Draw text
            if (message.text) {
                doc.setTextColor(isUser ? '#FFFFFF' : textColor);
                doc.text(splitText, x + bubblePadding, y + bubblePadding + 4);
            }
            
            let mediaY = y + bubblePadding + (message.text ? textHeight + 3 : 0);

            // Draw Image
            if (message.image) {
                try {
                    doc.addImage(message.image, undefined, x + bubblePadding, mediaY, bubbleW - (bubblePadding*2), imageH);
                } catch (e) {
                    doc.setFont(undefined, 'italic');
                    doc.setTextColor(isUser ? '#FFFFFF' : mutedColor);
                    doc.text('[Image failed to load]', x + bubblePadding, mediaY + 5);
                }
            }
            
            // Draw Video placeholder
            if (message.video) {
                doc.setFont(undefined, 'italic');
                doc.setTextColor(isUser ? '#FFFFFF' : mutedColor);
                doc.text('[Video Attached - Not viewable in PDF]', x + bubblePadding, mediaY + 5);
            }
            
            y += totalBubbleHeight + 5;
        }

        // Add footer to all pages at the end
        addFooter();
        
        doc.save(`Rotary-Mechanic-Report-${session.id}.pdf`);
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
            case '#/live-dashboard':
                return { page: <LiveDashboardPage />, headerText: "Live Dashboard", showExport: false };
            case '#/privacy':
                return { page: <PrivacyPolicyPage />, headerText: "Privacy Policy", showExport: false };
            case '#/':
            default:
                return { page: <DashboardPage onNewSession={handleNewSession} />, headerText: "Dashboard", showExport: false };
        }
    };

    const { page, headerText, showExport } = renderContent();
    const activeSessionId = route.startsWith('#/session/') ? route.split('/')[2] : null;

    return (
        <div className="h-screen w-screen flex bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans relative">
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
                    isEditable={!!activeSessionId}
                    onUpdateSessionName={activeSessionId ? (newName) => updateSessionData(activeSessionId, { name: newName }) : undefined}
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
