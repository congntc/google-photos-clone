import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '@/Layouts/app';
import { PageProps } from '@/types';
import { Link, router } from '@inertiajs/react';
import '../assets/css/page-google-photos-album.css';

type AlbumCard = {
  id: number;
  title: string;
  photos_count?: number;
  cover_url?: string | null;
  is_owner?: boolean;
  shared_to_me?: boolean;
};

interface AlbumsPageProps extends PageProps {
  albums: AlbumCard[];
}

export default function PageGooglePhotosAlbum({ albums = [], auth }: AlbumsPageProps) {
  const [menuAlbumId, setMenuAlbumId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Rename modal state
  const [renameAlbum, setRenameAlbum] = useState<AlbumCard | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  // Filter state: 'all' | 'mine' | 'shared'
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'shared'>('all');

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
    if (!auth?.user) {
      alert('Vui lòng đăng nhập để tạo album.');
      window.location.href = '/login';
      return;
    }
    window.location.href = '/albums/create';
  }, [auth]);

  // Điều hướng sang trang chọn ảnh để tạo album
  const goToSelectPage = useCallback(() => {
    window.location.href = `/albums/create/select`;
  }, []);

  // Filter albums based on active filter
  const filteredAlbums = albums.filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mine') return a.is_owner && !a.shared_to_me;
    if (activeFilter === 'shared') return a.shared_to_me;
    return true;
  });

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
          <button className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            {activeFilter === 'all' && <i className="las la-check"></i>}
            <span>Tất cả</span>
          </button>
          <button className={`chip ${activeFilter === 'mine' ? 'active' : ''}`} onClick={() => setActiveFilter('mine')}>
            {activeFilter === 'mine' && <i className="las la-check"></i>}
            <span>Album của tôi</span>
          </button>
          <button className={`chip ${activeFilter === 'shared' ? 'active' : ''}`} onClick={() => setActiveFilter('shared')}>
            {activeFilter === 'shared' && <i className="las la-check"></i>}
            <span>Được chia sẻ với tôi</span>
          </button>
        </div>

        <div className="album-grid">
          {filteredAlbums.map((a) => (
            <div key={a.id} className="album-card">
              <div className="album-thumb">
                {/* Ảnh bìa: hiển thị với height=200px, width auto tỷ lệ gốc; nếu album rỗng dùng placeholder */}
                <img
                  src={a.cover_url ?? `https://picsum.photos/600/400?random=${a.id}`}
                  alt={a.title}
                  loading="lazy"
                  style={{ height: 200, width: 'auto', cursor:'pointer' }}
                  onClick={() => (window.location.href = `/albums/${a.id}`)}
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.src = `https://picsum.photos/600/400?grayscale&random=${a.id}`;
                  }}
                />
                <button className="album-menu" aria-label="Tùy chọn khác" title="Tùy chọn khác" onClick={(e) => { e.stopPropagation(); toggleMenu(a.id); }}>
                  <i className="ri-more-2-fill"></i>
                </button>
              </div>
              {menuAlbumId === a.id && (
                <div className="album-popup-menu" ref={menuRef} role="menu" aria-label="Menu album">
                  {a.shared_to_me ? (
                    <>
                      <button className="menu-item" role="menuitem" onClick={() => { console.log('Báo vi phạm', a.id); setMenuAlbumId(null); }}>Báo vi phạm</button>
                      <button className="menu-item" role="menuitem" onClick={() => { console.log('Chia sẻ album', a.id); setMenuAlbumId(null); }}>Chia sẻ album</button>
                      <button className="menu-item" role="menuitem" onClick={() => { console.log('Rời khỏi album', a.id); setMenuAlbumId(null); }}>Rời khỏi album</button>
                    </>
                  ) : (
                    <>
                      <button className="menu-item" role="menuitem" onClick={() => { setMenuAlbumId(null); setRenameAlbum(a); setRenameTitle(a.title); }}>Đổi tên album</button>
                      <button className="menu-item" role="menuitem" onClick={() => { console.log('Chia sẻ album', a.id); setMenuAlbumId(null); }}>Chia sẻ album</button>
                      <button className="menu-item" role="menuitem" onClick={() => { setMenuAlbumId(null); if (confirm('Bạn có chắc muốn xóa album này?')) { router.delete(`/albums/${a.id}`); } }}>Xóa album</button>
                    </>
                  )}
                </div>
              )}
              <div className="album-info">
                <div className="album-title" title={a.title}>{a.title}</div>
                <div className="album-meta">
                  {(a.photos_count ?? 0)} mục · Riêng tư
                </div>
              </div>
            </div>
          ))}
        </div>
      
      {/* Rename Album Modal */}
      {renameAlbum && (
        <div className="album-rename-overlay" role="dialog" aria-modal="true" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
          <div className="album-rename-modal" style={{background:'#f1f3f4', borderRadius:28, padding:32, width:'min(560px, 90%)', display:'flex', gap:24}}>
            <div style={{flex:'0 0 160px'}}>
              <img src={renameAlbum.cover_url ?? `https://picsum.photos/300/200?random=${renameAlbum.id}`} alt={renameAlbum.title} style={{width:'100%', height:160, objectFit:'cover', borderRadius:12}} />
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:16}}>
              <h1 style={{margin:0, fontSize:24, fontWeight:600}}>Đổi tên album</h1>
              <div>
                <input
                  autoFocus
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  placeholder="Nhập tên album mới"
                  style={{width:'100%', fontSize:16, padding:'12px 16px', border:'none', outline:'none', background:'#e0e3e7', borderRadius:8}}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (renameTitle.trim()) { router.patch(`/albums/${renameAlbum.id}`, { title: renameTitle.trim() }, { onSuccess: () => setRenameAlbum(null) }); } } }}
                />
                <div style={{height:2, background:'#1a73e8', marginTop:4}} />
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:32, marginTop:'auto'}}>
                <button onClick={() => setRenameAlbum(null)} style={{background:'none', border:'none', color:'#1a73e8', fontSize:14, cursor:'pointer'}}>Hủy</button>
                <button
                  onClick={() => { if (!renameTitle.trim()) { alert('Tên album không được trống'); return; } router.patch(`/albums/${renameAlbum.id}`, { title: renameTitle.trim() }, { onSuccess: () => setRenameAlbum(null) }); }}
                  style={{background:'none', border:'none', color:'#1a73e8', fontWeight:600, fontSize:14, cursor:'pointer'}}
                >Xong</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
       </AppLayout>
  );
}
