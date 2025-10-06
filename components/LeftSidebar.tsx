import React from 'react';
import type { ChatSession, Theme, User } from '../types';
import { EditIcon, PromptsIcon, MessageIcon, SunIcon, MoonIcon, UserIcon, LogoutIcon } from './icons';

interface LeftSidebarProps {
  recentChats: ChatSession[];
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  activeSessionId: string | null;
  theme: Theme;
  onToggleTheme: () => void;
  user: User;
  onLogout: () => void;
  onTogglePromptLibrary: () => void; // New prop
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ recentChats, onNewChat, onSelectChat, activeSessionId, theme, onToggleTheme, user, onLogout, onTogglePromptLibrary }) => {
  return (
    <div className="bg-white dark:bg-slate-800 h-full w-72 flex flex-col p-3 border-r border-slate-200 dark:border-slate-700">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Chat</h2>
        <button
          onClick={onNewChat}
          className="w-full mt-4 flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
        >
          New chat
          <EditIcon />
        </button>
      </div>

      <nav className="mb-6">
        <button onClick={onTogglePromptLibrary} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <PromptsIcon />
          <span className="ml-3">Prompts</span>
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent</h3>
        <div className="mt-2 space-y-1">
          {recentChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSessionId === chat.id 
                ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <MessageIcon />
              <span className="ml-3 truncate flex-1">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600">
                    <UserIcon className="h-4 w-4" />
                </div>
                <span>{user.username}</span>
            </div>
            <button
                onClick={onLogout}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400"
                aria-label="Logout"
            >
                <LogoutIcon />
            </button>
        </div>
        <div className="flex items-center justify-between px-2">
           <p className="text-xs text-slate-400">Chats saved. <a href="#" className="underline">Settings</a></p>
           <button 
             onClick={onToggleTheme}
             className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400"
             aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
             {theme === 'light' ? <MoonIcon /> : <SunIcon />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;