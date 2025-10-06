// Fix: Add UploadResult to the import statement to support the new uploadFile function.
import type { ChatRequest, ChatResponse, UploadResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Placeholder for getting the user's authentication token.
 * In a real application, this would involve a call to an auth service.
 * @returns {string} The bearer token.
 */
function getAuthToken(): string {
  // IMPORTANT: Replace this with your actual token retrieval logic.
  return "your_super_secret_bearer_token"; 
}

/**
 * Sends a chat message to the backend webhook.
 * If a file is provided, it sends the request as multipart/form-data.
 * Otherwise, it sends a standard JSON payload.
 * It also handles adapting the n8n response format to the application's expected format.
 * @param {Omit<ChatRequest, 'fileIds'>} payload - The chat message payload.
 * @param {string} apiBase - The base URL of the API.
 * @param {File} [file] - Optional file to be sent as binary data.
 * @returns {Promise<ChatResponse>} The response from the backend.
 */
export async function sendChatMessage(
  payload: Omit<ChatRequest, 'fileIds'>, 
  apiBase: string,
  file?: File
): Promise<ChatResponse> {
  const url = `${apiBase}/webhook/chat`;
  const headers: HeadersInit = {
    'Authorization': `Bearer ${getAuthToken()}`
  };
  let body: BodyInit;

  if (file) {
    const formData = new FormData();
    formData.append('binaryData', file);
    
    // Append other payload fields
    formData.append('userId', payload.userId);
    formData.append('sessionId', payload.sessionId);
    formData.append('chatMode', payload.chatMode);
    formData.append('message', payload.message);
    formData.append('fileAttached', 'true');
    formData.append('fileType', file.type);

    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const responseText = await response.text();
  console.log("Received raw text from n8n:", responseText);

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse n8n response as JSON. Treating as plain text. Response was:", responseText);
    return {
      answer: responseText,
      sources: [],
      rawModelId: 'n8n-workflow-text-response',
      responseId: uuidv4(),
    };
  }
  
  console.log("Parsed JSON data from n8n:", responseData);

  // Adapter for the specific n8n format: `[{ "output": "..." }]`
  if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.hasOwnProperty('output')) {
    const n8nOutput = responseData[0].output;
    return {
      answer: typeof n8nOutput === 'string' ? n8nOutput : JSON.stringify(n8nOutput),
      sources: [],
      rawModelId: 'n8n-workflow-array',
      responseId: uuidv4(),
    };
  }

  // Adapter for the n8n format: `{ "output": "..." }`
  if (typeof responseData === 'object' && responseData !== null && !Array.isArray(responseData) && responseData.hasOwnProperty('output')) {
    const n8nOutput = (responseData as { output: any }).output;
    return {
      answer: typeof n8nOutput === 'string' ? n8nOutput : JSON.stringify(n8nOutput),
      sources: [],
      rawModelId: 'n8n-workflow-object',
      responseId: uuidv4(),
    };
  }

  if (responseData.hasOwnProperty('answer')) {
    return responseData;
  }
  
  console.warn("Received unexpected JSON structure from n8n:", responseData);
  return {
    answer: `Received unexpected data format. Raw response: ${JSON.stringify(responseData)}`,
    sources: [],
    rawModelId: 'n8n-workflow-unexpected-format',
    responseId: uuidv4(),
  };
}

/**
 * Uploads a file for processing.
 * NOTE: This is a mock implementation to fix the build error.
 * In a real application, this would make a network request to a file upload endpoint.
 * @param payload - The file and metadata.
 * @param apiBase - The base URL of the API.
 * @returns {Promise<UploadResult>} The result of the file processing.
 */
export async function uploadFile(
  payload: { file: File; userId: string; projectId: string },
  apiBase: string,
): Promise<UploadResult> {
  console.log(`Mock uploading file ${payload.file.name} to ${apiBase}/webhook/upload`);

  // Simulate network delay for demonstration
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation, you would use fetch with FormData:
  /*
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('userId', payload.userId);
  formData.append('projectId', payload.projectId);
  const response = await fetch(`${apiBase}/webhook/upload`, {
    method: 'POST',
    body: formData,
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  });
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  return response.json();
  */

  // Return mock data
  return {
    summary: `This is a summary for the uploaded file: "${payload.file.name}". The content seems to be about project planning and execution strategies.`,
    suggestedPrompts: [
      `What are the key milestones outlined in ${payload.file.name}?`,
      `Summarize the executive summary of ${payload.file.name}.`,
      `List all stakeholders mentioned in ${payload.file.name}.`
    ]
  };
}
