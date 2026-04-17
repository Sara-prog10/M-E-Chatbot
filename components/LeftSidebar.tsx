
import React from 'react';
import type { ChatSession } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { TrashIcon } from './icons/TrashIcon';
import type { User } from 'firebase/auth';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat?: (sessionId: string) => void;
  toggleTheme?: () => void;
  theme?: 'light' | 'dark';
  currentUser?: User;
  onSignOut?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  onClose,
  chatSessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  toggleTheme,
  theme,
  currentUser,
  onSignOut
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`absolute md:relative z-40 flex flex-col h-full w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">M&E GPT</h1>
          <div className="flex items-center gap-1">
             {toggleTheme && (
               <button onClick={toggleTheme} className="hidden md:block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                 {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5" />}
               </button>
             )}
             <button onClick={onNewChat} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
               <PlusIcon className="h-5 w-5" />
             </button>
             <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
               <XIcon className="h-5 w-5" />
             </button>
          </div>
        </div>

        <nav className="p-2 space-y-2">
            <a href="#" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 font-semibold">
                Prompts
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                Apps
            </a>
        </nav>

        <div className="flex-grow p-2 overflow-y-auto">
          <h2 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h2>
          <ul className="space-y-1">
            {chatSessions.map((session) => (
              <li key={session.id} className="relative group">
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={`w-full text-left px-4 py-2 pr-10 text-sm rounded-md truncate ${
                    activeSessionId === session.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {session.title}
                </button>
                {onDeleteChat && (
                  <button 
                    onClick={() => onDeleteChat(session.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all focus:opacity-100"
                    title="Delete chat"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex gap-2 justify-between items-center bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <img className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || currentUser?.email || 'User')}&background=random`} alt="User Avatar" />
                <div className="overflow-hidden flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{currentUser?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                </div>
            </div>
            {onSignOut && (
              <button 
                onClick={onSignOut}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                title="Sign out"
              >
                Logout
              </button>
            )}
        </div>
      </aside>
    </>
  );
};
