import { GoogleGenAI, Type } from "@google/genai";
import { Message, ContextData } from "@/types/diagnosis";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

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
