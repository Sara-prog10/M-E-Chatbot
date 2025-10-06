import React, { useState } from 'react';
import PromptCard from './PromptCard';
import type { Prompt, User } from '../types';

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

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">Ask {clientName}-GPT</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Try a prompt below to get started.</p>

        <div className="mt-8 flex justify-center border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveTab('Recommended')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'Recommended' ? 'border-b-2 border-brand-red text-brand-red' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>Recommended</button>
          <button onClick={() => setActiveTab('Favorites')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'Favorites' ? 'border-b-2 border-brand-red text-brand-red' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>Favorites</button>
          <button onClick={() => setActiveTab('Created by me')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'Created by me' ? 'border-b-2 border-brand-red text-brand-red' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>Created by me</button>
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