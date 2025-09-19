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
        const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return { imageUrl };
      }
      return {};
    }).filter(part => part.text || part.imageUrl);

    if (generatedContent.length === 0) {
        throw new Error("The AI response could not be processed, even though content was received. Please try again.");
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
