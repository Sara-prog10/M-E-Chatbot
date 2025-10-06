
import React, { useState, useCallback } from 'react';
import { uploadFile } from '../services/apiService';
import type { Toast, UploadResult } from '../types';
import { UploadIcon, XIcon, CheckCircleIcon } from './icons';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (result: UploadResult, prompt: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  apiBase: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete, addToast, apiBase }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldIndex, setShouldIndex] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);
    setShouldIndex(true);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      // Add file type validation if needed
      setFile(files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setError(null);

    // Mock progress for demonstration
    const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await uploadFile({
        file,
        userId: 'user-123', // Replace with actual user ID
        projectId: 'proj-456', // Replace with actual project ID
      }, apiBase);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      addToast({ type: 'success', message: 'File uploaded successfully!' });
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Upload failed: ${errorMessage}`);
      addToast({ type: 'error', message: `Upload failed: ${errorMessage}` });
      setIsUploading(false);
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isEntering);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e, false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          handleFileChange(files);
      }
  };

  const renderInitialState = () => (
    <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-brand-blue-light bg-brand-blue-light/10' : 'border-brand-gray-300 dark:border-brand-gray-600'}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
    >
      <UploadIcon />
      <p className="mt-4 text-brand-gray-600 dark:text-brand-gray-300">
        Drag & drop files here or <label htmlFor="file-upload" className="text-brand-blue-default font-semibold cursor-pointer hover:underline">browse</label>.
      </p>
      <input id="file-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" />
      <p className="text-xs text-brand-gray-400 mt-1">Supports: PDF, DOCX, Images</p>
      {file && <p className="mt-4 font-medium text-brand-gray-700 dark:text-brand-gray-200">Selected: {file.name}</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <button onClick={handleUpload} disabled={!file} className="mt-6 px-6 py-2 bg-brand-blue-default text-white rounded-md hover:bg-brand-blue-dark disabled:bg-brand-gray-400 disabled:cursor-not-allowed">
        Upload File
      </button>
    </div>
  );

  const renderUploadingState = () => (
    <div className="text-center p-8">
      <h3 className="text-lg font-medium">Uploading "{file?.name}"...</h3>
      <div className="w-full bg-brand-gray-200 dark:bg-brand-gray-700 rounded-full h-2.5 mt-4">
        <div className="bg-brand-blue-default h-2.5 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}></div>
      </div>
      <p className="mt-2 text-sm text-brand-gray-500">{uploadProgress}%</p>
    </div>
  );

  const renderSuccessState = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <CheckCircleIcon />
        <h3 className="text-lg font-medium mt-2">Upload Complete!</h3>
      </div>
      <div className="bg-brand-gray-100 dark:bg-brand-gray-800 p-4 rounded-lg">
        <h4 className="font-semibold">Summary:</h4>
        <p className="text-sm text-brand-gray-600 dark:text-brand-gray-300 mt-1">{uploadResult?.summary}</p>
      </div>
      <div className="mt-6">
        <h4 className="font-semibold">Suggested Prompts:</h4>
        <div className="mt-2 space-y-2">
          {uploadResult?.suggestedPrompts.map((prompt, index) => (
            <button key={index} onClick={() => onUploadComplete(uploadResult, prompt)} className="w-full text-left p-3 bg-white dark:bg-brand-gray-700 rounded-md hover:bg-brand-gray-50 dark:hover:bg-brand-gray-600 border border-brand-gray-200 dark:border-brand-gray-600 text-sm">
              {prompt}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center">
        <input id="index-file" type="checkbox" checked={shouldIndex} onChange={(e) => setShouldIndex(e.target.checked)} className="h-4 w-4 rounded border-brand-gray-300 text-brand-blue-default focus:ring-brand-blue-dark" />
        <label htmlFor="index-file" className="ml-2 block text-sm text-brand-gray-900 dark:text-brand-gray-100">
          Index this file into company KB
        </label>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-brand-gray-900 rounded-lg shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-gray-200 dark:border-brand-gray-700">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-brand-gray-100 dark:hover:bg-brand-gray-700">
            <XIcon />
          </button>
        </div>
        <div className="p-6">
          {isUploading ? renderUploadingState() : uploadResult ? renderSuccessState() : renderInitialState()}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
