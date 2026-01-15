import { useState, useCallback } from 'react';
import { lmStudioClient } from '../api/lmstudio';
import { comfyUIClient } from '../api/comfyui';
import type { Message, LMStudioMessage } from '../types';

const DEFAULT_SYSTEM_PROMPT = `You are an interactive storyteller creating an immersive roleplay experience.
Generate engaging, descriptive narratives based on user actions and choices.
Keep responses concise but vivid (2-4 paragraphs).
Focus on sensory details, emotions, and atmosphere.
Always end with a situation that invites user interaction.`;

export const useStory = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const generateStoryResponse = useCallback(async (userInput: string) => {
    try {
      setIsGenerating(true);

      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      };
      addMessage(userMessage);

      // Prepare conversation history for LM Studio
      const conversationHistory: LMStudioMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate story response
      const storyResponse = await lmStudioClient.generateStoryResponse(
        conversationHistory,
        userInput,
        systemPrompt
      );

      // Create assistant message (without image initially)
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: storyResponse,
        timestamp: Date.now()
      };
      addMessage(assistantMessage);

      // Generate image if enabled
      if (autoGenerateImages) {
        try {
          // Generate image prompt from story context
          const imagePrompt = await lmStudioClient.generateImagePrompt(storyResponse);
          console.log('Generated image prompt:', imagePrompt);

          // Generate image with ComfyUI
          const imageUrl = await comfyUIClient.generateImage(imagePrompt);

          // Update message with image
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, imageUrl }
                : msg
            )
          );
        } catch (imageError) {
          console.error('Failed to generate image:', imageError);
          // Continue without image - don't fail the whole response
        }
      }

    } catch (error) {
      console.error('Error generating story:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error generating the story. Please make sure LM Studio is running and try again.',
        timestamp: Date.now()
      };
      addMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, systemPrompt, autoGenerateImages, addMessage]);

  const startNewStory = useCallback((initialPrompt?: string) => {
    setMessages([]);
    if (initialPrompt) {
      generateStoryResponse(initialPrompt);
    }
  }, [generateStoryResponse]);

  const regenerateLastImage = useCallback(async () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

    if (!lastAssistantMessage) return;

    try {
      setIsGenerating(true);

      const imagePrompt = await lmStudioClient.generateImagePrompt(lastAssistantMessage.content);
      const imageUrl = await comfyUIClient.generateImage(imagePrompt);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === lastAssistantMessage.id
            ? { ...msg, imageUrl }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to regenerate image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  return {
    messages,
    isGenerating,
    systemPrompt,
    autoGenerateImages,
    setSystemPrompt,
    setAutoGenerateImages,
    generateStoryResponse,
    startNewStory,
    regenerateLastImage
  };
};
