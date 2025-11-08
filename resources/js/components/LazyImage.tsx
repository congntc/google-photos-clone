import { useState, ImgHTMLAttributes } from 'react';
import { useIntersectionObserver } from '@/hooks/usePhotoGallery';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  aspectRatio?: string;
}

/**
 * Component ảnh với lazy loading
 */
export default function LazyImage({ 
  src, 
  alt, 
  className,
  onClick,
  aspectRatio = 'aspect-square',
  ...props 
}: LazyImageProps) {
  const [imgRef, isIntersecting] = useIntersectionObserver();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-sm',
        aspectRatio,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Placeholder/Skeleton */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Actual image - only load when intersecting */}
      {isIntersecting && !error && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            onClick && 'cursor-pointer hover:opacity-90'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          {...props}
        />
      )}

      {/* Hover overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
      )}
    </div>
  );
}
