export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp: number;
}

export interface StoryState {
  messages: Message[];
  isGenerating: boolean;
  currentScene: string;
}

export interface ComfyUIWorkflow {
  prompt: Record<string, any>;
  client_id?: string;
}

export interface LMStudioMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LMStudioRequest {
  model?: string;
  messages: LMStudioMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ComfyUIPromptRequest {
  prompt: string;
  client_id: string;
}
