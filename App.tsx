
import React, { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { LeftSidebar } from './components/LeftSidebar';
import { MainPane } from './components/MainPane';
import { ChatWindow } from './components/ChatWindow';
import { HamburgerIcon } from './components/icons/HamburgerIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { Toast } from './components/Toast';
import type { ChatSession, Message, UploadedFile, Toast as ToastType } from './types';
import { MessageAuthor, ChatMode } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sendMessage as apiSendMessage } from './services/api';
import { USER_ID } from './constants';
import { AuthPage } from './components/AuthPage';
import { useFirestore } from './hooks/useFirestore';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  
  // Theme state
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const { chatSessions, customPrompts, saveChatSession, saveCustomPrompt, deleteChatSession, setChatSessions } = useFirestore(currentUser?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Hide sidebar on small screens by default
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== newToast.id));
    }, 3000);
  }, []);

  const createNewSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const selectChatSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const startChatFromPrompt = useCallback((promptText: string, file?: UploadedFile) => {
    sendMessage(promptText, ChatMode.COMPANY, file ? [file.fileId] : undefined, null, true);
  }, [chatSessions, activeSessionId, currentUser]); // Ensure it updates when sendMessage closure updates

  const sendMessage = async (
    message: string, 
    chatMode: ChatMode, 
    fileIds?: string[], 
    sessionIdOverride?: string | null,
    forceNewSession?: boolean
  ) => {
    if (!currentUser) return;
    
    const currentSessionId = forceNewSession ? null : (sessionIdOverride || activeSessionId);
    
    if (!message.trim()) return;
    setIsLoading(true);

    const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = { id: generateId('msg'), author: MessageAuthor.USER, text: message };

    let sessionToUpdate: ChatSession;

    if (!currentSessionId) {
        const newSessionId = generateId('session');
        sessionToUpdate = {
            id: newSessionId,
            title: message.substring(0, 40) + '...',
            messages: [userMessage],
            createdAt: Date.now(),
        };
        setActiveSessionId(newSessionId);
        setChatSessions(prev => [sessionToUpdate, ...prev]);
    } else {
        const existingSession = chatSessions.find(s => s.id === currentSessionId);
        if (!existingSession) {
          setIsLoading(false);
          console.error("Session not found");
          return;
        }
        sessionToUpdate = { ...existingSession, messages: [...existingSession.messages, userMessage] };
        setChatSessions(prev => prev.map(s => s.id === currentSessionId ? sessionToUpdate : s));
    }
    
    // Save to Firestore before waiting for API
    await saveChatSession(currentUser.uid, sessionToUpdate);
    
    try {
        const response = await apiSendMessage(currentUser.uid, sessionToUpdate.id, chatMode, message, fileIds);
        const aiMessage: Message = {
            id: response.responseId,
            author: MessageAuthor.AI,
            text: response.answer,
            sources: response.sources,
            responseId: response.responseId,
        };
        
        sessionToUpdate = { ...sessionToUpdate, messages: [...sessionToUpdate.messages, aiMessage] };
        setChatSessions(prev => prev.map(s => s.id === sessionToUpdate.id ? sessionToUpdate : s));
        await saveChatSession(currentUser.uid, sessionToUpdate);
    } catch (error) {
        console.error('Error sending message:', error);
        addToast('Failed to get a response.', 'error');
        const errorMessage: Message = {
            id: generateId('err'),
            author: MessageAuthor.AI,
            text: 'Sorry, I encountered an error. Please try again.',
        };
        
        sessionToUpdate = { ...sessionToUpdate, messages: [...sessionToUpdate.messages, errorMessage] };
        setChatSessions(prev => prev.map(s => s.id === sessionToUpdate.id ? sessionToUpdate : s));
        await saveChatSession(currentUser.uid, sessionToUpdate);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSavePrompt = (title: string, description: string) => {
    if (!currentUser) return;
    const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    saveCustomPrompt(currentUser.uid, {
      id: generateId('prompt'),
      title,
      description,
      author: currentUser.displayName || currentUser.email || 'You',
    });
    addToast('Prompt saved successfully!');
  };

  const handleDeleteChat = async (sessionId: string) => {
    if (!currentUser) return;
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    await deleteChatSession(currentUser.uid, sessionId);
    addToast('Chat deleted successfully!');
  };

  if (!isAuthReady) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>;
  }

  if (!currentUser) {
    return <AuthPage onSuccess={() => {}} />;
  }

  const activeSession = chatSessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <LeftSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewSession}
        onSelectChat={selectChatSession}
        onDeleteChat={handleDeleteChat}
        toggleTheme={toggleTheme}
        theme={theme}
        currentUser={currentUser}
        onSignOut={() => signOut(auth)}
      />
      <main className="flex-1 flex flex-col transition-all duration-300 min-w-0">
        <header className="flex items-center justify-between p-2 md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <HamburgerIcon className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5" />}
          </button>
        </header>
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeSession ? (
            <ChatWindow session={activeSession} onSendMessage={sendMessage} isLoading={isLoading} />
          ) : (
            <MainPane 
              onPromptSelect={startChatFromPrompt} 
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
              customPrompts={customPrompts}
              onSavePrompt={handleSavePrompt}
            />
          )}
        </div>
      </main>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(current => current.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;
