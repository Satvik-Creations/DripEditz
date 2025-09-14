import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isButtonDisabled: boolean;
  cooldown: number;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, isButtonDisabled, cooldown }) => {
  const isActuallyDisabled = isButtonDisabled || isLoading || cooldown > 0;
  
  const getButtonText = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      );
    }
    if (cooldown > 0) {
      return `On Cooldown (${cooldown}s)`;
    }
    return 'Generate Drip';
  };

  return (
    <div className="w-full flex flex-col h-full">
      <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-300 mb-2">2. Describe Your Edit</label>
      <textarea
        id="prompt-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'add a futuristic helmet to the person', 'make the background a neon city', 'turn it into a Picasso painting'..."
        className="flex-grow w-full p-4 bg-black border border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 resize-none disabled:opacity-50"
        disabled={isLoading || cooldown > 0}
      />
      <button
        onClick={onSubmit}
        disabled={isActuallyDisabled}
        className="mt-4 w-full py-4 px-4 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg shadow-lg shadow-emerald-900/40 hover:shadow-xl hover:shadow-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default PromptInput;