import type { GeneratedContentPart } from '../types';

// This client-side service now proxies requests to a server endpoint at /api/edit.
// The server holds the real Google API key and calls the Gemini SDK.
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedContentPart[]> => {
  try {
    const resp = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: base64ImageData, mimeType, prompt }),
    });

    if (!resp.ok) {
      // Try to get a helpful error body
      let text = await resp.text();
      try {
        const json = JSON.parse(text);
        text = json.error || JSON.stringify(json);
      } catch (e) {}
      throw new Error(`Server error (${resp.status}): ${text}`);
    }

    const json = await resp.json();
    const parts = json.parts || [];

    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error('The server returned no generated content. Try again or check server logs.');
    }

    const generatedContent: GeneratedContentPart[] = parts.map((part: any) => {
      if (part.text) return { text: part.text } as GeneratedContentPart;
      if (part.inlineData) return { imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } as GeneratedContentPart;
      return {} as GeneratedContentPart;
    }).filter((p) => p.text || p.imageUrl);

    if (generatedContent.length === 0) {
      throw new Error('The response could not be processed into usable content.');
    }

    return generatedContent;
  } catch (error) {
    console.error('Error calling edit API:', error);
    if (error instanceof Error) throw new Error(`Failed to generate edit: ${error.message}`);
    throw new Error('An unknown error occurred while editing the image.');
  }
};
