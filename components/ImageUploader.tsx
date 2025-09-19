import React, { useCallback, useRef } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelect: (imageFile: ImageFile | null) => void;
  imagePreviewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        onImageSelect({
          file,
          base64,
          mimeType,
          previewUrl: URL.createObjectURL(file),
        });
      };
      reader.readAsDataURL(file);
    } else {
        onImageSelect(null);
    }
  }, [onImageSelect]);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const fakeEvent = { target: { files: event.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
        event.dataTransfer.clearData();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full">
      <label htmlFor="image-upload" className="text-lg font-semibold text-gray-300 mb-2 block">1. Upload Image</label>
      <input
        id="image-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        aria-label="Upload your image"
      />
      <div
        onClick={handleAreaClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        aria-label="Image upload area, click or drag and drop an image"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAreaClick(); }}
        className="w-full aspect-square bg-black border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg p-2" />
        ) : (
          <div className="text-center text-gray-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 font-semibold">Click or drag & drop to upload</p>
            <p className="text-sm text-gray-500">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;