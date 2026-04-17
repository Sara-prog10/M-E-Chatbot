
import { API_BASE_URL } from '../constants';
import type { ChatMode, UploadedFile } from '../types';

// STUB: In a real application, this would securely retrieve the user's authentication token.
const getAuthToken = (): string => {
  return 'your-placeholder-bearer-token';
};

interface ChatResponse {
  answer: string;
  sources: { fileId: string; page: number; chunkId: string }[];
  rawModelId: string;
  responseId: string;
}

export const sendMessage = async (
  userId: string,
  sessionId: string,
  chatMode: ChatMode,
  message: string,
  fileIds?: string[]
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/webhook/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      userId,
      sessionId,
      chatMode,
      message,
      fileIds,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error: ${response.status} ${errorBody}`);
  }

  const responseText = await response.text();
  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    // If it's not JSON, treat the text itself as the answer
    return {
      answer: responseText || 'Success',
      sources: [],
      rawModelId: 'unknown',
      responseId: `resp-${Date.now()}`
    };
  }
  
  // N8n might return the object inside an array, or use different keys
  let answer = data.answer || data.output || data.text || data.message;
  let sources = data.sources || [];
  let responseId = data.responseId || `resp-${Date.now()}`;
  let rawModelId = data.rawModelId || 'unknown';

  if (!answer && Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    answer = firstItem.answer || firstItem.output || firstItem.text || firstItem.message || JSON.stringify(firstItem);
  } else if (!answer) {
     answer = typeof data === 'string' ? data : JSON.stringify(data);
  }

  return {
    answer,
    sources,
    rawModelId,
    responseId,
  };
};

export const uploadFile = async (
  file: File,
  userId: string,
  projectId: string,
  onProgress: (percentage: number) => void
): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('projectId', projectId);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/webhook/upload`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed due to a network error.'));
    };
    
    xhr.send(formData);
  });
};
