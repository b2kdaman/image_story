import { useState, useCallback } from 'react';
import { lmStudioClient } from '../api/lmstudio';
import { comfyUIClient } from '../api/comfyui';
import { parseStoryResponse, cleanStoryText } from '../utils/parser';
import type { Message, LMStudioMessage } from '../types';

const DEFAULT_SYSTEM_PROMPT = `You are an interactive storyteller creating an immersive FIRST-PERSON roleplay experience.
Generate engaging, descriptive narratives based on user actions and choices.

CRITICAL RULES:
- ALL story text must be written in FIRST-PERSON perspective (use "I", "my", "me")
- ALL image prompts must describe scenes from FIRST-PERSON POV (what the character sees)
- Focus on immersive sensory details - what you see, hear, feel, smell, touch
- End each story segment with a situation that invites user interaction

Your response MUST be in this exact format:
[STORY]
Write 2-4 paragraphs of first-person narrative here. Use "I" perspective throughout. Example: "I step forward and notice...", "My hand reaches out...", "I feel the cold air..."
[/STORY]

[IMAGE]
Write a first-person POV image prompt. Describe what the character SEES from their perspective. Use terms like: "first person view", "POV shot", "looking at", "view of", "from perspective of character". Include: setting, lighting, mood, what's in front of the character, atmospheric details, cinematic style.
[/IMAGE]

EXAMPLE:
[STORY]
I push open the heavy wooden door, and it creaks loudly in the silence. Before me stretches a vast chamber, its walls covered in glowing blue runes that pulse with an otherworldly light. I feel the ancient magic tingling on my skin as I take my first cautious step inside.
[/STORY]

[IMAGE]
First person POV view of ancient stone temple chamber, glowing blue magical runes on walls ahead, mysterious atmospheric lighting, dust particles floating in volumetric light rays, stone floor visible in foreground, immersive perspective, cinematic composition, photorealistic, wide angle view
[/IMAGE]

Always use both tags in your response.`;

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
      const rawResponse = await lmStudioClient.generateStoryResponse(
        conversationHistory,
        userInput,
        systemPrompt
      );

      // Parse the response to extract story text and image prompt
      const { storyText, imagePrompt } = parseStoryResponse(rawResponse);
      const cleanedStoryText = cleanStoryText(storyText);

      console.log('Story text:', cleanedStoryText);
      console.log('Image prompt:', imagePrompt);

      // Create assistant message with only the story text (user shouldn't see the image prompt)
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: cleanedStoryText,
        imagePrompt: imagePrompt, // Store for later use (regeneration)
        timestamp: Date.now()
      };
      addMessage(assistantMessage);

      // Generate image if enabled and we have an image prompt
      if (autoGenerateImages && imagePrompt) {
        try {
          // Generate image with ComfyUI using the extracted image prompt
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

      // Use stored image prompt if available, otherwise generate new one
      let imagePrompt = lastAssistantMessage.imagePrompt;

      if (!imagePrompt) {
        // Fallback: ask LLM to generate an image prompt from the story text
        imagePrompt = await lmStudioClient.generateImagePrompt(lastAssistantMessage.content);
      }

      console.log('Regenerating image with prompt:', imagePrompt);
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
