import React, { useState } from 'react';
import PromptCard from './PromptCard';
import type { Prompt, User } from '../types';
import { ChevronDownIcon } from './icons';

interface MainPaneProps {
  clientName: string;
  onPromptSelected: (prompt: Prompt) => void;
  onEditPrompt: (prompt: Prompt) => void;
  currentUser: User;
  favoritePromptIds: string[];
  onToggleFavorite: (promptId: string) => void;
  allPrompts: Prompt[];
  favoriteCounts: Record<string, number>;
  isLoading: boolean;
}

const MainPane: React.FC<MainPaneProps> = ({ clientName, onPromptSelected, onEditPrompt, currentUser, favoritePromptIds, onToggleFavorite, allPrompts, favoriteCounts, isLoading }) => {
  const [activeTab, setActiveTab] = useState('Recommended');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const getVisiblePrompts = () => {
    switch(activeTab) {
      case 'Recommended':
        return allPrompts
          .filter(p => p.isPublic && favoriteCounts[p.id!] > 0) // Filter for public and favorited at least once
          .sort((a, b) => (favoriteCounts[b.id!] || 0) - (favoriteCounts[a.id!] || 0)); // Sort by fav count desc
      case 'Created by me':
        return allPrompts.filter(p => p.authorId === currentUser.id);
      case 'Favorites':
        return allPrompts.filter(p => p.id && favoritePromptIds.includes(p.id));
      default:
        return [];
    }
  };

  const visiblePrompts = getVisiblePrompts();
  const TABS = ['Recommended', 'Favorites', 'Created by me'];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">Ask {clientName}-GPT</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Try a prompt below to get started.</p>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex mt-8 justify-center border-b border-slate-200 dark:border-slate-700">
            {TABS.map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-brand-red text-brand-red' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>{tab}</button>
            ))}
        </div>

        {/* Mobile Dropdown */}
        <div className="lg:hidden mt-8 relative inline-block text-left w-full max-w-xs">
            <div>
                <button 
                    type="button" 
                    className="inline-flex justify-between w-full rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                    {activeTab}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>
            </div>
            {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setDropdownOpen(false);
                                }}
                                className={`${activeTab === tab ? 'font-bold text-brand-red' : 'text-slate-700 dark:text-slate-200'} block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <p>Loading prompts...</p>
            </div>
          ) : visiblePrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={() => onPromptSelected(prompt)}
                  onEdit={activeTab === 'Created by me' ? () => onEditPrompt(prompt) : undefined}
                  isFavorite={prompt.id ? favoritePromptIds.includes(prompt.id) : false}
                  onToggleFavorite={onToggleFavorite}
                  favoriteCount={favoriteCounts[prompt.id!] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
                <p>No prompts in this category yet.</p>
                 {activeTab === 'Favorites' && (
                    <p className="mt-2 text-sm">Click the bookmark icon on a prompt to add it to your favorites.</p>
                )}
                 {activeTab === 'Recommended' && (
                    <p className="mt-2 text-sm">Prompts will be recommended here once they are favorited by users.</p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPane;