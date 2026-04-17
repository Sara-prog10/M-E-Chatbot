
import React, { useState } from 'react';
import type { Prompt, UploadedFile, ChatMode } from '../types';
import { PromptCard } from './PromptCard';
import { CreatePromptModal } from './CreatePromptModal';
import { CLIENT_NAME, RECOMMENDED_PROMPTS } from '../constants';
import { ChatInputBar } from './ChatInputBar';

interface MainPaneProps {
  onPromptSelect: (promptText: string, file?: UploadedFile) => void;
  onSendMessage: (message: string, chatMode: ChatMode, fileIds?: string[]) => void;
  isLoading: boolean;
  customPrompts: Prompt[];
  onSavePrompt: (title: string, description: string, isPublic: boolean) => void;
  onToggleFavorite?: (prompt: Prompt) => void;
  currentUserId?: string;
}

export const MainPane: React.FC<MainPaneProps> = ({ 
    onPromptSelect, 
    onSendMessage, 
    isLoading, 
    customPrompts, 
    onSavePrompt,
    onToggleFavorite,
    currentUserId
}) => {
  const [activeTab, setActiveTab] = useState('Recommended');
  const [isCreatePromptModalOpen, setCreatePromptModalOpen] = useState(false);
  
  const TABS = ['Recommended', 'Favorites', 'Created by me'];

  const getDisplayedPrompts = () => {
    switch (activeTab) {
      case 'Created by me':
        return customPrompts.filter(p => p.userId === currentUserId);
        
      case 'Favorites':
        return customPrompts.filter(p => currentUserId && (p.favoritedBy || []).includes(currentUserId));
        
      case 'Recommended':
      default:
        // Get all public prompts and custom user prompts
        const publicPrompts = customPrompts.filter(p => p.isPublic || p.userId === currentUserId);
        
        // Merge with static defaults if needed, but primarily sort by favoritesCount descending
        const merged = [...publicPrompts, ...RECOMMENDED_PROMPTS.filter(rp => !publicPrompts.find(p => p.id === rp.id))];
        
        return merged.sort((a, b) => {
          const aCount = a.favoritesCount || 0;
          const bCount = b.favoritesCount || 0;
          return bCount - aCount;
        });
    }
  };

  const displayedPrompts = getDisplayedPrompts();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-400 mb-2">
            Ask {CLIENT_NAME}-GPT
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Your intelligent assistant for M&E projects.</p>
        </header>

        <div className="mt-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700 w-full flex justify-between">
                  <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                      {TABS.map(tab => (
                          <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`${
                                  activeTab === tab
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                          >
                              {tab}
                          </button>
                      ))}
                  </nav>
                  
                  <button onClick={() => setCreatePromptModalOpen(true)} className="mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm flex-shrink-0 ml-4">
                      Create prompt
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {displayedPrompts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">No prompts found in this tab.</p>
            ) : (
              displayedPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={() => onPromptSelect(prompt.description)} 
                  onToggleFavorite={onToggleFavorite ? (e) => {
                      e.preventDefault();
                      onToggleFavorite(prompt);
                  } : undefined}
                  isFavorite={currentUserId ? (prompt.favoritedBy || []).includes(currentUserId) : false}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full">
          <ChatInputBar onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
      
      <CreatePromptModal 
        isOpen={isCreatePromptModalOpen} 
        onClose={() => setCreatePromptModalOpen(false)} 
        onSave={onSavePrompt}
      />
    </div>
  );
};
