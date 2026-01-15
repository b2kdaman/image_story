/**
 * Parse LLM response to extract story text and image prompt
 */
export interface ParsedResponse {
  storyText: string;
  imagePrompt: string;
}

export function parseStoryResponse(response: string): ParsedResponse {
  console.log('Parser: Processing response of length:', response.length);

  // Remove DeepSeek R1 thinking tags if present
  let cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  console.log('Parser: Cleaned response length:', cleanedResponse.length);

  // Try multiple tag variations for more flexibility
  let storyMatch = cleanedResponse.match(/\[STORY\]([\s\S]*?)\[\/STORY\]/i);

  // If no match, try without closing tag
  if (!storyMatch) {
    storyMatch = cleanedResponse.match(/\[STORY\]([\s\S]*?)(?=\[IMAGE\]|$)/i);
  }

  const storyText = storyMatch ? storyMatch[1].trim() : cleanedResponse;

  // Extract image prompt between [IMAGE] and [/IMAGE]
  let imageMatch = cleanedResponse.match(/\[IMAGE\]([\s\S]*?)\[\/IMAGE\]/i);

  // If no match, try without closing tag
  if (!imageMatch) {
    imageMatch = cleanedResponse.match(/\[IMAGE\]([\s\S]*?)$/i);
  }

  const imagePrompt = imageMatch ? imageMatch[1].trim() : '';

  console.log('Parser: Found story?', !!storyMatch);
  console.log('Parser: Found image prompt?', !!imageMatch);
  console.log('Parser: Image prompt length:', imagePrompt.length);

  return {
    storyText,
    imagePrompt
  };
}

/**
 * Clean story text for display (remove any remaining tags)
 */
export function cleanStoryText(text: string): string {
  return text
    .replace(/\[STORY\]/gi, '')
    .replace(/\[\/STORY\]/gi, '')
    .replace(/\[IMAGE\]/gi, '')
    .replace(/\[\/IMAGE\]/gi, '')
    .trim();
}
