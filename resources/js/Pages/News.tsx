import React from 'react';
import AppLayout from '@/Layouts/app';
import '../assets/css/page-google-photos-news.css';

export default function PageGooglePhotosNews() {
  return (
    <AppLayout>
      <div className="news-page-container">
         <div className="page-header">Tin mới</div>
          <div className="card mb-3">
            <div className="card-body share-banner">
              <div className="share-left">
                <div className="share-icon">
                  <i className="las la-user-friends" />
                </div>
                <div className="share-text">
                  <div className="share-title">Chia sẻ với người thân</div>
                  <div className="share-desc">Sẽ không còn những lần quên chia sẻ ảnh với người thân</div>
                </div>
              </div>
              <button className="btn-primary">Bắt đầu</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="empty-wrapper">
                <svg className="empty-art" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" fill="none">
                  <g opacity=".9">
                    <circle cx="60" cy="70" r="18" fill="#e7f0ff" />
                    <circle cx="110" cy="58" r="26" fill="#e7f0ff" />
                    <circle cx="150" cy="76" r="20" fill="#e7f0ff" />
                    <polygon points="120,85 170,103 140,130" fill="#3b82f6" />
                    <path d="M80 120c30 0 40-16 60-8" stroke="#c7d2fe" strokeDasharray="4 6" strokeWidth="2" fill="none" />
                  </g>
                </svg>
                <div className="empty-text">Không có thông tin cập nhật</div>
              </div>
            </div>
          </div>
      </div>
    </AppLayout>
  );
}
