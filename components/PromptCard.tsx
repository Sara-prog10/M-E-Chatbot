import React from 'react';
import type { Prompt } from '../types';
import { UserIcon, PencilIcon, BookmarkIcon, BookmarkSolidIcon } from './icons';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onEdit?: () => void;
  isFavorite: boolean;
  onToggleFavorite: (promptId: string) => void;
  favoriteCount: number;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick, onEdit, isFavorite, onToggleFavorite, favoriteCount }) => {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-full group relative"
    >
      <button
        onClick={onClick}
        className="p-4 text-left flex-1 w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 rounded-t-xl"
        aria-label={`Use prompt: ${prompt.title} - ${prompt.description}`}
      >
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{prompt.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{prompt.description}</p>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (prompt.id) onToggleFavorite(prompt.id);
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity ${
            isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isFavorite ? `Remove ${prompt.title} from favorites` : `Add ${prompt.title} to favorites`}
      >
        {isFavorite ? <BookmarkSolidIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" /> : <BookmarkIcon className="w-5 h-5" />}
      </button>

      <div className="p-4 pt-0 mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <UserIcon className="w-4 h-4" />
          <span>{prompt.author}</span>
        </div>
        <div className="flex items-center gap-3">
            {favoriteCount > 0 && (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <BookmarkSolidIcon className="w-4 h-4" />
                    <span className="font-medium">{favoriteCount}</span>
                </div>
            )}
            <span className="font-medium uppercase tracking-wider">{prompt.tag}</span>
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent the main card click event
                        onEdit();
                    }}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={`Edit prompt: ${prompt.title}`}
                >
                    <PencilIcon className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PromptCard;