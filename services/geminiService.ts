import { GoogleGenAI, GenerateContentParameters, Type, Modality, LiveServerMessage, Blob } from "@google/genai";
import { Message, ContextData, GroundingSource, ArticleData, LiveTranscript } from "../types";

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


const SYSTEM_INSTRUCTION = `You are AI Mazda Mechanic, a specialized diagnostic assistant built exclusively for Mazda RX-8 owners and enthusiasts. 
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

Stay focused, consistent, and reliable. You are not a general-purpose assistant—you are AI Mazda Mechanic, the RX-8 mechanic in digital form.`;


const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

export async function* getDiagnosticResponseStream(history: Message[], latestMessage: Message, isDeepAnalysis?: boolean): AsyncGenerator<string> {
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));
  
    const latestUserParts = [{ text: latestMessage.text }];
    if (latestMessage.image) {
      const mimeType = latestMessage.image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
      latestUserParts.push(fileToGenerativePart(latestMessage.image, mimeType) as any);
    } else if (latestMessage.video) {
      const mimeType = latestMessage.video.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
      latestUserParts.push(fileToGenerativePart(latestMessage.video, mimeType) as any);
    }
    
    let modelName = 'gemini-2.5-flash';
    const config: any = { systemInstruction: SYSTEM_INSTRUCTION };

    if (isDeepAnalysis) {
        modelName = 'gemini-2.5-pro';
        config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (latestMessage.video) {
        // Use Pro for video analysis as it's more complex
        modelName = 'gemini-2.5-pro';
    }
     
    const request: GenerateContentParameters = {
      model: modelName,
      contents: [
        ...contents,
        { role: 'user', parts: latestUserParts }
      ],
      config: config
    };
    
    try {
      const result = await model.generateContentStream(request);
      for await (const chunk of result) {
        if (chunk.text) {
            yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      yield "Sorry, I encountered an error. Please check the console for details and try again.";
    }
  };

export const generateSessionTitle = async (firstMessage: string): Promise<string> => {
    const prompt = `Based on the following user query about a Mazda RX-8, create a concise and descriptive title of 5 words or less. For example: "Engine misfire on cold start" or "Coolant leak near radiator".\n\nQuery: "${firstMessage}"\n\nTitle:`;
    try {
        const result = await model.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return result.text.trim().replace(/"/g, ''); // Clean up response
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Diagnosis Session";
    }
};

export const extractConversationContext = async (history: Message[]): Promise<ContextData> => {
    const conversationText = history.map(msg => `${msg.role}: ${msg.text}`).join('\n');
    const prompt = `Analyze the following conversation about a Mazda RX-8 diagnosis. Extract the key symptoms, mentioned parts, and suggested actions. If nothing is found for a category, return an empty array.

    Conversation:
    ${conversationText}
    `;

    try {
        const result = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        symptoms: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of symptoms described by the user (e.g., 'Rough idle', 'White smoke')."
                        },
                        parts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of specific car parts mentioned (e.g., 'Ignition coils', 'Apex seals')."
                        },
                        actions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of actionable steps or tests suggested (e.g., 'Check spark plugs', 'Perform compression test')."
                        }
                    },
                    required: ["symptoms", "parts", "actions"]
                }
            }
        });

        const jsonText = result.text.trim();
        return JSON.parse(jsonText) as ContextData;
    } catch (error) {
        console.error("Error extracting context:", error);
        return { symptoms: [], parts: [], actions: [] };
    }
};

export const generateQuickReplies = async (history: Message[]): Promise<string[]> => {
    if (history.length === 0) return [];
    
    const lastMessage = history[history.length - 1];
    if (lastMessage.role !== 'model' || !lastMessage.text) return [];

    const prompt = `Based on the following AI response to a Mazda RX-8 query, suggest 3 brief and relevant follow-up questions or actions a user might take. Keep each suggestion under 6 words.

    AI Response: "${lastMessage.text.substring(0, 500)}..." 
    
    Provide the suggestions as a JSON object.`;

    try {
        const result = await model.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        replies: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A short, relevant follow-up question or action."
                            },
                            description: "An array of 3 suggested replies for the user."
                        }
                    },
                    required: ["replies"]
                }
            }
        });

        const jsonText = result.text.trim();
        const parsed = JSON.parse(jsonText);
        return (parsed.replies || []).slice(0, 3); // Ensure we only get up to 3
    } catch (error) {
        console.error("Error generating quick replies:", error);
        return [];
    }
};

export const generateKnowledgeArticle = async (topic: string): Promise<ArticleData> => {
    const prompt = `You are AI Mazda Mechanic, an expert on the Mazda RX-8 and its Renesis rotary engine.
    Write a detailed knowledge base article on the following topic for a Mazda RX-8 enthusiast: "${topic}".
    The article should be easy to understand but comprehensive.
    Structure your response clearly using Markdown for formatting. Use bold text for headings (e.g., **My Heading**) and bullet points for lists (e.g., * My list item).
    
    Include the following sections:
    - **Overview**: A brief summary of the topic.
    - **Common Symptoms**: A list of signs that this issue is occurring.
    - **Diagnostic Steps**: How to confirm the problem.
    - **Common Causes**: Why this problem happens.
    - **Solutions & Repairs**: Step-by-step guide to fixing it.
    - **Required Tools**: A list of necessary tools.
    - **Preventative Maintenance**: Tips to avoid the issue in the future.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        const sources: GroundingSource[] = result.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter(Boolean) || [];

        return {
            text: result.text.trim(),
            sources: sources
        };
    } catch (error) {
        console.error("Error generating knowledge article:", error);
        return {
            text: "Sorry, I was unable to generate an article on that topic. Please try again.",
            sources: []
        };
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received from TTS API.");
      }
      return base64Audio;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
};

export const startLiveSession = (
    onMessage: (message: LiveServerMessage) => void,
    onOpen: () => void,
    onError: (e: ErrorEvent) => void,
    onClose: (e: CloseEvent) => void
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
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: `You are AI Mazda Mechanic. Be concise and conversational. Keep your answers brief and to the point, as if you're speaking to someone working on their car.`,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        },
    });
};

export const live = {
    startSession: startLiveSession,
    utils: {
        decode,
        decodeAudioData,
        createBlob,
    },
};