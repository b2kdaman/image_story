/**
 * Parse LLM response to extract story text and image prompt
 */
export interface ParsedResponse {
  storyText: string;
  imagePrompt: string;
}

export function parseStoryResponse(response: string): ParsedResponse {
  // Extract story text between [STORY] and [/STORY]
  const storyMatch = response.match(/\[STORY\]([\s\S]*?)\[\/STORY\]/i);
  const storyText = storyMatch ? storyMatch[1].trim() : response;

  // Extract image prompt between [IMAGE] and [/IMAGE]
  const imageMatch = response.match(/\[IMAGE\]([\s\S]*?)\[\/IMAGE\]/i);
  const imagePrompt = imageMatch ? imageMatch[1].trim() : '';

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
