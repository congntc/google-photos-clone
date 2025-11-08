import React from 'react';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos-document.css';

export default function PageGooglePhotosDocument() {
  const documents = [
    {
      id: 1,
      label: 'Biên nhận',
      image: 'https://picsum.photos/id/1015/300/200'
    },
    {
      id: 2,
      label: 'Công thức, món ăn và thực đơn',
      image: 'https://picsum.photos/id/1056/300/200'
    },
    {
      id: 3,
      label: 'Ghi chú',
      image: 'https://picsum.photos/id/1010/300/200'
    },
    {
      id: 4,
      label: 'Giấy tờ tùy thân',
      image: 'https://picsum.photos/id/1021/300/200'
    },
    {
      id: 5,
      label: 'Mạng xã hội',
      image: 'https://picsum.photos/id/1027/300/200'
    },
    {
      id: 6,
      label: 'Phương thức thanh toán',
      image: 'https://picsum.photos/id/1032/300/200'
    },
    {
      id: 7,
      label: 'Sách và tạp chí',
      image: 'https://picsum.photos/id/1060/300/200'
    },
    {
      id: 8,
      label: 'Thông tin học tập',
      image: 'https://picsum.photos/id/1033/300/200'
    }
  ];

  return (
    <AppLayout>
    <div className="document-page-container">
      <div className="document-header">
        <h1 className="document-title">Tài liệu</h1>
      </div>

      <div className="document-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <img src={doc.image} alt={doc.label} />
            <span className="document-label">{doc.label}</span>
          </div>
        ))}
      </div>
    </div>
    </AppLayout>
  );
}
