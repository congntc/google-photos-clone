import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import { useDarkMode } from '@/hooks/usePhotoGallery';

export default function PeopleAndPets({ people = [] }) {
  const { isDark, toggleDark } = useDarkMode();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPhotos = selectedPerson ? selectedPerson.photos : [];

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleBackToPeople = () => {
    setSelectedPerson(null);
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
      <Head title={selectedPerson ? selectedPerson.name : 'Mọi người và vật nuôi'} />

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Navigation */}
        <nav className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={selectedPerson ? handleBackToPeople : () => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                {selectedPerson ? selectedPerson.name : 'Mọi người và vật nuôi'}
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
          {!selectedPerson ? (
            // People list
            people.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Chưa có mọi người và vật nuôi
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Google Photos sẽ tự động nhận diện khuôn mặt và tổ chức ảnh theo người
                </p>
              </div>
            ) : (
              <div>
                {/* Header description */}
                <div className="mb-6 text-center max-w-2xl mx-auto">
                  <p className="text-gray-600 dark:text-gray-400">
                    Ảnh của bạn được tổ chức theo người và vật nuôi xuất hiện trong đó
                  </p>
                </div>

                {/* People grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {people.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handlePersonClick(person)}
                      className="group flex flex-col items-center"
                    >
                      {/* Avatar */}
                      <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3 ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                        {person.avatar ? (
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                            <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Name and count */}
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-1">
                          {person.name || 'Chưa đặt tên'}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {person.photoCount} ảnh
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Add new person card */}
                  <button className="group flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-full aspect-square rounded-full bg-gray-200 dark:bg-gray-800 mb-3 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                        Thêm người
                      </h3>
                    </div>
                  </button>
                </div>
              </div>
            )
          ) : (
            // Person photos
            <div>
              {/* Person header */}
              <div className="mb-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4">
                  {selectedPerson.avatar ? (
                    <img
                      src={selectedPerson.avatar}
                      alt={selectedPerson.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {selectedPerson.name || 'Chưa đặt tên'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedPerson.photoCount} ảnh
                </p>
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
