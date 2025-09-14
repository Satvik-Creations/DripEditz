
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
    let errorMessage = "An unknown error occurred while editing the image.";

    if (error instanceof Error) {
        const errorString = error.toString();
        
        if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = "You've exceeded your API quota. Please check your plan and billing details, or try again later.";
        } else if (errorString.includes('API key not valid')) {
            errorMessage = "Your API key is not valid. Please check your environment variables.";
        } else if (errorString.includes('SAFETY')) {
            errorMessage = "The response was blocked due to safety settings. Please try a different prompt.";
        } else if (error.message) {
            // Try to find a user-facing message in the error
            const match = error.message.match(/\[\d{3} \w+\] (.*)/);
            if (match && match[1]) {
                errorMessage = `API Error: ${match[1]}`;
            } else {
                errorMessage = `Failed to generate edit: ${error.message}`;
            }
        }
    }
    
    throw new Error(errorMessage);
  }
};