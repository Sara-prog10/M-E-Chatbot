
import React from 'react';
import type { Prompt } from '../types';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={`Select prompt: ${prompt.title}`}
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 text-left w-full h-full flex flex-col border border-gray-200 dark:border-gray-700"
    >
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white">{prompt.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{prompt.description}</p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">By {prompt.author}</p>
        {prompt.tag && (
          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {prompt.tag}
          </span>
        )}
      </div>
    </button>
  );
};
