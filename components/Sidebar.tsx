import React from 'react';
import { ChatMode } from '../types';
import UserIcon from './icons/UserIcon';
import LogoutIcon from './icons/LogoutIcon';
import BuildingIcon from './icons/BuildingIcon';
import GlobeIcon from './icons/GlobeIcon';
import DocumentIcon from './icons/DocumentIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import { Theme } from '../App';

interface SidebarProps {
  currentMode: ChatMode;
  setMode: (mode: ChatMode) => void;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, onLogout, theme, toggleTheme }) => {
  const NavButton = ({ mode, icon, label }: { mode: ChatMode; icon: React.ReactNode; label: string }) => {
    const isActive = currentMode === mode;
    return (
      <button
        onClick={() => setMode(mode)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors duration-200 ${
          isActive
            ? 'bg-gray-200/60 dark:bg-dark-bot-bubble text-primary dark:text-dark-primary'
            : 'text-secondary dark:text-dark-secondary hover:bg-gray-200/60 dark:hover:bg-dark-bot-bubble hover:text-primary dark:hover:text-dark-primary'
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-sidebar dark:bg-dark-sidebar p-2 flex flex-col border-r border-border dark:border-dark-border">
      <div className="flex-shrink-0 p-2">
        <h1 className="text-xl font-bold text-primary dark:text-dark-primary mb-6">M&E Chat</h1>
        <nav className="flex flex-col space-y-1">
          <NavButton 
            mode={ChatMode.COMPANY} 
            icon={<BuildingIcon className="w-5 h-5" />} 
            label="Company Chat" 
          />
          <NavButton 
            mode={ChatMode.GLOBAL} 
            icon={<GlobeIcon className="w-5 h-5" />} 
            label="Global Chat" 
          />
          <NavButton 
            mode={ChatMode.SUMMARIZER} 
            icon={<DocumentIcon className="w-5 h-5" />} 
            label="Summarizer" 
          />
        </nav>
      </div>
      
      <div className="flex-grow" />

      <div className="flex-shrink-0 border-t border-border dark:border-dark-border p-2 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-border dark:bg-dark-border flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-secondary dark:text-dark-secondary" />
          </div>
          <p className="font-semibold text-primary dark:text-dark-primary text-sm">Admin</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left text-sm text-secondary dark:text-dark-secondary hover:bg-gray-200/60 dark:hover:bg-dark-bot-bubble hover:text-primary dark:hover:text-dark-primary transition-colors"
        >
          {theme === 'light' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          {theme === 'light' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left text-sm text-secondary dark:text-dark-secondary hover:bg-gray-200/60 dark:hover:bg-dark-bot-bubble hover:text-primary dark:hover:text-dark-primary transition-colors"
        >
          <LogoutIcon className="w-5 h-5"/>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;