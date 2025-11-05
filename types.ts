export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  video?: string; // base64 string
  sources?: GroundingSource[];
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

export interface ChartData {
  type: 'bar' | 'line';
  title: string;
  unit?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

// --- Added for Live Dashboard ---
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VehicleData {
    rpm: number;
    coolantTemp: number; // in Celsius
    speed: number; // in km/h
    throttlePos: number; // in %
    stft: number; // Short Term Fuel Trim in %
    voltage: number;
}
// --------------------------------