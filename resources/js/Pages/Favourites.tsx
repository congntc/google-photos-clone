import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import '../assets/css/page-google-photos.css';
import '../assets/css/favourites-page.css';

// Import sample images
import img01 from '../assets/images/page-img/01.jpg';
import img02 from '../assets/images/page-img/02.jpg';
import img03 from '../assets/images/page-img/03.jpg';
import img07 from '../assets/images/page-img/07.jpg';
import img08 from '../assets/images/page-img/08.jpg';

interface FavouriteItem {
  id: number;
  url: string;
  date: string;
  month: string;
  year: string;
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

export default function Favourites() {
  // Load icon fonts on mount
  useEffect(() => {
    ensureIconCss();
  }, []);
  // Favourites with realistic dates
  const [favourites, setFavourites] = useState<FavouriteItem[]>([
    // Thứ 2, 6 tháng 10
    { id: 1, url: img01, date: '2025-10-06', month: 'October 2025', year: '2025' },
    { id: 2, url: img02, date: '2025-10-06', month: 'October 2025', year: '2025' },
    { id: 3, url: img03, date: '2025-10-06', month: 'October 2025', year: '2025' },
  ]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const uploadRef = useRef(null);

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

    const newFavourites = files.map((file: File, idx: number) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      date: dateStr,
      month: monthName,
      year,
    }));

    setFavourites((prev) => [...newFavourites, ...prev]);
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

  // Group favourites by date and render
  const renderedItems = useMemo(() => {
    const out = [];
    let currentDateLabel = '';
    
    favourites.forEach((s) => {
      const dateLabel = getDateLabel(s.date);
      
      if (dateLabel !== currentDateLabel) {
        out.push(
          <div key={`date-${s.date}-${out.length}`} className="date-divider">
            {dateLabel}
          </div>
        );
        currentDateLabel = dateLabel;
      }
      
      const favouriteIndex = favourites.findIndex(favourite => favourite.id === s.id);
      out.push(
        <div key={s.id} className="photo-item" onClick={(e: any) => {
          if ((e.target as HTMLElement).closest('.photo-favorite')) return;
          if ((e.target as HTMLElement).closest('.photo-select')) return;
          setCurrentPhotoIndex(favouriteIndex);
          setZoomLevel(100);
        }}>
          <img src={s.url} alt={`favourite ${s.id}`} loading="lazy" onError={(e) => { e.currentTarget.src = `https://picsum.photos/400/300?random=${s.id}`; }} />
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
  }, [favourites, favoriteIds, selectedIds, onToggleFavorite, onToggleSelect]);

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="close-button"
              onClick={() => setSearchQuery('')}
              aria-label="Đóng tìm kiếm"
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
               <button className="toolbar-btn" title="Xóa">
                 <i className="las la-trash" />
                 <span>Xóa</span>
               </button>
               <button className="toolbar-btn" title="Thêm vào album">
                 <i className="las la-folder-plus" />
                 <span>Thêm vào album</span>
               </button>
               <button className="toolbar-btn" title="Tạo album mới">
                 <i className="las la-plus-circle" />
                 <span>Tạo album mới</span>
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
          <button className="fab" title="Upload favourites" onClick={onUploadClick}><i className="las la-plus" /></button>
          <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
        </div>

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
                  {currentPhotoIndex + 1} / {favourites.length}
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
            {currentPhotoIndex < favourites.length - 1 && (
              <button className="lightbox-nav lightbox-nav-next" onClick={() => { setCurrentPhotoIndex(currentPhotoIndex + 1); setZoomLevel(100); }}>
                <i className="las la-angle-right" />
              </button>
            )}

            {/* Image Container */}
            <div className="lightbox-content">
              <img 
                src={favourites[currentPhotoIndex].url} 
                alt={`favourite ${favourites[currentPhotoIndex].id}`}
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
