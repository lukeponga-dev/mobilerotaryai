import { GoogleGenAI, GenerateContentParameters, Type, Modality, LiveServerMessage, Blob, GenerateContentResponse } from "@google/genai";
import { Message, ContextData, GroundingSource, ArticleData, LiveTranscript } from "../types";

// --- Custom Error Handling ---
/**
 * Custom error class for specific feedback on API failures.
 */
export class GeminiServiceError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

/**
 * A utility function to retry an async operation with exponential backoff.
 * @param fn The async function to execute.
 * @param retries The maximum number of retries.
 * @param delay The initial delay in milliseconds.
 * @param backoffFactor The factor by which the delay increases.
 * @returns The result of the async function.
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check for retryable errors.
      const errorMessage = (error.message || '').toLowerCase();
      // Look for status codes or specific text from the Gemini API and fetch errors
      const isRetryable =
        errorMessage.includes('503') || // Service Unavailable
        errorMessage.includes('unavailable') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('429') || // Too Many Requests
        errorMessage.includes('busy') ||
        errorMessage.includes('fetch failed') || // Network errors
        errorMessage.includes('network');

      if (isRetryable && i < retries - 1) {
        console.warn(`Attempt ${i + 1} failed with retryable error. Retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= backoffFactor;
      } else {
        // Not a retryable error, or max retries reached.
        throw lastError;
      }
    }
  }
  // This line should not be reachable if retries >= 1, but it satisfies TypeScript.
  throw lastError;
};


/**
 * Parses known API errors into user-friendly messages.
 * @param error The catched error object.
 * @param context A string identifying the calling function for better logging.
 * @returns A GeminiServiceError with a user-friendly message.
 */
const handleApiError = (error: unknown, context: string): GeminiServiceError => {
  console.error(`Gemini API Error in ${context}:`, error);
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('fetch failed') || message.includes('network')) {
      return new GeminiServiceError("Network connection error. Please check your internet and try again.", error);
    }
    if (message.includes('429')) {
      return new GeminiServiceError("The AI service is currently busy. Please wait a moment and try again.", error);
    }
    if (message.includes('api key not valid')) {
      return new GeminiServiceError("The API key is invalid. Please check your application configuration.", error);
    }
    if (message.includes('safety policies')) {
      return new GeminiServiceError("The request was blocked for safety reasons. Please adjust your input.", error);
    }
    if (message.includes('500') || message.includes('503') || message.includes('server error') || message.includes('unavailable')) {
      return new GeminiServiceError("The AI service is temporarily unavailable. Please try again later.", error);
    }
    // Return the original message if it's informative enough
    if ((error as any).message) {
        return new GeminiServiceError((error as any).message, error);
    }
  }
  return new GeminiServiceError(`An unexpected error occurred in ${context}.`, error);
};


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

// --- Live Audio Utilities ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}
// --- End Live Audio Utilities ---


const SYSTEM_INSTRUCTION = `You are Rotary Mechanic, a specialized diagnostic assistant built exclusively for Mazda RX-8 owners and enthusiasts. 
Your role is to act as a professional RX-8 mechanic with deep expertise in the 13B-MSP Renesis rotary engine.

### Core Directives
- Focus only on Mazda RX-8 diagnostics, maintenance, and rotary-specific advice.
- Base your reasoning on the official Mazda RX-8 workshop manual and trusted rotary community practices.
- Always follow a systematic diagnostic process:
  1. Ask clarifying questions about symptoms (e.g., noises, warning lights, performance changes).
  2. Narrow down possible causes step by step.
  3. Provide a structured report with:
     - Root cause analysis
     - Step-by-step action plan
     - Required tools/parts
     - Safety precautions
- If the issue is outside RX-8 scope, politely redirect and explain your specialization.

### Multimodal Input
- Users may upload **images** (engine bay, dashboard lights, fluid leaks, spark plugs, compression test results, etc.).
- Users may upload **videos** (engine start-up, idle behavior, exhaust smoke, unusual noises).
- When analyzing images or video:
  - Describe what you see in plain language.
  - Highlight any visible issues (e.g., oil leaks, corrosion, cracked hoses).
  - If video/audio is provided, comment on sounds, smoke color, or movement patterns.
  - Always connect observations back to RX-8 specific failure modes.

### Data Visualization
- When you are presenting structured numerical data (like compression test results, sensor readings over time, or fuel trim values), you MUST format it as a special JSON object within a "chart" code block.
- This will allow the application to render a visual chart for the user.
- Use the following JSON structure:

**For Bar Charts (e.g., Compression Test):**
` + "```chart" + `
{
  "type": "bar",
  "title": "Rotor 1 Compression Results",
  "unit": "PSI",
  "labels": ["Face A", "Face B", "Face C"],
  "datasets": [
    {
      "label": "PSI @ 250 RPM",
      "data": [110, 112, 108]
    }
  ]
}
` + "```" + `

**For Line Charts (e.g., Sensor Data):**
` + "```chart" + `
{
  "type": "line",
  "title": "O2 Sensor Voltage",
  "unit": "V",
  "labels": ["0s", "1s", "2s", "3s", "4s", "5s"],
  "datasets": [
    {
      "label": "Sensor 1",
      "data": [0.1, 0.85, 0.2, 0.9, 0.15, 0.8]
    }
  ]
}
` + "```" + `
- Ensure the JSON is valid. Do not include any text outside the JSON object within the chart block.

### Communication Style
- Be clear, approachable, and professional—like a trusted mechanic explaining to a car owner.
- Avoid unnecessary jargon; when using technical terms, provide short explanations.
- Offer preventative maintenance tips when relevant.
- Never guess—if uncertain, explain what further inspection or testing is needed.

### Output Format
When giving a diagnosis, structure your response as:

**📸 Observations from Image/Video:**  
[What you see/hear in the upload]

**🔎 Possible Cause(s):**  
[List of likely causes]

**🛠 Recommended Actions:**  
[Step-by-step troubleshooting or repair steps]

**⚠️ Safety Notes:**  
[Warnings, precautions, or when to seek a professional mechanic]

**📦 Parts/Tools Needed:**  
[List of parts, fluids, or tools]

---

Stay focused, consistent, and reliable. You are not a general-purpose assistant—you are Rotary Mechanic, the RX-8 mechanic in digital form.`;


