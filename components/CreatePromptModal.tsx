import React, { useState, useEffect } from 'react';
import type { Prompt } from '../types';
import { XIcon } from './icons';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: Prompt) => void;
  promptToEdit: Prompt | null;
}

const CreatePromptModal: React.FC<CreatePromptModalProps> = ({ isOpen, onClose, onSave, promptToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [promptText, setPromptText] = useState('');
    const [tag, setTag] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const isEditMode = !!promptToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setTitle(promptToEdit.title);
                setDescription(promptToEdit.description);
                setPromptText(promptToEdit.promptText);
                setTag(promptToEdit.tag);
                setIsPublic(promptToEdit.isPublic);
            } else {
                // Reset form for new prompt
                setTitle('');
                setDescription('');
                setPromptText('');
                setTag('');
                setIsPublic(false);
            }
        }
    }, [isOpen, promptToEdit, isEditMode]);

    const handleSave = () => {
        if (!title.trim() || !promptText.trim()) {
            // Basic validation
            alert('Title and Prompt Text are required.');
            return;
        }

        const promptData = {
            ...promptToEdit, // Includes id, author, authorId if editing
            title,
            description,
            promptText,
            tag,
            isPublic,
        };

        onSave(promptData as Prompt);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        {isEditMode ? 'Edit Prompt' : 'Create New Prompt'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="prompt-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                        <input type="text" id="prompt-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                    </div>
                     <div>
                        <label htmlFor="prompt-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <input type="text" id="prompt-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                        <label htmlFor="prompt-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prompt Text</label>
                        <textarea id="prompt-text" value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={5} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-y"></textarea>
                    </div>
                    <div>
                        <label htmlFor="prompt-tag" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tag</label>
                        <input type="text" id="prompt-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="e.g., PROJECTS" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label htmlFor="prompt-public" className="text-sm font-medium text-slate-700 dark:text-slate-300">Make Public</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" id="prompt-public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-600"></div>
                        </label>
                         <span className="text-xs text-slate-500">(If public, other users will be able to see and use this prompt)</span>
                    </div>
                </div>
                 <div className="flex justify-end items-center p-4 border-t border-slate-200 dark:border-slate-700 gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-700 rounded-md">
                        Save Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePromptModal;