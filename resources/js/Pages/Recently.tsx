import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app';
import { PhotoGridByDate } from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import { useDarkMode, useInfiniteScroll } from '@/hooks/usePhotoGallery';

export default function Recently({ photos = [] }) {
  const { isDark, toggleDark } = useDarkMode();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'month'

  // Group photos by date
  const photoGroups = viewMode === 'day' 
    ? groupPhotosByDate(photos)
    : groupPhotosByMonth(photos);
  const allPhotos = photoGroups.flatMap(group => group.photos);

  // Infinite scroll
  useInfiniteScroll(
    () => {
      if (!isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setPage(p => p + 1);
          setIsLoading(false);
        }, 1000);
      }
    },
    page < 3,
    isLoading
  );

  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedPhoto(allPhotos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedPhoto(allPhotos[currentIndex - 1]);
    }
  };

  return (
    <>
      <Head title="Đã thêm gần đây" />

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Navigation */}
        <nav className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link
              href="/photos"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="flex-1">
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Đã thêm gần đây
              </h1>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Tháng
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-2 py-4">
          {photoGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có ảnh nào gần đây
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Ảnh và video bạn thêm gần đây sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <PhotoGridByDate
              photoGroups={photoGroups}
              onPhotoClick={handlePhotoClick}
            />
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </main>

        {/* Photo modal */}
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onNext={currentIndex < allPhotos.length - 1 ? handleNext : null}
          onPrev={currentIndex > 0 ? handlePrev : null}
          currentIndex={currentIndex}
          totalPhotos={allPhotos.length}
        />
      </div>
    </>
  );
}

function groupPhotosByDate(photos) {
  if (!photos || photos.length === 0) return [];

  const groups = photos.reduce((acc, photo) => {
    const dateLabel = getDateLabel(photo.date || new Date().toISOString());
    const existingGroup = acc.find(g => g.dateLabel === dateLabel);

    if (existingGroup) {
      existingGroup.photos.push(photo);
    } else {
      acc.push({
        date: photo.date,
        dateLabel,
        photos: [photo],
      });
    }

    return acc;
  }, []);

  return groups;
}

function groupPhotosByMonth(photos) {
  if (!photos || photos.length === 0) return [];

  const groups = photos.reduce((acc, photo) => {
    const date = new Date(photo.date || new Date());
    const monthLabel = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
    const existingGroup = acc.find(g => g.dateLabel === monthLabel);

    if (existingGroup) {
      existingGroup.photos.push(photo);
    } else {
      acc.push({
        date: photo.date,
        dateLabel: monthLabel,
        photos: [photo],
      });
    }

    return acc;
  }, []);

  return groups;
}

function getDateLabel(dateStr) {
  const photoDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  photoDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (photoDate.getTime() === today.getTime()) {
    return 'Hôm nay';
  } else if (photoDate.getTime() === yesterday.getTime()) {
    return 'Hôm qua';
  } else {
    const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    const dayOfWeek = dayNames[photoDate.getDay()];
    const day = photoDate.getDate();
    const month = photoDate.getMonth() + 1;
    return `${dayOfWeek}, ${day} thg ${month}`;
  }
}
