
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import ErrorAlert from './components/ErrorAlert';
import { editImage } from './services/geminiService';
import type { GeneratedContentPart, ImageFile } from './types';

function App() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentPart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((imageFile: ImageFile | null) => {
    setImage(imageFile);
    // Clear previous results when a new image is selected
    setGeneratedContent([]);
    setError(null);
  }, []);
  
  const handleGenerate = useCallback(async () => {
    if (!image || !prompt) {
      setError("Please upload an image and provide an edit description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent([]);

    try {
      const result = await editImage(image.base64, image.mimeType, prompt);
      setGeneratedContent(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [image, prompt]);

  const isButtonDisabled = !image || !prompt.trim();

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/30 rounded-full filter blur-3xl animate-pulse opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/30 rounded-full filter blur-3xl animate-pulse opacity-30 animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto p-4 md:p-8 flex-grow">
          {error && <ErrorAlert message={error} onClear={() => setError(null)} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: Inputs */}
            <div className="bg-black p-6 rounded-2xl border border-gray-800 flex flex-col space-y-6 shadow-2xl shadow-emerald-900/10">
              <ImageUploader 
                onImageSelect={handleImageSelect} 
                imagePreviewUrl={image?.previewUrl || null} 
              />
              <div className="flex-grow flex flex-col">
                <PromptInput 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  onSubmit={handleGenerate} 
                  isLoading={isLoading}
                  isButtonDisabled={isButtonDisabled}
                />
              </div>
            </div>
            
            {/* Right Column: Output */}
            <div className="h-full">
              <ResultDisplay content={generatedContent} isLoading={isLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;