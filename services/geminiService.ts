const N8N_GLOBAL_CHAT_URL = 'https://theintellect.app.n8n.cloud/webhook/ae7687bc-ad83-41c5-b8b7-6ce80cf45fee/chat';
const N8N_SUMMARIZER_URL = 'https://theintellect.app.n8n.cloud/webhook/pdf-summariser';

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

const formatSummary = (responseData: any): string => {
    if (!Array.isArray(responseData) || responseData.length === 0 || !responseData[0]?.data) {
        return `Received an unexpected response format. Raw output: ${JSON.stringify(responseData, null, 2)}`;
    }

    const summaryData = responseData[0].data;
    const parts: string[] = [];

    const findPart = (key: string) => summaryData.find((item: any) => item.output && item.output[key]);

    const mainThemePart = findPart('main_theme');
    if (mainThemePart) {
        parts.push('## Main Theme');
        parts.push(mainThemePart.output.main_theme);
    }

    const docSummaryPart = findPart('document_summary');
    if (docSummaryPart && Array.isArray(docSummaryPart.output.document_summary)) {
        parts.push('\n## Document Summary');
        docSummaryPart.output.document_summary.forEach((section: any) => {
            parts.push(`\n### ${section.section_title}`);
            parts.push(section.content);
        });
    }
    
    const takeawaysPart = findPart('key_takeaways');
    if (takeawaysPart && Array.isArray(takeawaysPart.output.key_takeaways)) {
        parts.push('\n## Key Takeaways');
        takeawaysPart.output.key_takeaways.forEach((item: any) => {
            parts.push(`- **${item.point}:** ${item.context}`);
        });
    }

    const gapsPart = findPart('gaps_and_limitations');
    if (gapsPart && Array.isArray(gapsPart.output.gaps_and_limitations)) {
        parts.push('\n## Gaps & Limitations');
        gapsPart.output.gaps_and_limitations.forEach((item: any) => {
            parts.push(`- **${item.issue}:** ${item.reason}`);
        });
    }

    const questionsPart = findPart('follow_up_questions');
    if (questionsPart && Array.isArray(questionsPart.output.follow_up_questions)) {
        parts.push('\n## Follow-up Questions');
        questionsPart.output.follow_up_questions.forEach((q: string) => {
            parts.push(`- ${q}`);
        });
    }

    if (parts.length === 0) {
        return "Could not extract a valid summary from the response. The format might have changed.";
    }

    return parts.join('\n\n');
};

export const summarizeDocument = async (file: File): Promise<string> => {
    if (N8N_SUMMARIZER_URL.includes('[YOUR_N8N_WEBHOOK_URL]')) {
         return "Developer Note: The document summarizer is not configured. Please replace the placeholder URL in `services/geminiService.ts` with your actual backend endpoint. This backend service should securely call the Gemini API to perform the summarization.";
    }

    try {
        const formData = new FormData();
        // The key 'file' is a common convention. The n8n workflow will need to look for this key.
        formData.append('file', file, file.name);
        
        const response = await fetch(N8N_SUMMARIZER_URL, {
            method: 'POST',
            // When using FormData, the browser automatically sets the Content-Type to multipart/form-data
            // with the correct boundary, so it should not be set manually.
            body: formData,
            cache: 'no-cache',
        });

        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const responseData = await response.json();
        return formatSummary(responseData);

    } catch (error) {
        console.error("Error calling summarizer service:", error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return "Sorry, I couldn't summarize the document. A network error occurred. This is often due to a CORS policy on the server. Please ensure the n8n webhook is configured to accept file uploads from this web app's domain.";
        }
        return `Sorry, I couldn't summarize the document. An error occurred: ${error instanceof Error ? error.message : String(error)}`;
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
