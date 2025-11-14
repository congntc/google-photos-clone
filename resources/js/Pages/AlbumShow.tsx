import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import '../assets/css/page-google-photos.css';
import '../assets/css/page-google-photos-album-show.css';

interface AlbumShowProps {
  album: {
    id: number;
    title: string;
    description?: string;
    photos_count?: number;
  };
  photos: { id: number; url: string; thumbnail_url?: string; date?: string; title?: string; type?: 'image' | 'video'; mime_type?: string }[];
}
interface AlbumItem {
  id: number;
  title: string;
  description?: string;
  photos_count: number;
  cover_url?: string;
  created_at: string;
}

export default function AlbumShow({ album, photos }: AlbumShowProps) {
  // Reset body overflow when component mounts (fix scrollbar issue when navigating from other pages)
  useEffect(() => {
    // Add class to body to enable CSS override
    document.body.classList.add('album-show-page-body');
    
    // Force reset overflow on both html and body
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      // Remove class on unmount
      document.body.classList.remove('album-show-page-body');
    };
  }, []);

  // Local state so uploads append immediately on client
  const [photoItems, setPhotoItems] = useState(photos);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  const [uploading, setUploading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);

  const formatDuration = useCallback((seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const onOpenPhoto = useCallback((idx: number) => {
    setCurrentPhotoIndex(idx);
    setZoomLevel(100);
  }, []);

  // Optional: prepare for future uploads
  const onUploadClick = useCallback(() => uploadRef.current?.click(), []);
  const onUploadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }

    // Gửi request với fetch để nhận JSON response
    fetch(`/albums/${album.id}/photos`, {
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
        
        if (data.success && data.photos) {
          // Thêm photos mới vào cuối danh sách
          setPhotoItems(prevPhotos => [...prevPhotos, ...data.photos]);
        }
        
        setUploading(false);
        e.target.value = '';
      })
      .catch(error => {
        setUploading(false);
        console.error('Upload failed:', error);
        alert(error.message || 'Không thể tải lên ảnh/video. Vui lòng thử lại.');
        e.target.value = '';
      });
  }, [album.id]);

  const onToggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const onDownload = useCallback(() => {
    if (currentPhotoIndex === null) return;
    const photo = photoItems[currentPhotoIndex];
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title || `photo-${photo.id}`}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentPhotoIndex, photoItems]);

  //xóa ảnh khỏi album
  const onDeleteFromAlbum = useCallback(() => {
    if (currentPhotoIndex === null) return;
    const photo = photoItems[currentPhotoIndex];
    
    // if (!confirm('Bạn có chắc muốn xóa ảnh/video này khỏi album?')) {
    //   return;
    // }

    fetch(`/albums/${album.id}/photos/${photo.id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Accept': 'application/json',
      },
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
        
        if (data.success) {
          // Xóa ảnh khỏi state
          setPhotoItems(prevPhotos => prevPhotos.filter(p => p.id !== photo.id));
          
          // Đóng lightbox
          setCurrentPhotoIndex(null);
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert(error.message || 'Không thể xóa ảnh/video. Vui lòng thử lại.');
      });
  }, [currentPhotoIndex, photoItems, album.id]);

  const renderedPhotos = useMemo(() => (
    <div className="photo-grid">
      {photoItems.map((p, photoIndex) => {
        const isVideo = p.type === 'video';
        return (
          <div
            key={p.id}
            className="photo-item"
            onClick={(e: any) => {
              if ((e.target as HTMLElement).closest('.photo-favorite')) return;
              if ((e.target as HTMLElement).closest('.photo-select')) return;
              setCurrentPhotoIndex(photoIndex);
              setZoomLevel(100);
            }}
          >
            {isVideo ? (
              <>
                <video
                  src={p.url}
                  muted
                  loop
                  preload="metadata"
                  playsInline
                  onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}); }}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  onLoadedMetadata={(ev) => {
                    const vid = ev.currentTarget as HTMLVideoElement;
                    if (!isNaN(vid.duration)) {
                      setVideoDurations((prev) => ({ ...prev, [p.id]: Math.floor(vid.duration) }));
                    }
                  }}
                />
                <div className="video-duration-overlay">
                  {formatDuration((p as any).durationSec ?? videoDurations[p.id])}
                </div>
              </>
            ) : (
              <img
                src={p.thumbnail_url || p.url}
                alt={p.title || `Photo ${p.id}`}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/400/300?random=${p.id}`; }}
              />
            )}

            <div className="photo-info">
              <button
                type="button"
                className={`photo-select${selectedIds.has(p.id) ? ' active' : ''}`}
                onClick={() => onToggleSelect(p.id)}
                aria-label="Toggle select"
              >
                <i className="las la-check" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  ), [photoItems, selectedIds, videoDurations, formatDuration]);

  const onClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const onDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    // if (!confirm(`Xóa ${selectedIds.size} ảnh/video khỏi album?`)) return;
    
    const photo_ids = Array.from(selectedIds);
    
    fetch(`/albums/${album.id}/photos/remove-batch`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ photo_ids }),
    })
      .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi xóa');
        }
        
        if (data.success) {
          // Xóa các ảnh khỏi state
          const deletedIds = new Set(data.deleted_ids || photo_ids);
          setPhotoItems(prevPhotos => prevPhotos.filter(p => !deletedIds.has(p.id)));
          
          // Clear selection
          setSelectedIds(new Set());
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert(error.message || 'Không thể xóa. Vui lòng thử lại.');
      });
  }, [selectedIds, album.id]);

  const onDownloadSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    Array.from(selectedIds).forEach(id => {
      const p = photoItems.find(ph => ph.id === id);
      if (!p) return;
      const a = document.createElement('a');
      a.href = p.url;
      a.download = p.title || `photo-${p.id}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }, [selectedIds, photoItems]);

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
  <div className={`albumshow-container standalone${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
        {selectedIds.size > 0 && (
          <div
            className="selection-toolbar"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1200,
              background: '#1a73e8'
            }}
          >
            <div className="toolbar-left">
              <button className="toolbar-close" onClick={onClearSelection} aria-label="Bỏ chọn">
                <i className="las la-times" />
              </button>
              <span className="selection-count">Đã chọn {selectedIds.size}</span>
            </div>
            <div className="toolbar-actions">
                <button className="toolbar-btn" title="Xóa" onClick={onDeleteSelected}>
                  <i className="las la-trash" />
                </button>
                <button className="toolbar-btn" title="Thêm vào yêu thích">
                  <i className="las la-heart" />
                </button>
                <div className="toolbar-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                  <button className="toolbar-btn" title="Tùy chọn khác" onClick={() => setShowOptionsMenu(m => !m)}>
                    <i className="las la-plus-circle" />
                  </button>
                  {showOptionsMenu && (
                    <div className="toolbar-dropdown" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50 }}>
                      <button className="dropdown-item" onClick={handleOpenAlbumModal}>
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


        {/* Standalone Top Header */}
        <div className="albumshow-topbar">
          <div className="topbar-left">
            <button className="topbar-btn" title="Quay lại album" onClick={() => { window.location.href = '/albums'; }}>
              <i className="las la-arrow-left" />
            </button>
            <span className="topbar-title">{album.title}</span>
          </div>
          <div className="topbar-right">
            <button
              className="topbar-btn"
              title="Thêm ảnh vào album"
              onClick={() => { window.location.href = `/albums/${album.id}/select`; }}
            >
              <i className="las la-plus" />
            </button>
            <button className="topbar-btn" title="Chia sẻ"><i className="fa-solid fa-share-nodes"></i></button>
            <button className="topbar-btn" title="Tùy chọn khác"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          </div>
        </div>

        {/* Album Header with Cover and Info */}
        <div className="albumshow-info-section">
          <div className="albumshow-cover-card">
            <img
              src={photoItems[0]?.thumbnail_url || photoItems[0]?.url || `https://picsum.photos/800/600?random=${album.id}`}
              alt={album.title}
            />
            <button className="cover-highlight-btn" type="button">
              <i className="las la-images"></i>
              <span>Xem ảnh nổi bật</span>
            </button>
          </div>
          <div className="albumshow-details">
            <h1 className="album-main-title">{album.title}</h1>
            {album.photos_count !== undefined && (
              <div className="album-date">{album.photos_count} mục</div>
            )}
            {album.description && (
              <div className="album-date">{album.description}</div>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        {renderedPhotos}
        
        {/* Hidden input removed: selection now handled via separate page */}
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

      {currentPhotoIndex !== null && (
        <div className="lightbox-overlay">
          <div className="lightbox-topbar">
            <div className="lightbox-topbar-left">
              <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Quay lại">
                <i className="las la-arrow-left" />
              </button>
              <div className="lightbox-counter">{currentPhotoIndex + 1} / {photoItems.length}</div>
            </div>
            <div className="lightbox-topbar-right">
              <button className="lightbox-btn" title="Phóng to" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}><i className="las la-search-plus" /></button>
              <button className="lightbox-btn" title="Thu nhỏ" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}><i className="las la-search-minus" /></button>
              <span className="zoom-level">{zoomLevel}%</span>
               <button className="lightbox-btn" title="Tải xuống" onClick={onDownload}>
                <i className="las la-download" />
              </button>
              <button className="lightbox-btn lightbox-btn-favorite" title="Yêu thích">
                <i className="las la-heart" />
              </button>
              <button className="lightbox-btn lightbox-btn-delete" title="Xóa" onClick={onDeleteFromAlbum}>
                <i className="las la-trash" />
              </button>
              <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Đóng">
                <i className="las la-times" />
              </button>
            </div>
          </div>
          <div className="lightbox-content">
            {photoItems[currentPhotoIndex].type === 'video' ? (
              <video
                src={photoItems[currentPhotoIndex].url}
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
                src={photoItems[currentPhotoIndex].url}
                alt={photoItems[currentPhotoIndex].title || ''}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transition: 'transform .2s ease'
                }}
              />
            )}
          </div>
          {currentPhotoIndex > 0 && (
            <button className="lightbox-nav lightbox-nav-prev" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex - 1); setZoomLevel(100); }}>
              <i className="las la-angle-left" />
            </button>
          )}
          {currentPhotoIndex < photoItems.length - 1 && (
            <button className="lightbox-nav lightbox-nav-next" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex + 1); setZoomLevel(100); }}>
              <i className="las la-angle-right" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
