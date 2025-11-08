import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import '../assets/css/page-google-photos.css';
import '../assets/css/videos-page.css';

// Sample images (placeholder)
import img01 from '../assets/images/page-img/01.jpg';
import img02 from '../assets/images/page-img/02.jpg';
import img03 from '../assets/images/page-img/03.jpg';
import img07 from '../assets/images/page-img/07.jpg';
import img08 from '../assets/images/page-img/08.jpg';

interface VideoItem {
  id: number;
  url: string;
  date: string;
  month: string;
  year: string;
  duration?: string;
}

// Ensure icon fonts
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

export default function Videos() {
  useEffect(() => { ensureIconCss(); }, []);

  // Data (flexbox-friendly images; treat as demo video thumbnails)
  const [videos, setVideos] = useState<VideoItem[]>([
    { id: 1, url: img01, date: '2025-11-07', month: 'November 2025', year: '2025', duration: '0:07' },
    { id: 2, url: img02, date: '2025-11-07', month: 'November 2025', year: '2025', duration: '0:12' },
    { id: 3, url: img03, date: '2025-11-06', month: 'November 2025', year: '2025', duration: '0:15' },
    { id: 4, url: img07, date: '2025-11-05', month: 'November 2025', year: '2025', duration: '0:08' },
    { id: 5, url: img08, date: '2025-11-04', month: 'November 2025', year: '2025', duration: '0:10' },
  ]);

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const onToggleFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const onToggleSelect = useCallback((id: number) => {
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

    const newItems: VideoItem[] = files.map((file: File, idx: number) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      date: dateStr,
      month: monthName,
      year,
    }));

    setVideos((prev) => [...newItems, ...prev]);
    e.target.value = '';
  }, []);

  const getDateLabel = (dateStr: string) => {
    const photoDate = new Date(dateStr);
    const today = new Date('2025-11-07');
    const yesterday = new Date('2025-11-06');

    photoDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    yesterday.setHours(0,0,0,0);

    if (photoDate.getTime() === today.getTime()) return 'Hôm nay';
    if (photoDate.getTime() === yesterday.getTime()) return 'Hôm qua';
    const dayOfWeek = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'][photoDate.getDay()];
    const day = photoDate.getDate();
    const month = photoDate.getMonth() + 1;
    return `${dayOfWeek}, ${day} thg ${month}`;
  };

  const renderedItems = useMemo(() => {
    const out: React.ReactNode[] = [];
    let currentDateLabel = '';

    videos.forEach((v) => {
      const dateLabel = getDateLabel(v.date);
      if (dateLabel !== currentDateLabel) {
        out.push(
          <div key={`date-${v.date}-${out.length}`} className="date-divider">{dateLabel}</div>
        );
        currentDateLabel = dateLabel;
      }

      const idx = videos.findIndex(item => item.id === v.id);
      out.push(
        <div key={v.id} className="photo-item video-item" onClick={(e: any) => {
          if ((e.target as HTMLElement).closest('.photo-favorite')) return;
          if ((e.target as HTMLElement).closest('.photo-select')) return;
          setCurrentIndex(idx);
          setZoomLevel(100);
        }}>
          <img src={v.url} alt={`video ${v.id}`} loading="lazy" onError={(e) => { e.currentTarget.src = `https://picsum.photos/400/300?random=${v.id}`; }} />
          <div className="photo-info">
            <div className="video-duration">{v.duration || '0:00'}</div>
            <button 
              type="button" 
              className={`photo-select${selectedIds.has(v.id) || selectedIds.size > 0 ? ' visible' : ''}${selectedIds.has(v.id) ? ' active' : ''}`} 
              onClick={(e) => { e.stopPropagation(); onToggleSelect(v.id); }} 
              aria-label="Toggle select"
            >
              <i className="las la-check" />
            </button>
          </div>
        </div>
      );
    });    return out;
  }, [videos, favoriteIds, selectedIds, onToggleFavorite, onToggleSelect]);

  return (
    <>
      <Head title="Videos" />

      <div className={`videos-page${selectedIds.size > 0 ? ' has-selection' : ''}`}>
        {/* Header */}
        <header className="videos-header">
          <div className="videos-header-content">
            <Link href="/photos" className="back-button">
              <i className="las la-arrow-left" />
            </Link>
            
            <div className="search-container">
              <div className="search-box">
                <i className="las la-search search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Videos"
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

        <div className={`videos-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
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
          <button className="fab" title="Upload videos" onClick={onUploadClick}><i className="las la-plus" /></button>
          <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
        </div>

        {/* Lightbox */}
        {currentIndex !== null && (
          <div className="lightbox-overlay">
            <div className="lightbox-topbar">
              <div className="lightbox-topbar-left">
                <button className="lightbox-btn" onClick={() => setCurrentIndex(null)} title="Quay lại">
                  <i className="las la-arrow-left" />
                </button>
                <div className="lightbox-counter">{currentIndex + 1} / {videos.length}</div>
              </div>
              <div className="lightbox-topbar-right">
                <button className="lightbox-btn" title="Phóng to" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}><i className="las la-search-plus" /></button>
                <button className="lightbox-btn" title="Thu nhỏ" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}><i className="las la-search-minus" /></button>
                <span className="zoom-level">{zoomLevel}%</span>
                <button className="lightbox-btn" title="Thông tin"><i className="las la-info-circle" /></button>
                <button className="lightbox-btn" title="Tải xuống"><i className="las la-download" /></button>
                <button className="lightbox-btn lightbox-btn-favorite" title="Yêu thích"><i className="las la-heart" /></button>
                <button className="lightbox-btn lightbox-btn-delete" title="Xóa"><i className="las la-trash" /></button>
                <button className="lightbox-btn" onClick={() => setCurrentIndex(null)} title="Đóng"><i className="las la-times" /></button>
              </div>
            </div>

            <div className="lightbox-content">
              <img
                src={videos[currentIndex].url}
                alt={`video ${videos[currentIndex].id}`}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>

            {currentIndex > 0 && (
              <button className="lightbox-nav lightbox-nav-prev" onClick={() => { setCurrentIndex(currentIndex - 1); setZoomLevel(100); }}>
                <i className="las la-angle-left" />
              </button>
            )}
            {currentIndex < videos.length - 1 && (
              <button className="lightbox-nav lightbox-nav-next" onClick={() => { setCurrentIndex(currentIndex + 1); setZoomLevel(100); }}>
                <i className="las la-angle-right" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
