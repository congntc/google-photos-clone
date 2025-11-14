import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PageProps } from '@/types';
import { router } from '@inertiajs/react';

interface AlbumCreateProps extends PageProps {
  title?: string;
}

export default function AlbumCreate({ title: initialTitle = '', auth }: AlbumCreateProps) {
  // Reset body overflow when component mounts (fix scrollbar issue when navigating from other pages)
  useEffect(() => {
    // Add class to body to enable CSS override
    document.body.classList.add('album-create-page-body');
    
    // Force reset overflow on both html and body
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      // Remove class on unmount
      document.body.classList.remove('album-create-page-body');
    };
  }, []);

  const [newTitle, setNewTitle] = useState(initialTitle);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goToSelectPage = useCallback(() => {
    // Use Inertia navigation to ensure SPA route resolution
    if (newTitle && newTitle.trim()) {
      router.get('/albums/create/select', { title: newTitle });
    } else {
      router.get('/albums/create/select');
    }
  }, [newTitle]);

  const onFilesChosen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Hiện tại chỉ preview client-side; có thể xử lý upload sau
    e.target.value = '';
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {/* Left: Back arrow */}
        <button
          onClick={goBack}
          aria-label="Quay lại"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: '#5f6368',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="las la-arrow-left" />
        </button>

        {/* Right: Share & More icons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            aria-label="Chia sẻ"
            title="Chia sẻ"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#5f6368',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => console.log('Chia sẻ album')}
          >
            <i className="fa-solid fa-share-nodes" />
          </button>
          <button
            aria-label="Tùy chọn khác"
            title="Tùy chọn khác"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#5f6368',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => console.log('Tùy chọn khác')}
          >
            <i className="ri-more-2-fill" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Title */}
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>
          Tạo album mới
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Thêm tiêu đề"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 32,
              fontWeight: 500,
              color: '#202124',
              background: 'transparent',
              borderBottom: '2px solid #dadce0',
              paddingBottom: 8
            }}
          />
        </div>

        {/* Add Photos Section */}
        <div>
          <div style={{ marginBottom: 12, color: '#5f6368', fontSize: 14 }}>
            Thêm ảnh
          </div>
          <button
            onClick={goToSelectPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              border: '1px solid #dadce0',
              borderRadius: 8,
              background: '#fff',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a73e8',
                color: '#fff',
                fontSize: 16
              }}
            >
              <i className="las la-plus" />
            </span>
            <span>Chọn ảnh</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFilesChosen}
            style={{ display: 'none' }}
          />
          <div style={{ marginTop: 8, color: '#5f6368', fontSize: 12 }}>
            Mẹo: Kéo ảnh và video vào bất cứ đâu để tải lên
          </div>
        </div>
      </div>
    </div>
  );
}
