export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  video?: string; // base64 string
}

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  context?: ContextData;
  quickReplies?: string[];
}

export interface ContextData {
    symptoms: string[];
    parts: string[];
    actions: string[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ArticleData {
    text: string;
    sources: GroundingSource[];
}

export interface LiveTranscript {
    id: string;
    speaker: 'user' | 'model';
    text: string;
    isFinal: boolean;
}