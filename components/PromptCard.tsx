
import React from 'react';
import type { Prompt } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick, onToggleFavorite, isFavorite }) => {
  return (
    <button
      onClick={onClick}
      aria-label={`Select prompt: ${prompt.title}`}
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 text-left w-full h-full flex flex-col border border-gray-200 dark:border-gray-700 relative"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 dark:text-white pr-8">{prompt.title}</h3>
          {(prompt.isPublic !== undefined) && (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded p-1 mb-2 ${prompt.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
              {prompt.isPublic ? 'Public' : 'Private'}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{prompt.description}</p>
      </div>
      <div className="mt-4 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">By {prompt.author}</p>
          {prompt.tag && (
            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full inline-block">
              {prompt.tag}
            </span>
          )}
        </div>
        
        {onToggleFavorite && (
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-500 font-medium">{prompt.favoritesCount || 0}</span>
            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite 
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <HeartIcon className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        )}
      </div>
    </button>
  );
};
