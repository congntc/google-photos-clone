import React, { useEffect, useRef, useState, ReactNode, MouseEvent } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';

// Import local CSS assets used by the old HTML layout
import '../assets/css/backend-plugin.min.css';
import '../assets/css/backend.css';
import '../assets/css/page-google-photos-layout.css';

interface AppLayoutProps {
  children: ReactNode;
}

// Helper to inject external icon fonts that were referenced via vendor links in the HTML
const ensureIconCss = (): void => {
  const links = [
    // Font Awesome (used occasionally)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    // Line Awesome (class prefix: las, lar)
    'https://cdnjs.cloudflare.com/ajax/libs/line-awesome/1.3.0/line-awesome/css/line-awesome.min.css',
    // Remix Icon (class prefix: ri)
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

export default function AppLayout({ children }: AppLayoutProps) {
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showApps, setShowApps] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const { url, props } = usePage<PageProps>();
  const auth = props.auth;

  const createRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Mount-time setup
  useEffect(() => {
    ensureIconCss();
  }, []);

  // Close popovers when clicking outside (Create + Apps + UserMenu). Help closes via its X button.
  useEffect(() => {
    function onDocClick(e: Event) {
      const target = e.target as Node;
      if (showCreate && createRef.current && !createRef.current.contains(target)) {
        setShowCreate(false);
      }
      if (showApps && appsRef.current && !appsRef.current.contains(target)) {
        setShowApps(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showCreate, showApps, showUserMenu]);

  // Helpers
  const toggleCreate = (e?: MouseEvent<HTMLButtonElement>): void => {
    e?.stopPropagation();
    setShowCreate((s) => !s);
    setShowApps(false);
  };
  const toggleHelp = (e?: MouseEvent<HTMLButtonElement>): void => {
    e?.stopPropagation();
    setShowHelp((s) => !s);
  };
  const closeHelp = (): void => setShowHelp(false);
  const toggleApps = (e?: MouseEvent<HTMLButtonElement>): void => {
    e?.stopPropagation();
    setShowApps((s) => !s);
    setShowCreate(false);
  };
  const toggleUserMenu = (e?: MouseEvent<HTMLDivElement>): void => {
    e?.stopPropagation();
    setShowUserMenu((s) => !s);
  };
  const handleLogout = (): void => {
    router.post('/logout');
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <a href="#" className="navbar-brand" title="Google Photos" onClick={(e) => e.preventDefault()}>
          <div className="google-wordmark" aria-label="Google">
            <span className="google-g">G</span>
            <span className="google-o1">o</span>
            <span className="google-o2">o</span>
            <span className="google-g2">g</span>
            <span className="google-l">l</span>
            <span className="google-e">e</span>
          </div>
          <span className="brand-photos">Photos</span>
        </a>

        <div className="navbar-search">
          <div className="search-input-wrapper">
            <i className="las la-search search-icon" />
            <input type="text" className="search-input" placeholder="Tìm kiếm ảnh và album của bạn" />
          </div>
        </div>

        <div className="navbar-actions">
          <button className="navbar-action-btn" id="create-btn" title="Tạo mới / Thêm ảnh" onClick={toggleCreate}>
            <i className="las la-plus" />
          </button>
          <button className="navbar-action-btn" id="help-btn" title="Trợ giúp" onClick={toggleHelp}>
            <i className="las la-question-circle" />
          </button>
          <Link href="/settings" className="navbar-action-btn" title="Cài đặt" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="las la-cog" />
          </Link>
          <button className="navbar-action-btn" id="google-apps-btn" title="Ứng dụng Google" onClick={toggleApps}>
            <i className="navbar-app ri-apps-2-line" />
          </button>
          <div className="navbar-avatar" title="Tài khoản" onClick={toggleUserMenu} style={{ cursor: 'pointer' }}>
            {auth?.user?.name?.charAt(0).toUpperCase() || 'P'}
          </div>
        </div>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="create-dropdown-menu show" style={{ right: '10px', left: 'auto', top: '60px' }} ref={userMenuRef}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{auth?.user?.name}</div>
              <div style={{ fontSize: '14px', color: '#5f6368' }}>{auth?.user?.email}</div>
            </div>
            <ul className="dropdown-list">
              <li>
                <a href="#">
                  <i className="las la-user" /><span>Tài khoản của tôi</span>
                </a>
              </li>
              <li>
                <Link href="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <i className="las la-cog" /><span>Cài đặt</span>
                </Link>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <i className="las la-sign-out-alt" /><span>Đăng xuất</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Panel "Tạo" (Dropdown) */}
      <div className={`create-dropdown-menu${showCreate ? ' show' : ''}`} id="create-menu" ref={createRef}>
        <h3 className="dropdown-title">Tạo</h3>
        <ul className="dropdown-list">
          <li><a href="#"><i className="ri-book-line" /><span>Album</span></a></li>
          <li><a href="#"><i className="ri-layout-grid-line" /><span>Ảnh ghép</span></a></li>
          <li><a href="#"><i className="ri-film-line" /><span>Video khoảnh khắc nổi bật</span></a></li>
          <li><a href="#"><i className="ri-play-circle-line" /><span>Ảnh động</span></a></li>
          <li><a href="#"><i className="ri-group-line" /><span>Chia sẻ với người thân</span></a></li>
        </ul>
        <hr className="dropdown-divider" />
        <ul className="dropdown-list">
          <li><a href="#"><i className="ri-upload-cloud-line" /><span>Nhập ảnh</span></a></li>
          <li><a href="#"><i className="ri-folder-add-line" /><div className="menu-item-text"><span>Sao lưu thư mục</span><span className="sub-label">Sao lưu tự động</span></div></a></li>
          <li><a href="#"><i className="ri-swap-line" /><span>Chuyển nội dung từ các dịch vụ chụp ảnh</span></a></li>
          <li><a href="#"><i className="ri-image-add-line" /><span>Số hoá ảnh vật lý</span></a></li>
          <li><a href="#"><i className="ri-smartphone-line" /><span>Quét ảnh bằng điện thoại</span></a></li>
          <li><a href="#"><i className="ri-google-drive-line" /><span>Google Drive</span></a></li>
        </ul>
        <hr className="dropdown-divider" />
        <ul className="dropdown-list">
          <li>
            <a href="#" className="has-submenu">
              <div className="menu-item-main"><i className="ri-more-2-fill" /><span>Từ những nơi khác</span></div>
              <i className="ri-arrow-right-s-line" />
            </a>
          </li>
        </ul>
      </div>

      {/* Panel Trợ giúp (Bên phải) */}
      <div className={`help-panel${showHelp ? ' show' : ''}`} id="help-panel" ref={helpRef}>
        <div className="help-header">
          <h3 className="help-title">Trợ giúp</h3>
          <button className="help-close-btn" id="help-close-btn" onClick={closeHelp}>
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="help-body">
          <ul className="help-list">
            <li><a href="#"><i className="ri-album-line" /><span>Tạo và chỉnh sửa album ảnh</span></a></li>
            <li><a href="#"><i className="ri-google-drive-line" /><span>Thêm ảnh và video trên Google Drive vào Google Photos</span></a></li>
            <li><a href="#" className="link-only"><span>Truy cập Diễn đàn trợ giúp</span><i className="ri-external-link-line" /></a></li>
          </ul>
          <div className="help-search-wrapper">
            <i className="ri-search-line search-icon" />
            <input type="text" className="help-search-input" placeholder="Tìm kiếm trong trợ giúp" />
          </div>
          <hr className="help-divider" />
          <h4 className="help-subtitle">Bạn cần trợ giúp thêm?</h4>
          <ul className="help-list">
            <li><a href="#"><i className="ri-question-answer-line" /><div className="menu-item-text"><span>Đặt câu hỏi trên Cộng đồng Trợ giúp</span><span className="sub-label">Nhận câu trả lời từ các chuyên gia trong cộng đồng</span></div></a></li>
            <li><a href="#"><i className="ri-feedback-line" /><span>Gửi phản hồi</span></a></li>
          </ul>
        </div>
      </div>

      {/* Google Apps Panel */}
      <div className={`google-apps-panel${showApps ? ' show' : ''}`} id="google-apps-panel" ref={appsRef}>
        <div className="apps-scroll-container">
          <div className="apps-grid">
            <a href="#" className="app-item"><i className="ri-book-line" /><span>Sách</span></a>
            <a href="#" className="app-item"><i className="ri-store-line" /><span>Cửa hàng...</span></a>
            <a href="#" className="app-item"><i className="ri-settings-3-line" /><span>Trình quả...</span></a>
            <a href="#" className="app-item"><i className="ri-bar-chart-box-line" /><span>Google A...</span></a>
            <a href="#" className="app-item"><i className="ri-wallet-line" /><span>Wallet</span></a>
            <a href="#" className="app-item"><i className="ri-booklet-line" /><span>Notebook...</span></a>
            <a href="#" className="app-item"><i className="ri-task-line" /><span>Tasks</span></a>
          </div>
        </div>
        <div className="apps-footer">
          <a href="#" className="all-products-btn">Sản phẩm khác của Google</a>
        </div>
      </div>

      {/* Left Sidebar */}
      <aside className="left-sidebar">
        <ul className="sidebar-menu">
          <li><Link href="/photos" className={url === '/photos' ? 'active' : ''}><i className="las la-image" /><span className="left-sidebar-title">Ảnh</span></Link></li>
          <li><Link href="/news" className={url === '/news' ? 'active' : ''}><i className="las la-bell" /><span className="left-sidebar-title">Tin mới</span></Link></li>
          <div className="sidebar-section-title">Bộ sưu tập</div>
          <li><Link href="/albums" className={url === '/albums' ? 'active' : ''}><i className="las la-book" /><span className="left-sidebar-title">Album</span></Link></li>
          <li><Link href="/documents" className={url === '/documents' ? 'active' : ''}><i className="las la-file-alt" /><span className="left-sidebar-title">Tài liệu</span></Link></li>
          <li><Link href="/screenshots" className={url === '/screenshots' ? 'active' : ''}><i className="las la-mobile" /><span className="left-sidebar-title">Ảnh chụp màn hình</span></Link></li>
          <li><Link href="/favourites" className={url === '/favourites' ? 'active' : ''}><i className="lar la-star" /><span className="left-sidebar-title">Ảnh yêu thích</span></Link></li>
          <li><Link href="/friends" className={url === '/friends' ? 'active' : ''}><i className="las la-user-friends" /><span className="left-sidebar-title">Bạn bè</span></Link></li>
          {/* <li><Link href="/people" className={url === '/people' ? 'active' : ''}><i className="las la-user-friends" /><span className="left-sidebar-title">Người và thú cưng</span></Link></li> */}
          {/* <li><Link href="/locations" className={url === '/locations' ? 'active' : ''}><i className="las la-map-marker-alt" /><span className="left-sidebar-title">Địa điểm</span></Link></li> */}
          <li><Link href="/videos" className={url === '/videos' ? 'active' : ''}><i className="las la-video" /><span className="left-sidebar-title">Video</span></Link></li>
          {/* <li><Link href="/recent" className={url === '/recent' ? 'active' : ''}><i className="las la-history" /><span className="left-sidebar-title">Mới thêm gần đây</span></Link></li> */}
          <li><Link href="/archive" className={url === '/archive' ? 'active' : ''}><i className="las la-archive" /><span className="left-sidebar-title">Kho lưu trữ</span></Link></li>
          <li><Link href="/secure" className={url === '/secure' ? 'active' : ''}><i className="las la-shield-alt" /><span className="left-sidebar-title">Thư mục bảo mật</span></Link></li>
          <li><Link href="/bin" className={url === '/bin' ? 'active' : ''}><i className="las la-trash-alt" /><span className="left-sidebar-title">Thùng rác</span></Link></li>
          <div className="sidebar-section-title">Bộ nhớ</div>
          <div className="sidebar-storage">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1f1f1f' }}>
              <i className="las la-cloud" style={{ fontSize: 18 }} />
              <span>Đã sử dụng ...GB/15 GB</span>
            </div>
            <div className="storage-bar"><span /></div>
            <a href="#" className="btn-try">Dùng thử gói 100 GB</a>
          </div>
        </ul>
      </aside>

      {/* Main Content slot */}
      <main className="main-content" style={{ minHeight: '100vh', paddingTop: 70 }}>
        {children}
      </main>
    </div>
  );
}
