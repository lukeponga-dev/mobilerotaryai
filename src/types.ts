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
}

export interface ContextData {
    symptoms: string[];
    parts: string[];
    actions: string[];
}