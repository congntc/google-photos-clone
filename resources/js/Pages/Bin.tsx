import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos.css';
import '../assets/css/page-google-photos-bin.css';

interface PhotoItem {
  id: number;
  url: string;
  thumbnail_url?: string;
  stored_filename: string;
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
  deleted_at: string;
  days_remaining: number;
  is_expiring_soon: boolean;
  is_expired: boolean;
  expiration_message: string;
}

interface BinPageProps extends PageProps {
  // Props sẽ được truyền từ controller (nếu cần)
}

export default function Bin({ auth }: BinPageProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set<number>());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Load photos from bin
  useEffect(() => {
    loadBinPhotos();
  }, []);

  const loadBinPhotos = useCallback(() => {
    setLoading(true);
    fetch('/api/photos/bin', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi tải');
        }
        
        if (data.success) {
          setPhotos(data.photos || []);
        } else {
          throw new Error(data.message || 'Lỗi khi tải');
        }
      })
      .catch(error => {
        console.error('Load error:', error);
        // alert(error.message || 'Lỗi khi tải danh sách thùng rác!');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const onToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Khôi phục ảnh
  const handleRestore = useCallback((photoId?: number) => {
    const ids = photoId ? [photoId] : Array.from(selectedIds);
    if (ids.length === 0) return;
    
    fetch('/photos/restore-batch', {
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
          throw new Error(data.message || 'Lỗi khi khôi phục');
        }
        
        if (data.success) {
          // Xóa khỏi danh sách
          setPhotos(prevPhotos => prevPhotos.filter(p => !ids.includes(p.id)));
          setSelectedIds(new Set());
          // alert(data.message);
        } else {
          throw new Error(data.message || 'Lỗi khi khôi phục');
        }
      })
      .catch(error => {
        console.error('Restore error:', error);
        alert(error.message || 'Lỗi khi khôi phục. Vui lòng thử lại!');
      });
  }, [selectedIds]);

  // Xóa vĩnh viễn
  const handleForceDelete = useCallback((photoId?: number) => {
    const ids = photoId ? [photoId] : Array.from(selectedIds);
    if (ids.length === 0) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${ids.length} ảnh/video?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    fetch('/photos/force-delete-batch', {
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
          // Xóa khỏi danh sách
          setPhotos(prevPhotos => prevPhotos.filter(p => !ids.includes(p.id)));
          setSelectedIds(new Set());
          // alert(data.message);
        } else {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert(error.message || 'Lỗi khi xóa. Vui lòng thử lại!');
      });
  }, [selectedIds]);

  // Dọn sạch thùng rác (xóa tất cả)
  const handleEmptyBin = useCallback(() => {
    if (photos.length === 0) return;
    
    if (!confirm(`Bạn có chắc chắn muốn dọn sạch thùng rác?\n\nTất cả ${photos.length} ảnh/video sẽ bị xóa vĩnh viễn!\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    const ids = photos.map(p => p.id);
    
    fetch('/photos/force-delete-batch', {
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
          setPhotos([]);
          setSelectedIds(new Set());
          // alert(data.message);
        } else {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
      })
      .catch(error => {
        console.error('Empty bin error:', error);
        alert(error.message || 'Lỗi khi dọn sạch thùng rác!');
      });
  }, [photos]);

  // Helper to format date headers
  const getDateLabel = (dateStr: string) => {
    const photoDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    photoDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
  };

  // Group photos by date and render
  const renderedItems = useMemo(() => {
    return photos.map((p) => {
      const photoIndex = photos.findIndex(photo => photo.id === p.id);
      return (
        <div 
          key={p.id} 
          className="photo-item bin-photo-item" 
          style={{ position: 'relative' }}
          onClick={(e: any) => {
            if ((e.target as HTMLElement).closest('.photo-select')) return;
            setCurrentPhotoIndex(photoIndex);
            setZoomLevel(100);
          }}
        >
          {p.type === 'video' ? (
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
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              />
          ) : (
             <img src={p.thumbnail_url || p.url} alt={`Photo ${p.id}`} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/400/300?random=${p.id}`; }} />
          )}
          
          
          {/* Badge xóa vĩnh viễn */}
          <div className={`expiration-badge ${p.is_expiring_soon ? 'expiring-soon' : ''} ${p.is_expired ? 'expired' : ''}`}>
            <i className="bi bi-clock"></i>
            <span>{p.expiration_message}</span>
          </div>

          {/* Checkbox */}
          <div className="photo-info">
            <button 
              type="button" 
              className={`photo-select${selectedIds.has(p.id) ? ' active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(p.id);
              }} 
              aria-label="Toggle select"
            >
              <i className="las la-check" />
            </button>
          </div>
        </div>
      );
    });
  }, [photos, selectedIds, onToggleSelect]);

  return (
    <>
      <AppLayout>
        {/* <div className={`bin-page-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}> */}
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
              <button className="toolbar-btn toolbar-btn-restore" onClick={() => handleRestore()} title="Khôi phục">
                <i className="las la-undo" />
                <span>Khôi phục</span>
              </button>
              <button className="toolbar-btn toolbar-btn-delete" onClick={() => handleForceDelete()} title="Xóa vĩnh viễn">
                <i className="las la-trash" />
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        )}

        <div className="card-body">
          <div className="trash-content">
            <div className="trash-header">
              <h1 className="page-header">Thùng rác</h1>
              {photos.length > 0 && (
                <button className="empty-trash-btn" onClick={handleEmptyBin}>
                  <i className="las la-trash-alt"></i>
                  <span>Dọn sạch thùng rác</span>
                </button>
              )}
            </div>

            <p className="trash-info-banner">
              <i className="las la-info-circle"></i>
              Các mục trong Thùng rác sẽ bị xóa vĩnh viễn sau 60 ngày.
            </p>
          </div>

          <div className="photo-container">
            {loading ? (
              <div className="loading-state">
                <i className="las la-spinner la-spin" style={{ fontSize: '3rem' }}></i>
                <p>Đang tải...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="empty-state">
                <i className="las la-trash-alt" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <p>Thùng rác trống</p>
              </div>
            ) : (
              <div className="photo-grid">
                {renderedItems}
              </div>
            )}
          </div>
        </div>
      {/* </div> */}
      </AppLayout>

      {/* Lightbox Modal - Fullscreen - Bên ngoài AppLayout */}
      {currentPhotoIndex !== null && (
        <div className="lightbox-overlay-fullscreen">
          <div className="lightbox-topbar">
            <div className="lightbox-topbar-left">
              <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Đóng">
                <i className="las la-times" />
              </button>
              <div className="lightbox-counter">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
              
              {/* Expiration badge */}
              <div className={`expiration-badge-lightbox ${photos[currentPhotoIndex].is_expiring_soon ? 'expiring-soon' : ''} ${photos[currentPhotoIndex].is_expired ? 'expired' : ''}`}>
                <i className="bi bi-clock"></i>
                <span>{photos[currentPhotoIndex].expiration_message}</span>
              </div>
            </div>
            
            <div className="lightbox-topbar-right">
              <button className="lightbox-btn" onClick={() => {
                const photoId = photos[currentPhotoIndex].id;
                handleRestore(photoId);
                setCurrentPhotoIndex(null);
              }} title="Khôi phục">
                <i className="las la-undo" />
                
              </button>

              <button className="lightbox-btn" onClick={() => {
                const photoId = photos[currentPhotoIndex].id;
                handleForceDelete(photoId);
                setCurrentPhotoIndex(null);
              }} title="Xóa vĩnh viễn">
                <i className="las la-trash" />
              
              </button>
            </div>
          </div>

          {/* Navigation buttons */}
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

          <div className="lightbox-content">
            {photos[currentPhotoIndex].type === 'video' ? (
              <video
                src={photos[currentPhotoIndex].url}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <img 
                src={photos[currentPhotoIndex].url} 
                alt={`Photo ${photos[currentPhotoIndex].id}`}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

