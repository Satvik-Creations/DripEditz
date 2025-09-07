import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedContentPart } from '../types';
import Loader from './Loader';

interface ResultDisplayProps {
  content: GeneratedContentPart[];
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, isLoading }) => {
  const hasContent = content.length > 0;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const downloadImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const shareImage = (imageUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check this image',
        url: imageUrl
      }).catch(err => console.error('Share failed:', err));
    } else {
      alert('Share not supported on this device');
    }
  };

  const handleTouchStart = (e: React.TouchEvent, imageUrl: string) => {
    timerRef.current = setTimeout(() => {
      const touch = e.touches[0];
      setMenuX(touch.pageX);
      setMenuY(touch.pageY);
      setSelectedImageUrl(imageUrl);
      setMenuVisible(true);
    }, 600); // 600ms long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedImageUrl(null);
  };

  // Hide menu if user taps elsewhere
  useEffect(() => {
    const handleClick = () => {
      closeMenu();
    };
    if (menuVisible) {
      document.addEventListener('click', handleClick);
    }
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [menuVisible]);

  return (
    <div className="w-full h-full bg-black border border-gray-800 rounded-2xl flex flex-col p-6 shadow-2xl shadow-emerald-900/10">
      <h2 className="text-xl font-bold text-gray-200 mb-4 text-center">Output</h2>
      <div className="flex-grow w-full aspect-square bg-black rounded-2xl flex items-center justify-center overflow-auto relative group">
        {isLoading ? (
          <Loader />
        ) : !hasContent ? (
          <div className="text-center text-gray-500 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-4 font-semibold">Your masterpiece awaits</p>
            <p className="text-sm text-gray-500">The edited image will appear here</p>
          </div>
        ) : (
          <div className="p-2 w-full h-full">
            {content.map((part, index) => (
              <React.Fragment key={index}>
                {part.imageUrl && (
                  <div className="relative w-full h-full">
                    <img
                      src={part.imageUrl}
                      alt={`Generated content ${index}`}
                      className="w-full h-full object-contain rounded-lg"
                      onTouchStart={(e) => handleTouchStart(e, part.imageUrl!)}
                      onTouchEnd={handleTouchEnd}
                    />
                    <button
                      onClick={() => downloadImage(part.imageUrl!)}
                      className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      aria-label="Download image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                )}
                {part.text && (
                  <p className="text-gray-300 text-sm bg-black border border-gray-800 p-3 rounded-md mt-4">{part.text}</p>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Long press menu */}
        {menuVisible && selectedImageUrl && (
          <div
            style={{ left: menuX, top: menuY }}
            className="absolute bg-black text-white rounded-md border border-gray-700 shadow-lg p-2 z-50"
          >
            <button
              onClick={() => {
                if (selectedImageUrl) downloadImage(selectedImageUrl);
                closeMenu();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-800"
            >
              Download Image
            </button>
            <button
              onClick={() => {
                if (selectedImageUrl) shareImage(selectedImageUrl);
                closeMenu();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-800"
            >
              Share Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
