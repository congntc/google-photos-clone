import React from 'react';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos-bin.css';

// Import images
import img07 from '../assets/images/page-img/07.jpg';
import img08 from '../assets/images/page-img/08.jpg';
import img09 from '../assets/images/page-img/09.jpg';
import img10 from '../assets/images/page-img/10.jpg';
import img11 from '../assets/images/page-img/11.jpg';
import img12 from '../assets/images/page-img/12.jpg';

export default function PageGooglePhotosBin() {
  const binPhotos = [
    { id: 1, src: img07, alt: 'Photo 7' },
    { id: 2, src: img08, alt: 'Photo 8' },
    { id: 3, src: img09, alt: 'Photo 9' },
    { id: 4, src: img10, alt: 'Photo 10' },
    { id: 5, src: img11, alt: 'Photo 11' },
    { id: 6, src: img12, alt: 'Photo 12' },
    { id: 7, src: 'https://picsum.photos/id/1032/300/200', alt: 'Photo 13' },
    { id: 8, src: 'https://picsum.photos/id/1060/300/200', alt: 'Photo 14' },
    { id: 9, src: 'https://picsum.photos/id/1033/300/200', alt: 'Photo 15' }
  ];

  const handleEmptyTrash = () => {
    if (window.confirm('Bạn có chắc chắn muốn dọn sạch thùng rác? Các mục sẽ bị xóa vĩnh viễn.')) {
      console.log('Emptying trash...');
    }
  };

  return (
    <AppLayout>
    <div className="bin-page-container">
      <div className="card-body">
        <div className="trash-content">
          <div className="trash-header">
            <h1 className="page-header">Thùng rác</h1>
            <button className="empty-trash-btn" onClick={handleEmptyTrash}>
              <i className="las la-trash-alt"></i>
              <span>Dọn sạch thùng rác</span>
            </button>
          </div>

          <p className="trash-info-banner">
            Các mục trong Thùng rác sẽ bị xóa vĩnh viễn sau 60 ngày. 
            <a href="#"> Tìm hiểu thêm</a>
          </p>
        </div>

        <div className="photo-container">
          <div className="photo-grid">
            {binPhotos.map((photo) => (
              <div key={photo.id} className="photo-item">
                <img src={photo.src} alt={photo.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
