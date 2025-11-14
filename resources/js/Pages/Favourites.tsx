import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import '../assets/css/page-google-photos.css';
import '../assets/css/favourites-page.css';

interface PhotoItem {
  id: number;
  url: string;
  thumbnail_url?: string;
  date: string;
  month: string;
  year: string;
  type: 'image' | 'video';
  mime_type: string;
  is_favorite: boolean;
  original_filename: string;
  file_size: number;
  width?: number;
  height?: number;
  durationSec?: number;
}

interface AlbumItem {
  id: number;
  title: string;
  description?: string;
  photos_count: number;
  cover_url?: string;
  created_at: string;
}

interface FavouritesPageProps extends PageProps {
  photos: PhotoItem[];
}

// mm:ss or h:mm:ss
const formatDuration = (seconds?: number) => {
  if (seconds == null || isNaN(seconds)) return '';
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Helper to inject external icon fonts
const ensureIconCss = (): void => {
  const links = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/line-awesome/1.3.0/line-awesome/css/line-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css',
  ];
  links.forEach((href) => {
    if (!document.head.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    }
  });
};

export default function Favourites({ photos: initialPhotos = [], auth }: FavouritesPageProps) {
  // Load icon fonts on mount
  useEffect(() => {
    ensureIconCss();
  }, []);

  // Reset body overflow when component mounts (fix scrollbar issue when navigating from other pages)
  useEffect(() => {
    // Add class to body to enable CSS override
    document.body.classList.add('favourites-page-body');
    
    // Set overflow hidden for body/html (container will handle scroll)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    return () => {
      // Remove class on unmount
      document.body.classList.remove('favourites-page-body');
      // Reset overflow to auto for other pages
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);
  
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialPhotos.filter(p => p.is_favorite).map(p => p.id)));
  const [selectedIds, setSelectedIds] = useState(() => new Set<number>());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);


  const onToggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const onToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Xử lý toggle favorite
  const handleToggleFavorite = useCallback((ids: number[], isFavorite: boolean) => {
    fetch('/photos/toggle-favorite', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ids, is_favorite: isFavorite }),
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi cập nhật');
        }
        
        if (data.success) {
          // Xóa khỏi danh sách favorites nếu bỏ yêu thích
          if (!isFavorite) {
            setPhotos(prevPhotos => prevPhotos.filter(p => !ids.includes(p.id)));
          } else {
            // Cập nhật state
            setPhotos(prevPhotos => 
              prevPhotos.map(p => 
                ids.includes(p.id) ? { ...p, is_favorite: isFavorite } : p
              )
            );
          }
          
          // Cập nhật favoriteIds
          setFavoriteIds(prev => {
            const next = new Set(prev);
            if (isFavorite) {
              ids.forEach(id => next.add(id));
            } else {
              ids.forEach(id => next.delete(id));
            }
            return next;
          });
          
          // Xóa selection
          setSelectedIds(new Set());
        } else {
          throw new Error(data.message || 'Lỗi khi cập nhật');
        }
      })
      .catch(error => {
        console.error('Toggle favorite error:', error);
        alert(error.message || 'Lỗi khi cập nhật. Vui lòng thử lại!');
      });
  }, []);

  // Xử lý toggle favorite từ selection toolbar
  const handleToggleFavoriteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    const ids = Array.from(selectedIds);
    // Bỏ yêu thích (vì đây là trang Favourites)
    handleToggleFavorite(ids, false);
  }, [selectedIds, handleToggleFavorite]);

  // Xử lý toggle favorite từ lightbox
  const handleLightboxToggleFavorite = useCallback(() => {
    if (currentPhotoIndex === null) return;
    
    const photo = photos[currentPhotoIndex];
    handleToggleFavorite([photo.id], !photo.is_favorite);
  }, [currentPhotoIndex, photos, handleToggleFavorite]);

  // Helper to format date headers
  const getDateLabel = (dateStr: string) => {
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
      const dayOfWeek = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'][photoDate.getDay()];
      const day = photoDate.getDate();
      const month = photoDate.getMonth() + 1;
      const year = photoDate.getFullYear();
      return `${dayOfWeek}, ${day} thg ${month} ${year}`;
    }
  };

  // Group photos by date and render
  const renderedItems = useMemo(() => {
    const out = [];
    let currentDateLabel = '';
    
    photos.forEach((p) => {
      const dateLabel = getDateLabel(p.date);
      
      if (dateLabel !== currentDateLabel) {
        out.push(
          <div key={`date-${p.date}-${out.length}`} className="date-divider">
            {dateLabel}
          </div>
        );
        currentDateLabel = dateLabel;
      }
      
      const photoIndex = photos.findIndex(photo => photo.id === p.id);
      out.push(
        <div key={p.id} className="photo-item" onClick={(e: any) => {
           if ((e.target as HTMLElement).closest('.photo-favorite')) return; // ignore favorite click
          if ((e.target as HTMLElement).closest('.photo-select')) return;
          setCurrentPhotoIndex(photoIndex);
          setZoomLevel(100);
        }}>
          {p.type === 'video' ? (
            <>
              <video
                src={p.url}
                muted
                loop
                preload="metadata"
                onMouseEnter={(e) => {
                  const video = e.currentTarget;
                  video.play().catch(() => {});
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget;
                  video.pause();
                  video.currentTime = 0;
                }}
                onLoadedMetadata={(ev) => {
                  const vid = ev.currentTarget as HTMLVideoElement;
                  if (!isNaN(vid.duration)) {
                    setVideoDurations((prev) => ({ ...prev, [p.id]: Math.floor(vid.duration) }));
                  }
                }}
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              />
              <div className="video-duration-overlay">
                {formatDuration(p.durationSec ?? videoDurations[p.id])}
              </div>
            </>
          ) : (
            <img src={p.thumbnail_url || p.url} alt={`Photo ${p.id}`} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/400/300?random=${p.id}`; }} />
          )}
          <div className="photo-info">
            <div className="photo-date">{p.date}</div>
            <button type="button" className={`photo-select${selectedIds.has(p.id) ? ' active' : ''}`} onClick={() => onToggleSelect(p.id)} aria-label="Toggle select">
              <i className="las la-check" />
            </button>
            <button type="button" className={`photo-favorite${favoriteIds.has(p.id) ? ' active' : ''}`} onClick={() => onToggleFavorite(p.id)} aria-label="Toggle favorite">
              <i className="las la-heart" />
            </button>
          </div>
        </div>
      );
    });
    return out;
  }, [photos, selectedIds, onToggleSelect, videoDurations]);
  // Xử lý xóa ảnh
  
    // Xử lý tải xuống ảnh
    const onDownloadSelected = useCallback(() => {
      if (selectedIds.size === 0) return;
      
      const ids = Array.from(selectedIds);
      
      // Download từng ảnh
      ids.forEach(id => {
        const link = document.createElement('a');
        link.href = `/photos/${id}/download`;
        link.download = '';
        link.click();
      });
    }, [selectedIds]);
   // Mở modal album và tải danh sách albums
    const handleOpenAlbumModal = useCallback(() => {
      setShowAlbumModal(true);
      setLoadingAlbums(true);
      
      fetch('/api/albums/user', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
        .then(async response => {
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi tải albums');
          }
          
          if (data.success) {
            setAlbums(data.albums || []);
          } else {
            throw new Error(data.message || 'Lỗi khi tải albums');
          }
        })
        .catch(error => {
          console.error('Load albums error:', error);
          alert(error.message || 'Lỗi khi tải danh sách albums!');
        })
        .finally(() => {
          setLoadingAlbums(false);
        });
    }, []);

  return (
    <>
      <Head title="Ảnh yêu thích" />
      
      <div className={`favourites-page${selectedIds.size > 0 ? ' has-selection' : ''}`}>
        {/* Header */}
        <header className="favourites-header">
          <div className="favourites-header-content">
            <Link href="/photos" className="back-button">
              <i className="las la-arrow-left" />
            </Link>
            
            <div className="search-container">
              <div className="search-box">
                <i className="las la-search search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Ảnh yêu thích"
                  readOnly
                />
              </div>
            </div>

            <button 
              className="close-button"
              onClick={() => window.location.href = '/photos'}
              aria-label="Đóng"
            >
              <i className="las la-times" />
            </button>
          </div>
        </header>

        <div className={`favourites-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
         {/* Selection Toolbar */}
         {selectedIds.size > 0 && (
           <div className="selection-toolbar">
             <div className="toolbar-left">
               <button className="toolbar-close" onClick={() => setSelectedIds(new Set())} aria-label="Close">
                 <i className="las la-times" />
               </button>
               <span className="selection-count">{selectedIds.size} đã chọn</span>
             </div>
              <div className="toolbar-actions">
                <button className="toolbar-btn" onClick={() => handleToggleFavoriteSelected()} title="Bỏ yêu thích">
                  <i className="las la-heart-broken" />
                </button>
                <div className="toolbar-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                  <button className="toolbar-btn" title="Tùy chọn khác" onClick={() => setShowOptionsMenu(m => !m)}>
                    <i className="las la-plus-circle" />
                  </button>
                  {showOptionsMenu && (
                    <div className="toolbar-dropdown" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50 }}>
                      <button className="dropdown-item" onClick={handleOpenAlbumModal} >
                          <i className="las la-book" />
                          <span className="left-sidebar-title">Album</span>
                      </button>
                      <button className="dropdown-item" onClick={() => alert('Album chia sẻ.')} >
                          <i className="las la-user-friends" />
                          <span className="left-sidebar-title">Album chia sẻ</span>
                      </button>
                      <button className="dropdown-item" onClick={() => alert('Tài liệu')} >
                          <i className="las la-file-alt" />
                          <span className="left-sidebar-title">Tài liệu</span>
                      </button>
                    </div>
                  )}
               </div>
               <button className="toolbar-btn" title="Chia sẻ">
                 <i className="fa-solid fa-share-nodes"></i>
               </button>
               <div className="toolbar-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                 <button className="toolbar-btn" title="Tùy chọn khác" onClick={() => setShowMoreMenu(m => !m)}>
                   <i className="fa-solid fa-ellipsis-vertical"></i>
                 </button>
                 {showMoreMenu && (
                   <div className="toolbar-dropdown" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50 }}>
                     <button className="dropdown-item" onClick={onDownloadSelected} >
                       <span className="left-sidebar-title">Tải xuống</span>
                    </button>
                     <button className="dropdown-item" onClick={() => alert('Sẽ thêm chỉnh sửa ngày & giờ.')} >
                       <span className="left-sidebar-title">Chỉnh sửa ngày & giờ</span>
                    </button>
                     <button className="dropdown-item" onClick={() => alert('Sẽ thêm chỉnh sửa vị trí.')} >
                       <span className="left-sidebar-title">Chỉnh sửa vị trí</span>
                    </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
         
         <div className="photo-grid" id="photoGrid">
            {photos.length === 0 ? (
              <div className="empty-state">
                <i className="las la-heart" style={{ fontSize: '4rem', color: '#ccc' }} />
                <p>Chưa có ảnh/video yêu thích nào</p>
              </div>
            ) : (
              renderedItems
            )}
          </div>
        </div>

         {/* Album Modal */}  
          {showAlbumModal && (
            <div className="album-modal-overlay" onClick={() => setShowAlbumModal(false)}>
              <div className="album-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="album-modal-header">
                  <h1>Thêm vào</h1>
                  <button className="album-modal-close" onClick={() => setShowAlbumModal(false)}>
                    <i className="las la-times" />
                  </button>
                </div>
                
                <button className="album-create-new-btn">
                  <i className="las la-plus-circle" />
                  <span>Album mới</span>
                </button>

                <div className="album-list">
                  {loadingAlbums ? (
                    <div className="album-loading">Đang tải...</div>
                  ) : albums.length === 0 ? (
                    <div className="album-empty">Bạn chưa có album nào</div>
                  ) : (
                    albums.map(album => (
                      <div key={album.id} className="album-item" onClick={() => alert(`Thêm vào album: ${album.title}`)}>
                        <div className="album-cover">
                          {album.cover_url ? (
                            <img src={album.cover_url} alt={album.title} />
                          ) : (
                            <div className="album-no-cover">
                              <i className="las la-images" />
                            </div>
                          )}
                        </div>
                        <div className="album-info">
                          <div className="album-title">{album.title}</div>
                          <div className="album-meta">
                            <span>{album.created_at}</span>
                            <span className="album-separator">•</span>
                            <span>{album.photos_count} mục</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Lightbox Modal - Completely outside for true fullscreen */}
        {currentPhotoIndex !== null && (
          <div className="lightbox-overlay">
            {/* Top Bar */}
            <div className="lightbox-topbar">
              <div className="lightbox-topbar-left">
                <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Quay lại">
                  <i className="las la-arrow-left" />
                </button>
                <div className="lightbox-counter">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </div>
              <div className="lightbox-topbar-right">
                <button className="lightbox-btn" title="Phóng to" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
                  <i className="las la-search-plus" />
                </button>
                <button className="lightbox-btn" title="Thu nhỏ" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}>
                  <i className="las la-search-minus" />
                </button>
                <span className="zoom-level">{zoomLevel}%</span>
                <button className="lightbox-btn" title="Thông tin">
                  <i className="las la-info-circle" />
                </button>
                <button className="lightbox-btn" title="Tải xuống">
                  <i className="las la-download" />
                </button>
                <button 
                  className={`lightbox-btn lightbox-btn-favorite${photos[currentPhotoIndex].is_favorite ? ' active' : ''}`} 
                  onClick={handleLightboxToggleFavorite}
                  title={photos[currentPhotoIndex].is_favorite ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  <i className={photos[currentPhotoIndex].is_favorite ? "las la-heart" : "lar la-heart"} />
                </button>
                <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Đóng">
                  <i className="las la-times" />
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            {currentPhotoIndex > 0 && (
              <button className="lightbox-nav lightbox-nav-prev" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex - 1); setZoomLevel(100); }}>
                <i className="las la-angle-left" />
              </button>
            )}
            {currentPhotoIndex < photos.length - 1 && (
              <button className="lightbox-nav lightbox-nav-next" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex + 1); setZoomLevel(100); }}>
                <i className="las la-angle-right" />
              </button>
            )}

            {/* Image/Video Container */}
            <div className="lightbox-content">
              {photos[currentPhotoIndex].type === 'video' ? (
                <video
                  src={photos[currentPhotoIndex].url}
                  controls
                  autoPlay
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease'
                  }}
                />
              ) : (
                <img 
                  src={photos[currentPhotoIndex].url} 
                  alt={`Photo ${photos[currentPhotoIndex].id}`}
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease'
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
