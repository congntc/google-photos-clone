import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import { useDarkMode } from '@/hooks/usePhotoGallery';

export default function Places({ places = [] }) {
  const { isDark, toggleDark } = useDarkMode();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPhotos = selectedPlace ? selectedPlace.photos : [];

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
  };

  const handleBackToPlaces = () => {
    setSelectedPlace(null);
  };

  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (currentIndex < currentPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedPhoto(currentPhotos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedPhoto(currentPhotos[currentIndex - 1]);
    }
  };

  return (
    <>
      <Head title={selectedPlace ? selectedPlace.name : 'Địa điểm'} />

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Navigation */}
        <nav className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={selectedPlace ? handleBackToPlaces : () => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                {selectedPlace ? selectedPlace.name : 'Địa điểm'}
              </h1>
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
        <main className="max-w-7xl mx-auto px-4 py-6">
          {!selectedPlace ? (
            // Places list
            places.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Chưa có địa điểm nào
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Ảnh có thông tin vị trí sẽ được tổ chức theo địa điểm ở đây
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceClick(place)}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    {/* Cover photo */}
                    {place.coverPhoto && (
                      <img
                        src={place.coverPhoto}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Place info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-start gap-2 mb-1">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {place.name}
                          </h3>
                          <p className="text-sm text-gray-200">
                            {place.photoCount} ảnh
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            // Place photos
            <div>
              {/* Place header */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-2">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {selectedPlace.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPlace.photoCount} ảnh
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos grid */}
              <PhotoGrid
                photos={currentPhotos}
                onPhotoClick={handlePhotoClick}
              />
            </div>
          )}
        </main>

        {/* Photo modal */}
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onNext={currentIndex < currentPhotos.length - 1 ? handleNext : null}
          onPrev={currentIndex > 0 ? handlePrev : null}
          currentIndex={currentIndex}
          totalPhotos={currentPhotos.length}
        />
      </div>
    </>
  );
}
