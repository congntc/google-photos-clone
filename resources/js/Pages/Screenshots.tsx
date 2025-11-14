import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import '../assets/css/page-google-photos.css';
import '../assets/css/screenshots-page.css';

// Import sample screenshot images
import img01 from '../assets/images/page-img/01.jpg';
import img02 from '../assets/images/page-img/02.jpg';
import img03 from '../assets/images/page-img/03.jpg';
import img07 from '../assets/images/page-img/07.jpg';
import img08 from '../assets/images/page-img/08.jpg';

interface ScreenshotItem {
  id: number;
  url: string;
  date: string;
  month: string;
  year: string;
}

interface AlbumItem {
  id: number;
  title: string;
  description?: string;
  photos_count: number;
  cover_url?: string;
  created_at: string;
}

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

export default function Screenshots() {
  // Load icon fonts on mount
  useEffect(() => {
    ensureIconCss();
  }, []);

  // Reset body overflow when component mounts (fix scrollbar issue when navigating from other pages)
  useEffect(() => {
    // Add class to body to enable CSS override
    document.body.classList.add('screenshots-page-body');
    
    // Force reset overflow on both html and body
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      // Remove class on unmount
      document.body.classList.remove('screenshots-page-body');
    };
  }, []);

  // Screenshots with realistic dates
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([
    // Hôm nay (7/11/2025)
    { id: 1, url: img01, date: '2025-11-07', month: 'November 2025', year: '2025' },
    { id: 2, url: img02, date: '2025-11-07', month: 'November 2025', year: '2025' },
    
    // Hôm qua (6/11/2025)
    { id: 3, url: img03, date: '2025-11-06', month: 'November 2025', year: '2025' },
    
    // Thứ Ba (5/11/2025)
    { id: 4, url: img07, date: '2025-11-05', month: 'November 2025', year: '2025' },
    { id: 5, url: img08, date: '2025-11-04', month: 'November 2025', year: '2025' },
  ]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const uploadRef = useRef(null);
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

  const onUploadClick = useCallback(() => uploadRef.current?.click(), []);

  const onUploadChange = useCallback((e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    const now = new Date();
    const year = String(now.getFullYear());
    const monthName = now.toLocaleString('en-US', { month: 'long' }) + ' ' + year;
    const dateStr = now.toISOString().slice(0, 10);

    const newScreenshots = files.map((file: File, idx: number) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      date: dateStr,
      month: monthName,
      year,
    }));

    setScreenshots((prev) => [...newScreenshots, ...prev]);
    e.target.value = '';
  }, []);

  // Helper to format date headers
  const getDateLabel = (dateStr) => {
    const photoDate = new Date(dateStr);
    const today = new Date('2025-11-07');
    const yesterday = new Date('2025-11-06');
    
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
      return `${dayOfWeek}, ${day} thg ${month}`;
    }
  };

  // Group screenshots by date and render
  const renderedItems = useMemo(() => {
    const out = [];
    let currentDateLabel = '';
    
    screenshots.forEach((s) => {
      const dateLabel = getDateLabel(s.date);
      
      if (dateLabel !== currentDateLabel) {
        out.push(
          <div key={`date-${s.date}-${out.length}`} className="date-divider">
            {dateLabel}
          </div>
        );
        currentDateLabel = dateLabel;
      }
      
      const screenshotIndex = screenshots.findIndex(screenshot => screenshot.id === s.id);
      out.push(
        <div key={s.id} className="photo-item" onClick={(e: any) => {
          if ((e.target as HTMLElement).closest('.photo-favorite')) return;
          if ((e.target as HTMLElement).closest('.photo-select')) return;
          setCurrentPhotoIndex(screenshotIndex);
          setZoomLevel(100);
        }}>
          <img src={s.url} alt={`Screenshot ${s.id}`} loading="lazy" onError={(e) => { e.currentTarget.src = `https://picsum.photos/400/300?random=${s.id}`; }} />
          <div className="photo-info">
            <div className="photo-date">{s.date}</div>
            <button type="button" className={`photo-select${selectedIds.has(s.id) ? ' active' : ''}`} onClick={() => onToggleSelect(s.id)} aria-label="Toggle select">
              <i className="las la-check" />
            </button>
            <button type="button" className={`photo-favorite${favoriteIds.has(s.id) ? ' active' : ''}`} onClick={() => onToggleFavorite(s.id)} aria-label="Toggle favorite">
              <i className="las la-heart" />
            </button>
          </div>
        </div>
      );
    });
    return out;
  }, [screenshots, favoriteIds, selectedIds, onToggleFavorite, onToggleSelect]);

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
      <Head title="Ảnh chụp màn hình" />
      
      <div className={`screenshots-page${selectedIds.size > 0 ? ' has-selection' : ''}`}>
        {/* Header */}
        <header className="screenshots-header">
        <div className="screenshots-header-content">
             <Link href="/photos" className="back-button">
              <i className="las la-arrow-left" />
            </Link>
            
            <div className="header-info">
              <h1 className="page-title">Ảnh chụp màn hình và bản ghi hình</h1>
              <span className="album-badge">Album tự động</span>
            </div>
            
          <div className="header-actions">
            <label className="auto-archive-toggle">
              <input 
                type="checkbox" 
                checked={selectedIds.size > 0} 
                onChange={() => {}} 
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Lưu trữ sau 30 ngày</span>
            </label>
          </div>
        </div>
      </header>

      <div className={`screenshots-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
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
          <button className="fab" title="Upload screenshots" onClick={onUploadClick}><i className="las la-plus" /></button>
          <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
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
                {currentPhotoIndex + 1} / {screenshots.length}
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
          {currentPhotoIndex < screenshots.length - 1 && (
            <button className="lightbox-nav lightbox-nav-next" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex + 1); setZoomLevel(100); }}>
              <i className="las la-angle-right" />
            </button>
          )}

          {/* Image Container */}
          <div className="lightbox-content">
            <img 
              src={screenshots[currentPhotoIndex].url} 
              alt={`Screenshot ${screenshots[currentPhotoIndex].id}`}
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'transform 0.2s ease'
              }}
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
