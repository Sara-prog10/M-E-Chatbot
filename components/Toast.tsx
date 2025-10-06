
import React, { useEffect } from 'react';
import type { Toast as ToastType } from '../types';
import { InfoIcon, CheckCircleIcon, ErrorIcon, XIcon } from './icons';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
};

const colors = {
  success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg border text-sm w-80 animate-fade-in-right ${colors[toast.type]}`}>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="ml-3 flex-1">{toast.message}</div>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10">
        <XIcon />
      </button>
    </div>
  );
};
