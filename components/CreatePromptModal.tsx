
import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, isPublic: boolean) => void;
}

export const CreatePromptModal: React.FC<CreatePromptModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim() && description.trim()) {
      onSave(title, description, isPublic);
      setTitle('');
      setDescription('');
      setIsPublic(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create Prompt</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input 
                  type="text" 
                  id="prompt-title" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g., Summarize weekly report" 
                />
            </div>
             <div>
                <label htmlFor="prompt-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Text</label>
                <textarea 
                  id="prompt-description" 
                  rows={4} 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Enter the full prompt you want to save..."
                />
            </div>
            
            <div className="flex items-center mt-4">
              <input 
                id="prompt-visibility" 
                type="checkbox" 
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="prompt-visibility" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Make this prompt public (anyone can use it)
              </label>
            </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={!title.trim() || !description.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              Save Prompt
            </button>
        </div>
      </div>
    </div>
  );
};
