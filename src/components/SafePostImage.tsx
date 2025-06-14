import Image from 'next/image';
import { useState } from 'react';

interface SafePostImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: 'square' | 'video' | 'auto';
}

const SafePostImage = ({ 
  src, 
  alt, 
  className, 
  width = 500, 
  height = 300,
  aspectRatio = 'auto'
}: SafePostImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when src changes
  const handleSrcChange = (newSrc: string) => {
    if (newSrc !== src) {
      setImageError(false);
      setIsLoading(true);
      setRetryCount(0);
    }
  };

  // Retry mechanism for failed images
  const handleRetry = () => {
    if (retryCount < 2) { // Allow 2 retries
      setImageError(false);
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleError = () => {
    console.error('Image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // Aspect ratio classes
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }[aspectRatio];

  if (imageError) {
    return (
      <div className={`w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Image unavailable</span>
          {retryCount < 2 && (
            <button 
              onClick={handleRetry}
              className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatioClass} ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg w-full h-full object-cover"
        unoptimized={src.startsWith('http')} // Only unoptimized for external URLs
        onError={handleError}
        onLoad={handleLoad}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SafePostImage;
