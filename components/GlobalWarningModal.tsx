import React from 'react';
import { XIcon } from './icons/XIcon';

interface GlobalWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const GlobalWarningModal: React.FC<GlobalWarningModalProps> = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="text-yellow-500">⚠️</span> Global Chat Warning
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          <p className="mb-4">
            You are currently attaching a file in <strong>Global</strong> chat mode.
          </p>
          <p className="text-red-600 dark:text-red-400 font-medium">
            Please ensure you do not attach any confidential, sensitive, or proprietary company files in this mode.
          </p>
        </div>
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
          >
            Close
          </button>
          <button 
            onClick={onContinue} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
