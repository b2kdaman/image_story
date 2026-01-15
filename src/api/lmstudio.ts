import axios from 'axios';
import type { LMStudioRequest, LMStudioMessage } from '../types';

const LM_STUDIO_BASE_URL = '/api/lmstudio/v1';

export class LMStudioClient {
  /**
   * Send a chat completion request to LM Studio
   */
  async chatCompletion(
    messages: LMStudioMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<string> {
    try {
      const request: LMStudioRequest = {
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 500,
        stream: false
      };

      const response = await axios.post(`${LM_STUDIO_BASE_URL}/chat/completions`, request);

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      throw new Error('No response from LM Studio');
    } catch (error) {
      console.error('Error calling LM Studio:', error);
      throw new Error('Failed to get response from LM Studio');
    }
  }

  /**
   * Stream a chat completion (for real-time responses)
   */
  async streamChatCompletion(
    messages: LMStudioMessage[],
    onChunk: (chunk: string) => void,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<void> {
    try {
      const request: LMStudioRequest = {
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 500,
        stream: true
      };

      const response = await fetch(`http://localhost:1234/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from LM Studio:', error);
      throw new Error('Failed to stream response from LM Studio');
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${LM_STUDIO_BASE_URL}/models`);
      return response.data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }

  /**
   * Generate a story continuation based on the current context
   */
  async generateStoryResponse(
    conversationHistory: LMStudioMessage[],
    userInput: string,
    systemPrompt?: string
  ): Promise<string> {
    const messages: LMStudioMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    messages.push(...conversationHistory);
    messages.push({
      role: 'user',
      content: userInput
    });

    return this.chatCompletion(messages, {
      temperature: 0.8,
      max_tokens: 800
    });
  }

  /**
   * Extract image prompt from story text
   * Asks the LLM to generate a detailed image description
   */
  async generateImagePrompt(storyContext: string): Promise<string> {
    const messages: LMStudioMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at creating detailed image prompts for AI image generation. Create a vivid, detailed visual description based on the scene provided.'
      },
      {
        role: 'user',
        content: `Based on this story scene, create a detailed image prompt for AI image generation (focus on visual details, setting, mood, and style):\n\n${storyContext}\n\nImage prompt:`
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 200
    });
  }
}

export const lmStudioClient = new LMStudioClient();
