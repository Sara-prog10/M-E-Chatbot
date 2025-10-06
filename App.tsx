import React, { useState, useEffect, useCallback, useRef } from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainPane from './components/MainPane';
import ChatWindow from './components/ChatWindow';
import ChatInputBar from './components/ChatInputBar';
import LoginPage from './components/LoginPage';
import CreatePromptModal from './components/CreatePromptModal';
import PromptDetailModal from './components/PromptDetailModal';
import PromptLibrarySidebar from './components/PromptLibrarySidebar';
import { Toast } from './components/Toast';
import { MenuIcon, XIcon, CreatePromptIcon } from './components/icons';
import type { ChatSession, Message, Toast as ToastType, Theme, User, Prompt } from './types';
import { sendChatMessage } from './services/apiService';
import { getPrompts, savePrompt as savePromptToFirebase, updatePrompt as updatePromptInFirebase, getUserFavorites, addFavorite, removeFavorite, getAllFavorites } from './services/firebaseService';
import { v4 as uuidv4 } from 'uuid';

// --- Configuration ---
const CLIENT_NAME = "M&E";
const API_BASE = "https://theintellect.app.n8n.cloud";

// --- Main App Component ---
const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({});
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isCreatePromptModalOpen, setCreatePromptModalOpen] = useState(false);
    const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);
    const [promptsVersion, setPromptsVersion] = useState(0); // Used to trigger refetch
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
    const [favoritePromptIds, setFavoritePromptIds] = useState<string[]>([]);
    const [isPromptDetailModalOpen, setPromptDetailModalOpen] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [promptToPaste, setPromptToPaste] = useState<string | null>(null);
    const [isPromptLibraryOpen, setPromptLibraryOpen] = useState(false);
    const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
    
    // New state for popularity
    const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);

    const objectUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Cleanup object URLs on unmount to prevent memory leaks
        return () => {
            objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (!currentUser) return;
        
        const loadUserData = async () => {
            setIsLoadingPrompts(true);
            try {
                // Load chat sessions
                const savedSessions = localStorage.getItem(`chatSessions_${currentUser.id}`);
                setChatSessions(savedSessions ? JSON.parse(savedSessions) : {});
                
                // Fetch all data concurrently
                const [favorites, prompts, allFavsData] = await Promise.all([
                    getUserFavorites(currentUser.id),
                    getPrompts(),
                    getAllFavorites()
                ]);

                setFavoritePromptIds(favorites);
                setAllPrompts(prompts);
                setFavoriteCounts(allFavsData);

            } catch (error) {
                console.error("Failed to load user data:", error);
                addToast({ type: 'error', message: 'Could not load your data.' });
            } finally {
                setIsLoadingPrompts(false);
            }
        };
        
        loadUserData();

    }, [currentUser, promptsVersion]); // Refetch prompts when version changes

    useEffect(() => {
        if (!currentUser || Object.keys(chatSessions).length === 0) return;
        try {
            localStorage.setItem(`chatSessions_${currentUser.id}`, JSON.stringify(chatSessions));
        } catch (error) {
            console.error("Failed to save chat sessions:", error);
        }
    }, [chatSessions, currentUser]);

    const addToast = (toast: Omit<ToastType, 'id'>) => {
        setToasts(prev => [...prev, { ...toast, id: uuidv4() }]);
    };
    
    const handleCreateNewChat = () => {
        setActiveSessionId(null);
    };

    const handleSelectChat = (sessionId: string) => {
        setActiveSessionId(sessionId);
    };
    
    const handleLogin = (username: string, password: string): boolean => {
        // IMPORTANT: This is an insecure, client-side authentication for demonstration purposes only.
        // In a real application, this logic MUST be handled by a secure backend authentication service.
        let user: User | null = null;
        if (username === 'User1' && password === 'User1@megpt') {
            user = { id: 'user1', username: 'User1' };
        } else if (username === 'User2' && password === 'User2@megpt') {
            user = { id: 'user2', username: 'User2' };
        }

        if (user) {
            setCurrentUser(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        setChatSessions({});
        setActiveSessionId(null);
        setFavoritePromptIds([]);
    };

    const handleSendMessage = useCallback(async (message: string, chatMode: 'company' | 'global', file?: File) => {
        if ((!message.trim() && !file) || isSending || !currentUser) return;

        setIsSending(true);
        let currentSessionId = activeSessionId;

        let attachmentData: Message['attachment'] | undefined = undefined;
        if (file) {
            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file);
                objectUrlsRef.current.add(imageUrl);
                attachmentData = { type: 'image', url: imageUrl, name: file.name };
            } else {
                attachmentData = { type: 'other', name: file.name };
            }
        }

        const userMessage: Message = { 
            id: uuidv4(), 
            role: 'user', 
            content: message,
            attachment: attachmentData
        };

        const sessionTitle = message.substring(0, 40) || (file ? file.name.substring(0, 40) : "New Chat");

        if (!currentSessionId) {
            currentSessionId = uuidv4();
            const newSession: ChatSession = {
                id: currentSessionId,
                title: sessionTitle,
                messages: [userMessage],
                createdAt: new Date().toISOString(),
            };
            setChatSessions(prev => ({ ...prev, [currentSessionId!]: newSession }));
            setActiveSessionId(currentSessionId);
        } else {
            setChatSessions(prev => ({
                ...prev,
                [currentSessionId!]: {
                    ...prev[currentSessionId!],
                    messages: [...prev[currentSessionId!].messages, userMessage],
                },
            }));
        }

        try {
            const response = await sendChatMessage({
                userId: currentUser.id,
                sessionId: currentSessionId,
                message: message,
                chatMode: chatMode,
            }, API_BASE, file);

            const assistantMessage: Message = {
                id: response.responseId || uuidv4(),
                role: 'assistant',
                content: response.answer,
                sources: response.sources,
            };

            setChatSessions(prev => ({
                ...prev,
                [currentSessionId!]: {
                    ...prev[currentSessionId!],
                    messages: [...prev[currentSessionId!].messages, assistantMessage],
                },
            }));
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true,
            };
            setChatSessions(prev => ({
                ...prev,
                [currentSessionId!]: {
                    ...prev[currentSessionId!],
                    messages: [...prev[currentSessionId!].messages, errorMessage],
                },
            }));
            addToast({ type: 'error', message: 'Failed to get a response.' });
        } finally {
            setIsSending(false);
        }
    }, [activeSessionId, chatSessions, isSending, currentUser]);
    
    const handlePromptSelected = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setPromptDetailModalOpen(true);
    };

    const handleUsePrompt = (promptText: string) => {
        setPromptToPaste(promptText);
        setPromptDetailModalOpen(false);
        setSelectedPrompt(null);
    };

    const handlePasteComplete = () => {
        setPromptToPaste(null);
    };

    const handleOpenCreatePromptModal = () => {
        setPromptToEdit(null);
        setCreatePromptModalOpen(true);
    };

    const handleOpenEditPromptModal = (prompt: Prompt) => {
        setPromptToEdit(prompt);
        setCreatePromptModalOpen(true);
    };
    
    const handleSavePrompt = async (promptData: Prompt) => {
        if (!currentUser) {
            addToast({ type: 'error', message: 'You must be logged in to save a prompt.' });
            return;
        }
        try {
            if (promptData.id) { // This is an update
                await updatePromptInFirebase(promptData.id, promptData);
                addToast({ type: 'success', message: 'Prompt updated successfully!' });
            } else { // This is a new prompt
                await savePromptToFirebase({
                    ...promptData,
                    author: currentUser.username,
                    authorId: currentUser.id,
                });
                addToast({ type: 'success', message: 'Prompt saved successfully!' });
            }
            setCreatePromptModalOpen(false);
            setPromptToEdit(null);
            setPromptsVersion(v => v + 1); // Trigger refresh
        } catch (error) {
            console.error("Failed to save prompt:", error);
            addToast({ type: 'error', message: 'Could not save prompt.' });
        }
    };

    const handleToggleFavorite = async (promptId: string) => {
        if (!currentUser) return;
        
        const isFavorited = favoritePromptIds.includes(promptId);
        
        try {
            if (isFavorited) {
                await removeFavorite(currentUser.id, promptId);
                setFavoritePromptIds(prev => prev.filter(id => id !== promptId));
                setFavoriteCounts(prev => ({ ...prev, [promptId]: (prev[promptId] || 1) - 1 }));
                addToast({ type: 'info', message: 'Removed from favorites.' });
            } else {
                await addFavorite(currentUser.id, promptId);
                setFavoritePromptIds(prev => [...prev, promptId]);
                setFavoriteCounts(prev => ({ ...prev, [promptId]: (prev[promptId] || 0) + 1 }));
                addToast({ type: 'success', message: 'Added to favorites!' });
            }
        } catch (error) {
            console.error("Failed to update favorites:", error);
            addToast({ type: 'error', message: 'Could not update favorites.' });
        }
    };

    const handleTogglePromptLibrary = () => {
        setPromptLibraryOpen(prev => !prev);
    };

    const handleSelectPromptFromLibrary = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setPromptDetailModalOpen(true);
        setPromptLibraryOpen(false);
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const activeChat = activeSessionId ? chatSessions[activeSessionId] : null;

    return (
        <>
            <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
                <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-72`}>
                    <LeftSidebar
                        recentChats={Object.values(chatSessions).sort((a: ChatSession, b: ChatSession) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                        onNewChat={handleCreateNewChat}
                        onSelectChat={handleSelectChat}
                        activeSessionId={activeSessionId}
                        theme={theme}
                        onToggleTheme={handleToggleTheme}
                        user={currentUser}
                        onLogout={handleLogout}
                        onTogglePromptLibrary={handleTogglePromptLibrary}
                    />
                </div>

                <div className="flex-1 flex flex-col relative">
                    <header className="hidden lg:flex justify-end items-center p-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-100 dark:bg-slate-900 z-20">
                         <button 
                            onClick={handleOpenCreatePromptModal}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                         >
                            <CreatePromptIcon />
                            Create prompt
                        </button>
                    </header>
                    <header className="lg:hidden p-2 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Ask {CLIENT_NAME}-GPT</h1>
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                            {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </header>
                    
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        {activeChat ? (
                            <ChatWindow session={activeChat} isSending={isSending} />
                        ) : (
                            <MainPane 
                                clientName={CLIENT_NAME} 
                                onPromptSelected={handlePromptSelected}
                                onEditPrompt={handleOpenEditPromptModal}
                                currentUser={currentUser}
                                favoritePromptIds={favoritePromptIds}
                                onToggleFavorite={handleToggleFavorite}
                                allPrompts={allPrompts}
                                favoriteCounts={favoriteCounts}
                                isLoading={isLoadingPrompts}
                            />
                        )}

                        <div className="px-4 pb-4 w-full mt-auto bg-slate-100 dark:bg-slate-900">
                           <ChatInputBar 
                             onSendMessage={handleSendMessage} 
                             isSending={isSending}
                             clientName={CLIENT_NAME}
                             promptToPaste={promptToPaste}
                             onPasteComplete={handlePasteComplete}
                           />
                        </div>
                    </div>
                </div>

                 <PromptLibrarySidebar 
                    isOpen={isPromptLibraryOpen}
                    onClose={() => setPromptLibraryOpen(false)}
                    prompts={allPrompts}
                    onPromptSelect={handleSelectPromptFromLibrary}
                />
                
                <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
                    {toasts.map(toast => (
                        <Toast key={toast.id} toast={toast} onClose={() => setToasts(t => t.filter(item => item.id !== toast.id))} />
                    ))}
                </div>
            </div>
            <CreatePromptModal 
                isOpen={isCreatePromptModalOpen}
                onClose={() => {
                    setCreatePromptModalOpen(false);
                    setPromptToEdit(null);
                }}
                onSave={handleSavePrompt}
                promptToEdit={promptToEdit}
            />
            <PromptDetailModal
                isOpen={isPromptDetailModalOpen}
                onClose={() => {
                    setPromptDetailModalOpen(false);
                    setSelectedPrompt(null);
                }}
                prompt={selectedPrompt}
                onUsePrompt={handleUsePrompt}
            />
        </>
    );
};

export default App;