import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos-album.css';
import img01 from '../assets/images/page-img/07.jpg';
import img02 from '../assets/images/page-img/02.jpg';

// Simple mock data for albums
const albums = [
  {
    id: 1,
    title: 'Tổ Trung Đo',
    count: 1658,
    shared: true,
    cover: img01,
  },
  {
    id: 2,
    title: 'Quan thầy 25 năm Tổ Trung Đo',
    count: 450,
    shared: true,
    cover: img02,
  },
  {
    id: 3,
    title: 'Quan thầy 25 năm Tổ Trung Đo',
    count: 450,
    shared: true,
    cover: img02,
  },
  
];

export default function PageGooglePhotosAlbum() {
  const [menuAlbumId, setMenuAlbumId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = useCallback((albumId: number) => {
    setMenuAlbumId((prev) => (prev === albumId ? null : albumId));
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target) && !target.closest('.album-menu')) {
        setMenuAlbumId(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAlbumId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onCreateAlbum = useCallback(() => {
    console.log('Create album clicked');
  }, []);

  return (
    <AppLayout>
    <div className="album-page-container">
      <div className="albums-header">
        <div className="albums-title">Album</div>
        <div className="albums-actions">
          <button className="btn btn-create" onClick={onCreateAlbum}>
            <i className="las la-plus"></i>
            <span>Tạo album</span>
          </button>
          <button className="btn btn-sort" title="Sắp xếp">
            <i className="las la-sort-amount-down"></i>
            <span>Ảnh gần đây nhất</span>
          </button>
        </div>
      </div>
        <div className="album-filters">
          <button className="chip active"><i className="las la-check"></i><span>Tất cả</span></button>
          <button className="chip">Album của tôi</button>
          <button className="chip">Được chia sẻ với tôi</button>
        </div>

        <div className="album-grid">
          {albums.map((a) => (
            <div key={a.id} className="album-card" onClick={() => window.location.href = `/albums/${a.id}` }>
              <div className="album-thumb">
                <img src={a.cover} alt={a.title} />
                <button className="album-menu" aria-label="Tùy chọn khác" title="Tùy chọn khác" onClick={() => toggleMenu(a.id)}>
                                  <i className="ri-more-2-fill"></i>
                </button>
              </div>
              {menuAlbumId === a.id && (
                <div className="album-popup-menu" ref={menuRef} role="menu" aria-label="Menu album">
                  <button className="menu-item" role="menuitem" onClick={() => { console.log('Báo vi phạm', a.id); setMenuAlbumId(null); }}>Báo vi phạm</button>
                  <button className="menu-item" role="menuitem" onClick={() => { console.log('Chia sẻ album', a.id); setMenuAlbumId(null); }}>Chia sẻ album</button>
                  <button className="menu-item" role="menuitem" onClick={() => { console.log('Rời khỏi album', a.id); setMenuAlbumId(null); }}>Rời khỏi album</button>
                </div>
              )}
              <div className="album-info">
                <div className="album-title" title={a.title}>{a.title}</div>
                <div className="album-meta">
                  {a.count} mục · {a.shared ? 'Được chia sẻ' : 'Riêng tư'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
       </AppLayout>
  );
}
