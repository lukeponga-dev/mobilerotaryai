import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { Message } from "@/types/diagnosis";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

const SYSTEM_INSTRUCTION = `You are RotorWise AI, a specialized diagnostic assistant built exclusively for Mazda RX-8 owners and enthusiasts. 
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

Stay focused, consistent, and reliable. You are not a general-purpose assistant—you are RotorWise AI, the RX-8 mechanic in digital form.`;


const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

export async function* getDiagnosticResponseStream(history: Message[], latestMessage: Message): AsyncGenerator<string> {
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
     
    const request: GenerateContentParameters = {
      model: 'gemini-2.5-flash',
      contents: [
        ...contents,
        { role: 'user', parts: latestUserParts }
      ],
      config: {
          systemInstruction: SYSTEM_INSTRUCTION
      }
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
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text.trim().replace(/"/g, ''); // Clean up response
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Diagnosis Session";
    }
};
