import React from 'react';
import type { Prompt } from '../types';
import { XIcon } from './icons';

interface PromptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onUsePrompt: (promptText: string) => void;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ isOpen, onClose, prompt, onUsePrompt }) => {
  if (!isOpen || !prompt) return null;

  const handleUseClick = () => {
    onUsePrompt(prompt.promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{prompt.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {prompt.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{prompt.description}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prompt Text</h3>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono text-sm">
              {prompt.promptText}
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t border-slate-200 dark:border-slate-700 gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
            Close
          </button>
          <button onClick={handleUseClick} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-700 rounded-md">
            Use this Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;