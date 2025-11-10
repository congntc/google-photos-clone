import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos.css';

interface AlbumItem {
  id: number;
  title: string;
  description?: string;
  photos_count: number;
  cover_url?: string;
  created_at: string;
}

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
  durationSec?: number; // for videos, in seconds
}

interface PhotosPageProps extends PageProps {
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

export default function PageGooglePhotos({ photos: initialPhotos = [], auth }: PhotosPageProps) {
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
  
  // Debug: log auth status
  console.log('Auth user:', auth?.user);
  console.log('Photos count:', photos.length);

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

  // Xử lý thêm/bỏ yêu thích
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
          // Cập nhật state photos
          setPhotos(prevPhotos => 
            prevPhotos.map(p => 
              ids.includes(p.id) ? { ...p, is_favorite: isFavorite } : p
            )
          );
          
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
          
          // Xóa selection sau khi thêm vào yêu thích
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
    // Kiểm tra nếu tất cả đã là favorite thì bỏ, ngược lại thì thêm
    const allFavorite = ids.every(id => favoriteIds.has(id));
    handleToggleFavorite(ids, !allFavorite);
  }, [selectedIds, favoriteIds, handleToggleFavorite]);

  // Xử lý toggle favorite từ lightbox
  const handleLightboxToggleFavorite = useCallback(() => {
    if (currentPhotoIndex === null) return;
    
    const photo = photos[currentPhotoIndex];
    handleToggleFavorite([photo.id], !photo.is_favorite);
  }, [currentPhotoIndex, photos, handleToggleFavorite]);

 

  // Xử lý xóa ảnh
  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    // if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} ảnh/video?`)) {
    //   return;
    // }

    const ids = Array.from(selectedIds);
    
    fetch('/photos/delete-batch', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ids }),
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
        
        if (data.success) {
          // Xóa ảnh khỏi state
          setPhotos(prevPhotos => prevPhotos.filter(p => !selectedIds.has(p.id)));
          setSelectedIds(new Set());
          alert(`Đã chuyển ${ids.length} ảnh/video vào thùng rác. Bạn có 60 ngày để khôi phục.`);
        } else {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert(error.message || 'Lỗi khi xóa. Vui lòng thử lại!');
      });
  }, [selectedIds]);

   // Xử lý xóa ảnh/video từ lightbox
  const handleLightboxDelete = useCallback(() => {
    if (currentPhotoIndex === null) return;
    
    const photo = photos[currentPhotoIndex];
    
    // if (!confirm(`Bạn có chắc chắn muốn xóa "${photo.original_filename}"?`)) {
    //   return;
    // }

    fetch('/photos/delete-batch', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ids: [photo.id] }),
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
        
        if (data.success) {
          // Xóa ảnh khỏi state
          setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photo.id));
          
          // Đóng lightbox và quay về trang Photos
          setCurrentPhotoIndex(null);
          
          // Hiển thị thông báo
          alert('Đã chuyển ảnh/video vào thùng rác. Bạn có 60 ngày để khôi phục.');
        } else {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert(error.message || 'Lỗi khi xóa. Vui lòng thử lại!');
      });
  }, [currentPhotoIndex, photos]); 

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

  // Xử lý tải xuống ảnh/video từ lightbox
  const handleLightboxDownload = useCallback(() => {
    if (currentPhotoIndex === null) return;
    
    const photo = photos[currentPhotoIndex];
    const link = document.createElement('a');
    link.href = `/photos/${photo.id}/download`;
    link.download = '';
    link.click();
  }, [currentPhotoIndex, photos]);

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



 // Tải ảnh lên từ máy tính
  const onUploadClick = useCallback(() => {
    // Kiểm tra user đã đăng nhập chưa
    if (!auth?.user) {
      alert('Vui lòng đăng nhập để tải lên ảnh/video.');
      window.location.href = '/login';
      return;
    }
    uploadRef.current?.click();
  }, [auth]);

  // Xử lý khi chọn file để tải lên
  const onUploadChange = useCallback((e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    // Tạo FormData để upload lên server
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files[]', file);
    });

    // Gửi request upload
    fetch('/photos/upload', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Accept': 'application/json',
      },
      body: formData,
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi tải lên');
        }
        
        if (data.success) {
          // Cập nhật giao diện bằng cách thêm photos mới vào đầu danh sách
          if (data.photos && data.photos.length > 0) {
            setPhotos(prevPhotos => [...data.photos, ...prevPhotos]);
          }
          
          // Hiển thị thông báo thành công (tùy chọn)
          // alert(data.message);
        } else {
          throw new Error(data.message || 'Lỗi khi tải lên');
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        alert(error.message || 'Lỗi khi tải lên. Vui lòng thử lại!');
      });

    e.target.value = '';
  }, []);

  // Helper to format date headers like Google Photos
  const getDateLabel = (dateStr: string) => {
    const photoDate = new Date(dateStr);
    const today = new Date(); // Lấy ngày hiện tại thực
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare dates only
    photoDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (photoDate.getTime() === today.getTime()) {
      return 'Hôm nay';
    } else if (photoDate.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    } else {
      // Format: "Th 6, 31 thg 10" (like Google Photos Vietnamese)
      const dayOfWeek = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'][photoDate.getDay()];
      const day = photoDate.getDate();
      const month = photoDate.getMonth() + 1;
      const year = photoDate.getFullYear();
      return `${dayOfWeek}, ${day} thg ${month} ${year}`;
    }
  };

  // Group photos by date and render with proper headers
  const renderedItems = useMemo(() => {
    const out = [];
    let currentDateLabel = '';
    
    photos.forEach((p) => {
      const dateLabel = getDateLabel(p.date);
      
      // Add date header if it's a new date
      if (dateLabel !== currentDateLabel) {
        out.push(
          <div key={`date-${p.date}-${out.length}`} className="date-divider">
            {dateLabel}
          </div>
        );
        currentDateLabel = dateLabel;
      }
      
      // Add photo/video item
      const photoIndex = photos.findIndex(photo => photo.id === p.id);
      out.push(
        <div key={p.id} className="photo-item" onClick={(e: any) => {
          if ((e.target as HTMLElement).closest('.photo-favorite')) return; // ignore favorite click
          if ((e.target as HTMLElement).closest('.photo-select')) return; // ignore select click
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
          </div>
        </div>
      );
    });
    return out;
  }, [photos, favoriteIds, selectedIds, onToggleFavorite, onToggleSelect, videoDurations]);

  return (
    <>
      <AppLayout>
        <div className={`photos-page-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
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
               <button className="toolbar-btn" onClick={handleDelete} title="Xóa">
                 <i className="las la-trash" />
               </button>
               <button className="toolbar-btn" onClick={handleToggleFavoriteSelected} title="Thêm vào yêu thích">
                 <i className="las la-heart" />
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
                     <button className="dropdown-item" onClick={() => alert('Ảnh không nằm trong thùng rác.')} >
                       <span className="left-sidebar-title">Chuyển khỏi thùng rác</span>
                    </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
         
         <div className="photo-grid" id="photoGrid">
            {renderedItems}
          </div>

          {/* Floating Action Button + Hidden Input */}
          <button className="fab" title="Upload photos" onClick={onUploadClick}><i className="las la-plus" /></button>
          <input ref={uploadRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
        </div>
      </AppLayout>

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

      {/* Lightbox Modal - Completely outside AppLayout for true fullscreen */}
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
              <button className="lightbox-btn" onClick={handleLightboxDownload} title="Tải xuống">
                <i className="las la-download" />
              </button>
              <button 
                className={`lightbox-btn lightbox-btn-favorite${photos[currentPhotoIndex].is_favorite ? ' active' : ''}`} 
                onClick={handleLightboxToggleFavorite} 
                title={photos[currentPhotoIndex].is_favorite ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <i className={photos[currentPhotoIndex].is_favorite ? "las la-heart" : "lar la-heart"} />
              </button>
              <button className="lightbox-btn lightbox-btn-delete" onClick={handleLightboxDelete} title="Xóa">
                <i className="las la-trash" />
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
    </>
  );
}
