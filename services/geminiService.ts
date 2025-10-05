import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, the API key is assumed to be available via `process.env.API_KEY`.
// Removed the conditional check and mock logic to align with this requirement.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const N8N_GLOBAL_CHAT_URL = 'https://theintellect.app.n8n.cloud/webhook/ae7687bc-ad83-41c5-b8b7-6ce80cf45fee/chat';

export const generateGlobalResponse = async (prompt: string, sessionId: string, userName: string): Promise<string> => {
    try {
        const payload = {
            sessionId: sessionId,
            action: "sendMessage",
            chatInput: prompt,
            userName: userName,
        };

        const response = await fetch(N8N_GLOBAL_CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Helper to extract the text response from a given object.
        const extractText = (data: any) => {
            if (typeof data !== 'object' || data === null) return null;
            // Check for the 'output' key as specified by the user, then fall back to others.
            return data.output || data.reply || data.chatOutput || data.text || data.message;
        }

        // Handle the case where n8n might wrap the response in an array.
        const dataToProcess = Array.isArray(responseData) ? responseData[0] : responseData;
        
        const botText = extractText(dataToProcess);

        if (botText && typeof botText === 'string') {
            return botText;
        }
        
        // If no valid text key is found, stringify the relevant part of the response for debugging.
        return JSON.stringify(dataToProcess) || "Received an unexpected response format from the server.";

    } catch (error) {
        console.error("Error calling n8n global chat webhook:", error);
        return "Sorry, I encountered an error while processing your request with the global chat service.";
    }
};

export const summarizeDocument = async (fileContent: string): Promise<string> => {
    const prompt = `Please provide a concise summary of the following document content:\n\n---\n\n${fileContent}\n\n---\n\nSummary:`;

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing document:", error);
        return "Sorry, I couldn't summarize the document. An error occurred.";
    }
};

// Mock function for n8n/company backend
export const generateCompanyResponse = async (prompt: string): Promise<string> => {
    console.log(`Sending to n8n backend: ${prompt}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`This is a simulated response from the M&E Company backend for your query: "${prompt}". In a real scenario, this would be handled by an n8n webhook to retrieve company-specific data.`);
        }, 1000);
    });
};