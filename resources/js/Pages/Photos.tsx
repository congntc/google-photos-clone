import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos.css';

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

  const onUploadClick = useCallback(() => {
    // Kiểm tra user đã đăng nhập chưa
    if (!auth?.user) {
      alert('Vui lòng đăng nhập để tải lên ảnh/video.');
      window.location.href = '/login';
      return;
    }
    uploadRef.current?.click();
  }, [auth]);

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
          // Reload trang để lấy dữ liệu mới từ server
          window.location.reload();
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
      return `${dayOfWeek}, ${day} thg ${month}`;
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
               <button className="toolbar-btn" title="Xóa">
                 <i className="las la-trash" />
                 {/* <span>Xóa</span> */}
               </button>
               <button className="toolbar-btn" title="Thêm vào album">
                 <i className="las la-folder-plus" />
                 {/* <span>Thêm vào album</span> */}
               </button>
                <button className="toolbar-btn" title="Thêm vào yêu thích">
                 <i className="las la-heart" />
                 {/* <span>Thêm vào yêu thích</span> */}
               </button>
               <button className="toolbar-btn" title="Tạo album mới">
                 <i className="las la-plus-circle" />
                 {/* <span>Tạo album mới</span> */}
               </button>
               <button className="toolbar-btn" title="Chia sẻ">
                 <i className="las la-share-alt" />
                 <span>Chia sẻ</span>
               </button>
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
              <button className="lightbox-btn" title="Tải xuống">
                <i className="las la-download" />
              </button>
              <button className="lightbox-btn lightbox-btn-favorite" title="Yêu thích">
                <i className="las la-heart" />
              </button>
              <button className="lightbox-btn lightbox-btn-delete" title="Xóa">
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
