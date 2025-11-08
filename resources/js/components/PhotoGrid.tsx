import { cn } from '@/lib/utils';
import LazyImage from './LazyImage';
import { Photo } from '@/types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
  className?: string;
}

/**
 * Component lưới ảnh responsive với lazy loading
 */
export default function PhotoGrid({ photos, onPhotoClick, className }: PhotoGridProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">Không có ảnh nào</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Responsive grid với các breakpoints
        'grid gap-1',
        // Mobile: 3 columns
        'grid-cols-3',
        // Tablet: 4 columns
        'sm:grid-cols-4',
        // Desktop: 5 columns
        'md:grid-cols-5',
        // Large desktop: 6 columns
        'lg:grid-cols-6',
        // Extra large: 7 columns
        'xl:grid-cols-7',
        // 2xl: 8 columns
        '2xl:grid-cols-8',
        className
      )}
    >
      {photos.map((photo, index) => (
        <LazyImage
          key={photo.id || index}
          src={photo.url || photo.src}
          alt={photo.alt || photo.title || `Photo ${index + 1}`}
          onClick={() => onPhotoClick?.(photo, index)}
          className="aspect-square cursor-pointer hover:opacity-90 transition-opacity"
        />
      ))}
    </div>
  );
}

interface PhotoGroup {
  date: string;
  dateLabel: string;
  photos: Photo[];
}

interface PhotoGridByDateProps {
  photoGroups: PhotoGroup[];
  onPhotoClick?: (photo: Photo, index: number) => void;
  className?: string;
}

/**
 * Component cho photos grouped by date
 */
export function PhotoGridByDate({ photoGroups, onPhotoClick, className }: PhotoGridByDateProps) {
  if (!photoGroups || photoGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">Không có ảnh nào</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {photoGroups.map((group, groupIndex) => (
        <div key={group.date || groupIndex} className="space-y-2">
          {/* Date header */}
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
            {group.dateLabel}
          </h3>

          {/* Photos grid */}
          <PhotoGrid
            photos={group.photos}
            onPhotoClick={(photo, photoIndex) => {
              // Calculate global index
              let globalIndex = 0;
              for (let i = 0; i < groupIndex; i++) {
                globalIndex += photoGroups[i].photos.length;
              }
              globalIndex += photoIndex;
              onPhotoClick?.(photo, globalIndex);
            }}
          />
        </div>
      ))}
    </div>
  );
}
