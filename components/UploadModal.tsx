
import React, { useState, useCallback } from 'react';
import { uploadFile as apiUploadFile } from '../services/api';
import { USER_ID, PROJECT_ID } from '../constants';
import { XIcon } from './icons/XIcon';
import { FileIcon } from './icons/FileIcon';
import type { UploadedFile } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: (file: UploadedFile) => void;
  onPromptSelect: (prompt: string, file: UploadedFile) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onFileUploaded, onPromptSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<UploadedFile | null>(null);
  const [isKBIndexChecked, setKBIndexChecked] = useState(true);

  const resetState = useCallback(() => {
      setFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      setError(null);
      setUploadedFileData(null);
      setKBIndexChecked(true);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const result = await apiUploadFile(file, USER_ID, PROJECT_ID, (progress) => {
        setUploadProgress(progress);
      });
      setUploadedFileData(result);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Upload File</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            {!uploadedFileData ? (
                <>
                    <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
                    >
                        <input type="file" id="file-upload" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="text-gray-500 dark:text-gray-400">Drag & drop a file here or <span className="text-blue-500 font-semibold">browse</span></p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, DOCX, PNG, JPG supported</p>
                        </label>
                    </div>

                    {file && !isUploading && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileIcon className="h-5 w-5 text-gray-500" />
                                <span className="text-sm">{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)}><XIcon className="h-4 w-4" /></button>
                        </div>
                    )}
                    
                    {isUploading && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="text-center text-sm mt-1">{uploadProgress}%</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </>
            ) : (
                <div>
                    <h3 className="font-semibold mb-1">Summary</h3>
                    <p className="text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-md">{uploadedFileData.summary}</p>
                    <h3 className="font-semibold mt-4 mb-2">Suggested Prompts</h3>
                    <div className="space-y-2">
                        {uploadedFileData.suggestedPrompts.map((prompt, i) => (
                            <button key={i} onClick={() => onPromptSelect(prompt, uploadedFileData)} className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-sm transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          {!uploadedFileData ? (
            <>
              <div className="flex items-center mb-4">
                  <input id="kb-checkbox" type="checkbox" checked={isKBIndexChecked} onChange={(e) => setKBIndexChecked(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="kb-checkbox" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Index this file into company KB</label>
              </div>
              <button onClick={handleUpload} disabled={!file || isUploading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                  {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            </>
          ) : (
            <button onClick={() => { onFileUploaded(uploadedFileData); handleClose(); }} className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
              Attach to Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
