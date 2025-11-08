import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos.css';
import '../assets/css/page-google-photos-archive.css';

// Import 5 sample images from local assets
import img01 from '../assets/images/page-img/01.jpg';
import img02 from '../assets/images/page-img/02.jpg';
import img03 from '../assets/images/page-img/03.jpg';
import img07 from '../assets/images/page-img/07.jpg';
import img08 from '../assets/images/page-img/08.jpg';

interface PhotoItem {
  id: number;
  url: string;
  date: string;
  month: string;
  year: string;
}

export default function PageGooglePhotos() {
  // Photos with realistic dates: today, yesterday, and various days in October
  const [photos, setPhotos] = useState([
    // Hôm nay (3/11/2025)
    { id: 1, url: img01, date: '2025-11-03', month: 'November 2025', year: '2025' },
    { id: 2, url: img02, date: '2025-11-03', month: 'November 2025', year: '2025' },
    
    // Hôm qua (2/11/2025)
    { id: 3, url: img03, date: '2025-11-02', month: 'November 2025', year: '2025' },
    
    // Tháng 10
    { id: 4, url: img07, date: '2024-10-31', month: 'October 2024', year: '2024' },
    { id: 5, url: img08, date: '2024-10-30', month: 'October 2024', year: '2024' },
  ]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const uploadRef = useRef<HTMLInputElement | null>(null);

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

    const newPhotos = files.map((file: File, idx: number) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      date: dateStr,
      month: monthName,
      year,
    }));

    setPhotos((prev) => [...newPhotos, ...prev]);
    e.target.value = '';
  }, []);

  // Trigger the hidden file input when clicking "Thêm ảnh" in header
  const handleAddPhotos = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  // Helper to format date headers like Google Photos
  const getDateLabel = (dateStr) => {
    const photoDate = new Date(dateStr);
    const today = new Date('2025-11-03'); // Current date
    const yesterday = new Date('2025-11-02');
    
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
      
      // Add photo item
      const photoIndex = photos.findIndex(photo => photo.id === p.id);
      out.push(
        <div key={p.id} className="photo-item" onClick={(e: any) => {
          if ((e.target as HTMLElement).closest('.photo-favorite')) return; // ignore favorite click
          if ((e.target as HTMLElement).closest('.photo-select')) return; // ignore select click
          setCurrentPhotoIndex(photoIndex);
          setZoomLevel(100);
        }}>
          <img src={p.url} alt={`Photo ${p.id}`} loading="lazy" onError={(e) => { e.currentTarget.src = `https://picsum.photos/400/300?random=${p.id}`; }} />
          <div className="photo-info">
            <div className="photo-date">{p.date}</div>
            <button 
              type="button" 
              className={`photo-select${selectedIds.has(p.id) || selectedIds.size > 0 ? ' visible' : ''}${selectedIds.has(p.id) ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleSelect(p.id); }}
              aria-label="Toggle select" >
              <i className="las la-check" />
            </button>
          </div>
        </div>
      );
    });
    return out;
  }, [photos, favoriteIds, selectedIds, onToggleFavorite, onToggleSelect]);

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
         
         <div className="archive-header">
          <div className="page-header">Kho lưu trữ</div>

          <button className="add-photos-btn" onClick={handleAddPhotos}>
            <i className="las la-plus"></i> <span>Thêm ảnh</span>
          </button>
        </div>

         <div className="photo-grid" id="photoGrid">
            {renderedItems}
          </div>

          {/* Hidden file input for header "Thêm ảnh" button */}
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={onUploadChange}
          />

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

          {/* Image Container */}
          <div className="lightbox-content">
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
          </div>
        </div>
      )}
    </>
  );
}
