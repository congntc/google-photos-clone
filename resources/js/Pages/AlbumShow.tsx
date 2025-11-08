import React, { useCallback, useMemo, useRef, useState } from 'react';
import '../assets/css/page-google-photos.css';
import '../assets/css/page-google-photos-album-show.css';

interface AlbumParticipant {
  id: number;
  name: string;
  avatar: string;
}
interface AlbumShowProps {
  album: {
    id: number;
    title: string;
    dateRange: string;
    highlightCount: number;
    participants: AlbumParticipant[];
    isOwner: boolean;
  };
  photos: { id: number; url: string; date: string; title?: string }[];
}

export default function AlbumShow({ album, photos }: AlbumShowProps) {
  // Local state so uploads append immediately on client
  const [photoItems, setPhotoItems] = useState(photos);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const onOpenPhoto = useCallback((idx: number) => {
    setCurrentPhotoIndex(idx);
    setZoomLevel(100);
  }, []);

  const onUploadClick = useCallback(() => uploadRef.current?.click(), []);

  const onUploadChange = useCallback((e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const newItems = files.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      date: dateStr,
    }));
    setPhotoItems((prev) => [...newItems, ...prev]);
    e.target.value = '';
  }, []);

  const renderedPhotos = useMemo(() => (
    <div className="albumshow-photo-grid">
      {photoItems.map((p, idx) => (
        <div key={p.id} className="albumshow-photo-item" onClick={() => onOpenPhoto(idx)}>
          <img src={p.url} alt={p.title || `Photo ${p.id}`} loading="lazy" />
        </div>
      ))}
    </div>
  ), [photoItems, onOpenPhoto]);

  return (
    <>
      <div className="albumshow-container standalone">
        {/* Standalone Top Header */}
        <div className="albumshow-topbar">
          <div className="topbar-left">
            <button className="topbar-btn" title="Quay lại ảnh" onClick={() => { window.location.href = '/photos'; }}>
              <i className="las la-arrow-left" />
            </button>
            <span className="topbar-title">{album.title}</span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" title="Thêm ảnh" onClick={onUploadClick}><i className="las la-plus" /></button>
            <button className="topbar-btn" title="Xem hoạt động"><i className="las la-history" /></button>
            <button className="topbar-btn" title="Lưu ảnh"><i className="las la-bookmark" /></button>
            <button className="topbar-btn" title="Chia sẻ"><i className="las la-share-alt" /></button>
            <button className="topbar-btn" title="Tùy chọn khác"><i className="las la-ellipsis-h" /></button>
            <button className="topbar-btn" title="Ứng dụng của Google"><i className="las la-th" /></button>
            <div className="topbar-avatar" title="Tài khoản">
              <img src={`https://i.pravatar.cc/40?img=5`} alt="User" />
            </div>
          </div>
        </div>

        {/* Album Header with Cover and Info */}
        <div className="albumshow-info-section">
          <div className="albumshow-cover-card">
            <img src={photoItems[0]?.url} alt={album.title} />
            <button className="cover-highlight-btn" type="button">
              <i className="las la-images"></i>
              <span>Xem ảnh nổi bật</span>
            </button>
          </div>
          <div className="albumshow-details">
            <h1 className="album-main-title">{album.title}</h1>
            <div className="album-date">{album.dateRange}</div>
            <div className="album-participants">
              <button className="participant-link-btn" title="Sao chép liên kết">
                <i className="las la-link"></i>
              </button>
              {album.participants.map(p => (
                <div key={p.id} className="participant-circle" title={p.name}>
                  <img src={p.avatar} alt={p.name} />
                </div>
              ))}
              <button className="participant-more" title="Thêm người khác">
                <i className="las la-ellipsis-h"></i>
              </button>
              <button className="participant-add-btn" title="Thêm người">
                <i className="las la-plus"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        {renderedPhotos}
        
        {/* Hidden input for uploads */}
        <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
      </div>

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
              <button className="lightbox-btn" onClick={() => setCurrentPhotoIndex(null)} title="Đóng"><i className="las la-times" /></button>
            </div>
          </div>
          <div className="lightbox-content">
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
