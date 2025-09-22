import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { GeneratedContentPart } from '../types';

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedContentPart[]> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Check for explicit prompt blocking first.
    if (response.promptFeedback?.blockReason) {
      throw new Error(
        `Your request was blocked for safety reasons (${response.promptFeedback.blockReason}). Please adjust your prompt or image.`
      );
    }
    
    const candidate = response.candidates?.[0];

    // If there are no candidates, it's likely a response-level safety block or other issue.
    if (!candidate) {
      throw new Error("The AI did not provide a response. This could be due to safety filters blocking the output. Please try modifying your prompt.");
    }
    
    // Check if the generation was stopped due to safety.
    if (candidate.finishReason === 'SAFETY') {
         throw new Error(`The AI stopped generating because the response was considered unsafe. Please adjust your prompt.`);
    }
    
    // Check for other non-successful finish reasons.
    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
         throw new Error(`The AI stopped generating for an unexpected reason: ${candidate.finishReason}. Please adjust your prompt.`);
    }

    const parts = candidate.content?.parts || [];
    
    // If there are no parts, it's the "no content" error, but now we've ruled out the most common safety issues.
    if (parts.length === 0) {
      throw new Error("The AI did not return any content. Try adjusting your prompt.");
    }
    
    const generatedContent: GeneratedContentPart[] = parts.map(part => {
      if (part.text) {
        return { text: part.text };
      } else if (part.inlineData) {
        // Use environment variable for OpenRouter API key
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

        // Parse OpenRouter response
        const choices = data.choices?.[0];
        if (!choices || !choices.message?.content) {
          throw new Error("No content returned from OpenRouter.");
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
