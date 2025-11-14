import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../assets/css/page-google-photos.css';
import '../assets/css/favourites-page.css';

interface PhotoItem {
  id: number;
  url: string;
  thumbnail_url?: string;
  date: string;
  type: 'image' | 'video';
  mime_type: string;
}

interface Props {
  album: { id: number; title: string; photos_count?: number };
  photos: PhotoItem[];
}

export default function AlbumAddSelect({ album, photos: initialPhotos = [] }: Props) {
  // Reset body overflow when component mounts (fix scrollbar issue when navigating from other pages)
  useEffect(() => {
    // Add class to body to enable CSS override
    document.body.classList.add('album-add-select-page-body');
    
    // Force reset overflow on both html and body
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      // Remove class on unmount
      document.body.classList.remove('album-add-select-page-body');
    };
  }, []);

  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  const [uploading, setUploading] = useState(false);

  // Sync photos when props change (after reload)
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

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

  const onToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const onUploadClick = useCallback(() => uploadRef.current?.click(), []);
  const onUploadChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }

    try {
      const response = await fetch('/photos/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Auto reload to display newly uploaded photos/videos
      router.reload({ only: ['photos'] });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Không thể tải lên ảnh/video. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search) return photos;
    const q = search.toLowerCase();
    return photos.filter(p => p.mime_type.toLowerCase().includes(q) || String(p.id).includes(q));
  }, [photos, search]);

  const byDate = useMemo(() => {
    const groups: Record<string, PhotoItem[]> = {};
    filtered.forEach(p => {
      (groups[p.date] ||= []).push(p);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const onAttach = useCallback(() => {
    if (selectedIds.size === 0) {
      alert('Hãy chọn ít nhất 1 ảnh/video.');
      return;
    }
    const photo_ids = Array.from(selectedIds);
    router.post(`/albums/${album.id}/attach`, { photo_ids }, { preserveScroll: true });
  }, [selectedIds, album.id]);

  return (
    <>
      <Head title={`Thêm vào ${album.title}`} />
      <div className="favourites-page has-selection">
        <header className="favourites-header" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
          <div className="favourites-header-content">
            <Link href={`/albums/${album.id}`} className="back-button" aria-label="Quay lại album">
              <i className="las la-arrow-left" />
            </Link>

            <div className="search-container" style={{ flex: 1 }}>
              <div className="search-box">
                <i className="las la-search search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm ảnh/video"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-upload"
                onClick={onUploadClick}
                title={uploading ? 'Đang tải lên...' : 'Chọn từ máy tính'}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <i className="las la-spinner la-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <i className="las la-file-upload" />
                    Chọn từ máy tính
                  </>
                )}
              </button>
              <button className="action-done" onClick={onAttach} title="Xong">
                Xong
              </button>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div className="selection-toolbar" style={{ position: 'static' }}>
              <div className="toolbar-left">
                <span className="selection-count">Đã chọn {selectedIds.size}</span>
              </div>
            </div>
          )}
        </header>

        <div className={`favourites-container${selectedIds.size > 0 ? ' has-selection-toolbar' : ''}`}>
          <div className="photo-grid" id="photoGrid">
            {byDate.map(([date, items]) => (
              <React.Fragment key={date}>
                <div className="date-divider">{date}</div>
                {items.map((p) => (
                  <div key={p.id} className="photo-item" style={{ position: 'relative' }}>
                    {p.type === 'video' ? (
                      <>
                        <video
                          src={p.url}
                          muted
                          preload="metadata"
                          onLoadedMetadata={(ev) => {
                            const vid = ev.currentTarget as HTMLVideoElement;
                            if (!isNaN(vid.duration)) {
                              setVideoDurations((prev) => ({ ...prev, [p.id]: Math.floor(vid.duration) }));
                            }
                          }}
                          style={{ height: 180, width: 'auto', maxWidth: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
                        />
                        <div className="video-duration-overlay">{formatDuration(videoDurations[p.id])}</div>
                      </>
                    ) : (
                      <img
                        src={p.thumbnail_url || p.url}
                        alt={`Photo ${p.id}`}
                        loading="lazy"
                        style={{ height: 180, width: 'auto', maxWidth: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
                      />
                    )}

                    <div className="photo-info">
                      <div className="photo-date">{p.date}</div>
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
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <input ref={uploadRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={onUploadChange} />
    </>
  );
}
