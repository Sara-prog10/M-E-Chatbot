import React, { useState, useMemo } from 'react';
import type { Prompt } from '../types';
import { XIcon } from './icons';

interface PromptLibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}

const PromptLibrarySidebar: React.FC<PromptLibrarySidebarProps> = ({ isOpen, onClose, prompts, onPromptSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrompts = useMemo(() => {
    if (!searchTerm.trim()) {
      return prompts;
    }
    return prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prompts, searchTerm]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white dark:bg-slate-800 z-40 shadow-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Prompt Library</h2>
            <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <XIcon />
            </button>
          </div>
          
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPrompts.length > 0 ? (
              <ul className="p-2">
                {filteredPrompts.map(prompt => (
                  <li key={prompt.id}>
                    <button 
                      onClick={() => onPromptSelect(prompt)}
                      className="w-full text-left p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {prompt.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-sm text-slate-500">No prompts found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptLibrarySidebar;