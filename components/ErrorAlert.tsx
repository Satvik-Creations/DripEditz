import React from 'react';

interface ErrorAlertProps {
  message: string;
  onClear: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClear }) => {
  if (!message) return null;

  return (
    <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-300 px-4 py-3 rounded-xl relative my-4" role="alert">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{message}</span>
        </div>
      </div>
      <button onClick={onClear} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error message">
        <svg className="fill-current h-6 w-6 text-red-400/70 hover:text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
};

export default ErrorAlert;