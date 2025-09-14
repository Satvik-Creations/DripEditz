
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

    const parts = response.candidates?.[0]?.content?.parts || [];
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
        throw new Error("The AI response could not be processed. Please try again.");
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
