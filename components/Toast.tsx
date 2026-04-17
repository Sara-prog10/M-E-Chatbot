
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 2700);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`transform transition-all duration-300 ease-in-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} ${bgColor} text-white py-2 px-4 rounded-md shadow-lg flex items-center`}>
      <p>{message}</p>
    </div>
  );
};
