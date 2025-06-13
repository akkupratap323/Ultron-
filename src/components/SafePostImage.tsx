import Image from 'next/image';
import { useState } from 'react';

const SafePostImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div className={`w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center ${className || ''}`}>
        <span className="text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={500}
        height={300}
        className="rounded-lg w-full"
        unoptimized
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
    </div>
  );
};

export default SafePostImage;
