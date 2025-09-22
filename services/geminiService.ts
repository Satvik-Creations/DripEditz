import type { GeneratedContentPart } from '../types';

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedContentPart[]> => {
  try {
    // Use Vite environment variable for OpenRouter API key
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_OPENROUTER_API_KEY environment variable not set.");
    }

    // OpenRouter endpoint and Gemini model
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    const model = "google/gemini-2.5-flash-image-preview";

    // Prepare OpenAI-compatible payload
    const payload = {
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64ImageData}`
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const data = await response.json();
    // Log the full response for debugging
    console.log('OpenRouter API response:', data);

    // Parse OpenRouter response
    const choices = data.choices?.[0];
    if (!choices || !choices.message?.content) {
      throw new Error("No content returned from OpenRouter. See console for full response.");
    }

    // Parse content for images/text
    const generatedContent: GeneratedContentPart[] = [];
    const content = choices.message.content;
    if (typeof content === "string") {
      generatedContent.push({ text: content });
    } else if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "text") {
          generatedContent.push({ text: part.text });
        } else if (part.type === "image_url") {
          generatedContent.push({ imageUrl: part.image_url.url });
        }
      }
    }

    if (generatedContent.length === 0) {
      throw new Error("No valid content returned from OpenRouter.");
    }

    return generatedContent;
  } catch (error) {
    console.error("Error editing image:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate edit: ${error.message}`);
    }
    throw new Error("An unknown error occurred while editing the image.");
  }
};