const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

/**
 * Selects the appropriate Gemini model and configuration based on the user's input and settings.
 * This function ensures the best model is used for each specific task, from quick chats to deep video analysis.
 */
const getModelAndConfig = (latestMessage: Message, isDeepAnalysis?: boolean, isWebSearch?: boolean) => {
    const baseConfig: any = { systemInstruction: SYSTEM_INSTRUCTION };

    // FEATURE: Web Search Grounding for up-to-date information.
    // Uses gemini-2.5-flash with the googleSearch tool.
    if (isWebSearch) {
        console.log('Using Web Search model: gemini-2.5-flash');
        return {
            modelName: 'gemini-2.5-flash',
            config: {
                ...baseConfig,
                tools: [{ googleSearch: {} }]
            }
        };
    }

    // FEATURE: Thinking Mode for complex queries.
    // Uses the powerful gemini-2.5-pro model with a maximum thinking budget for in-depth analysis.
    if (isDeepAnalysis) {
        console.log('Using Deep Analysis model: gemini-2.5-pro');
        return {
            modelName: 'gemini-2.5-pro',
            config: {
                ...baseConfig,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        };
    }

    // FEATURE: Video Understanding.
    // Automatically uses gemini-2.5-pro for analyzing video files, as it provides more accurate and detailed insights.
    if (latestMessage.video) {
        console.log('Using Video Analysis model: gemini-2.5-pro');
        return {
            modelName: 'gemini-2.5-pro',
            config: baseConfig
        };
    }
    
    // FEATURE: Chat Bot & Image Analysis.
    // For standard text chats and image analysis, the fast and efficient gemini-2.5-flash is used.
    console.log('Using Standard Chat/Image model: gemini-2.5-flash');
    return {
        modelName: 'gemini-2.5-flash',
        config: baseConfig
    };
};

/**
 * Generates a streaming diagnostic response from the Gemini API.
 */
// FIX: Refactored from an immediately-invoked function expression (IIFE) to a standard async generator function.
// This allows for an explicit return type annotation (`AsyncGenerator<GenerateContentResponse>`),
// which resolves a TypeScript type inference issue where the `stream` variable was incorrectly typed as `unknown`,
// causing an error on the `for await...of` loop.
export async function* getDiagnosticResponseStream(history: Message[], latestMessage: Message, isDeepAnalysis?: boolean, isWebSearch?: boolean): AsyncGenerator<GenerateContentResponse> {
    const { modelName, config } = getModelAndConfig(latestMessage, isDeepAnalysis, isWebSearch);

    const modelHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const parts = [];
    if (latestMessage.text) {
        parts.push({ text: latestMessage.text });
    }
    if (latestMessage.image) {
        const [mimeType, ] = latestMessage.image.match(/data:(.*?);base64,/) || [];
        if (mimeType) {
            parts.push(fileToGenerativePart(latestMessage.image, mimeType.replace('data:', '')));
        }
    }
    if (latestMessage.video) {
        const [mimeType, ] = latestMessage.video.match(/data:(.*?);base64,/) || [];
        if (mimeType) {
            parts.push(fileToGenerativePart(latestMessage.video, mimeType.replace('data:', '')));
        }
    }
    
    const params: GenerateContentParameters = {
        model: modelName,
        contents: [...modelHistory, { role: 'user', parts }],
        config,
    };
    
    try {
        // FIX: Explicitly provide the generic type argument to `withRetry` to fix a type inference issue
        // where `stream` was being inferred as `unknown`.
        const stream = await withRetry<AsyncGenerator<GenerateContentResponse>>(() => model.generateContentStream(params));
        for await (const chunk of stream) {
            yield chunk;
        }
    } catch (error) {
        throw handleApiError(error, 'getDiagnosticResponseStream');
    }
};

/**
 * Generates a session title using a low-latency model.
 * REFACTORED: Validates title length and re-prompts for a better title if the first attempt is too long or short.
 */
export const generateSessionTitle = async (firstUserMessage: string): Promise<string> => {
    try {
        // First attempt to generate a title
        const result: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [{
                role: 'user',
                parts: [{ text: `Generate a concise, 4-5 word session title for this Mazda RX-8 query: "${firstUserMessage}"` }]
            }]
        }));

        let title = result.text.replace(/["']/g, "").trim();
        const wordCount = title.split(/\s+/).filter(Boolean).length;

        // If the title is already the correct length, return it
        if (wordCount >= 4 && wordCount <= 5) {
            return title;
        }

        // If the title is not the correct length, make a second attempt to refine it
        console.warn(`Initial title "${title}" has incorrect word count (${wordCount}). Retrying.`);
        
        const refineResult: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [{
                role: 'user',
                parts: [{ text: `The title "${title}" is not the right length. Create a new title that is exactly 4 or 5 words long, summarizing this user's Mazda RX-8 issue: "${firstUserMessage}"` }]
            }]
        }));
        
        const refinedTitle = refineResult.text.replace(/["']/g, "").trim();
        
        // Use the refined title if it's not empty, as it's our best attempt.
        if (refinedTitle) {
            return refinedTitle;
        }

        // Fallback to the original title if refinement produces nothing.
        return title;

    } catch (error) {
        console.error(handleApiError(error, 'generateSessionTitle'));
        return "New Diagnosis";
    }
};

/**
 * Extracts context from a conversation using a low-latency model.
 */
export const extractConversationContext = async (messages: Message[]): Promise<ContextData> => {
    const conversation = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `Analyze the following conversation about a Mazda RX-8 and extract key diagnostic information. Identify symptoms, mentioned car parts, and suggested actions.

    - Symptoms should be observable problems (e.g., "Rough idle," "White smoke from exhaust").
    - Parts should be specific components (e.g., "Ignition coils," "Apex seals").
    - Actions should be recommended steps (e.g., "Check spark plugs," "Perform compression test").

    Return a JSON object. If nothing is found for a category, return an empty array.

    Conversation:
    ${conversation}`;

    try {
        const result: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                        parts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        }));

        return JSON.parse(result.text);

    } catch (error) {
        console.error(handleApiError(error, 'extractConversationContext'));
        return { symptoms: [], parts: [], actions: [] };
    }
};

/**
 * Generates quick reply suggestions using a low-latency model.
 */
export const generateQuickReplies = async (messages: Message[]): Promise<string[]> => {
    if (messages.length === 0) return [];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'model') return [];

    const conversationHistory = messages.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n');

    const prompt = `Based on the last AI response in this conversation, generate 3-4 concise, relevant quick replies for the user. These should be logical next steps or questions a user might ask.

    Rules:
    - Replies should be short (2-5 words).
    - They should be phrased as if the user is saying them.
    - Examples: "How do I test that?", "Where is it located?", "What tools do I need?".

    Conversation History:
    ${conversationHistory}
    `;

    try {
        const result: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        replies: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Array of 3-4 short reply suggestions for the user."
                        }
                    }
                }
            }
        }));
        const parsed = JSON.parse(result.text);
        return parsed.replies || [];
    } catch (error) {
        console.error(handleApiError(error, 'generateQuickReplies'));
        return [];
    }
};

/**
 * Uses Google Search grounding to generate an article on a given topic.
 */
export const generateKnowledgeArticle = async (topic: string): Promise<ArticleData> => {
    const prompt = `Generate a detailed but easy-to-understand article about "${topic}" specifically for a Mazda RX-8 owner. 
    Explain what it is, why it's important for the Renesis engine, common symptoms of failure or issues, and recommended solutions or maintenance.
    Structure the response with clear headings using Markdown (e.g., **What is it?**, **Common Symptoms**).`;
    
    try {
        const result: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        }));

        const sources: GroundingSource[] = result.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({
                uri: chunk.web?.uri,
                title: chunk.web?.title
            }))
            .filter((source: any) => source.uri) || [];

        return { text: result.text, sources };

    } catch (error) {
        throw handleApiError(error, 'generateKnowledgeArticle');
    }
};

/**
 * Generates speech from text using the TTS model.
 */
export const generateSpeech = async (textToSpeak: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await withRetry(() => model.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        }));
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        throw handleApiError(error, 'generateSpeech');
    }
};

/**
 * Live conversation service wrapper.
 */
export const live = {
    startSession: (
        onMessage: (message: LiveServerMessage) => void,
        onOpen: () => void,
        onError: (e: ErrorEvent) => void,
        onClose: (e: CloseEvent) => void,
    ) => {
        return ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: onOpen,
                onmessage: onMessage,
                onerror: onError,
                onclose: onClose,
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: "You are Rotary Mechanic. Keep your responses concise and conversational for this live audio session.",
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
    },
    utils: {
        encode,
        decode,
        decodeAudioData,
        createBlob,
    }
};
