# 📸 Google Photos Clone - Ứng dụng Quản lý Ảnh Cá nhân

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</p>

Ứng dụng quản lý ảnh cá nhân được xây dựng dựa trên giao diện và chức năng của **Google Photos**, sử dụng stack công nghệ hiện đại: **Laravel**, **React**, **TypeScript**, và **Inertia.js**. Ứng dụng cung cấp trải nghiệm người dùng mượt mà với các tính năng quản lý ảnh/video toàn diện.

## ✨ Tính năng chính

### 📷 Quản lý Ảnh & Video
- ✅ **Upload đa dạng**: Hỗ trợ kéo thả (drag & drop) hoặc chọn file thủ công
- ✅ **Định dạng**: JPEG, PNG, GIF, WebP, MP4, MOV, AVI
- ✅ **Preview realtime**: Xem trước ảnh/video ngay khi upload
- ✅ **Lightbox viewer**: Xem ảnh toàn màn hình với zoom in/out
- ✅ **Metadata**: Tự động lưu thông tin EXIF (ngày chụp, kích thước, GPS)
- ✅ **Thumbnail**: Tự động tạo ảnh thu nhỏ để tối ưu hiệu năng

### 🗂️ Tổ chức & Phân loại
- ✅ **Albums**: Tạo và quản lý album ảnh
- ❌ **Tags**: Gắn thẻ để dễ dàng tìm kiếm
- ❌ **People Recognition**: Nhận diện và gắn tên người trong ảnh
- ✅ **Favorites**: Đánh dấu ảnh yêu thích
- ❌ **Archive**: Lưu trữ ảnh không muốn hiển thị thường xuyên

### 🔍 Tìm kiếm & Lọc
- ❌ **Tìm kiếm nâng cao**: Theo tên file, tags, người, địa điểm
- ❌ **Lọc theo thời gian**: Ngày, tháng, năm
- ❌ **Lọc theo loại**: Ảnh, video, ảnh yêu thích

### 🗑️ Thùng rác (Trash Bin)
- ✅ **Soft Delete**: Ảnh bị xóa sẽ vào thùng rác (giữ 60 ngày)
- ✅ **Restore**: Khôi phục ảnh từ thùng rác
- ✅ **Force Delete**: Xóa vĩnh viễn ảnh/video
- ✅ **Auto-cleanup**: Tự động xóa sau 60 ngày
- ✅ **Expiration Badges**: Hiển thị thời gian còn lại với màu cảnh báo

### 🤝 Chia sẻ & Cộng tác
- ❌ **Share Albums**: Chia sẻ album với người khác
- ❌ **Permissions**: Phân quyền xem/chỉnh sửa
- ❌ **Friendship System**: Kết bạn với người dùng khác
- ❌ **Notifications**: Thông báo khi có hoạt động mới

### 🎨 Giao diện
- ❌ **Responsive Design**: Tương thích mọi thiết bị
- ✅ **Grid Layout**: Lưới ảnh linh hoạt như Google Photos
- ✅ **Date Dividers**: Phân chia theo ngày tháng năm
- ✅ **Selection Mode**: Chọn nhiều ảnh để thực hiện hàng loạt
- ✅ **Smooth Animations**: Hiệu ứng chuyển động mượt mà

## 🛠️ Công nghệ sử dụng

### Backend
- **Laravel 12.x** - PHP Framework mạnh mẽ
- **MySQL/PostgreSQL** - Database quan hệ
- **Inertia.js** - Modern monolith approach
- **Laravel Storage** - File management system
- **Laravel Queue** - Background job processing
- **Laravel Scheduler** - Cron job management

### Frontend
- **React 19.x** - UI Library
- **TypeScript 5.7** - Type-safe JavaScript
- **TailwindCSS 4.x** - Utility-first CSS framework
- **Bootstrap 5.3** - Component library
- **Vite 7.x** - Build tool cực nhanh

### DevOps
- **Docker** - Containerization (optional)
- **Laravel Sail** - Docker development environment
- **Git** - Version control

## 📋 Yêu cầu hệ thống

- **PHP**: >= 8.2
- **Composer**: >= 2.x
- **Node.js**: >= 20.x
- **NPM/Yarn**: >= 10.x
- **Database**: MySQL >= 8.0 hoặc PostgreSQL >= 14
- **Web Server**: Apache/Nginx hoặc PHP built-in server
- **Extensions**: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, GD/Imagick

## 🚀 Cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/congntc/google-photos-clone.git
cd google-photos-clone
```

### 2. Cài đặt Dependencies

#### Backend (PHP)
```bash
composer install
```

#### Frontend (JavaScript)
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình môi trường

#### Tạo file `.env`
```bash
cp .env.example .env
```

#### Generate Application Key
```bash
php artisan key:generate
```

#### Cấu hình Database trong `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=google_photos_clone
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### Cấu hình File Storage
```env
FILESYSTEM_DISK=public
```

### 4. Tạo Database

```bash
# MySQL
mysql -u root -p
CREATE DATABASE google_photos_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Chạy Migration

```bash
php artisan migrate
```

### 6. Tạo Symbolic Link cho Storage

```bash
php artisan storage:link
```

### 7. Seed Database (Optional)

```bash
php artisan db:seed
```

### 8. Build Assets

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run build
```

### 9. Chạy ứng dụng

#### Sử dụng PHP Built-in Server
```bash
php artisan serve
```

Mở trình duyệt: `http://127.0.0.1:8000`

#### Sử dụng Laravel Sail (Docker)
```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

Mở trình duyệt: `http://localhost`

## 🔧 Development

### Chạy Development Server

```bash
# Terminal 1: Backend
php artisan serve

# Terminal 2: Frontend (Hot reload)
npm run dev

# Terminal 3: Queue Worker (Optional)
php artisan queue:listen
```

### Hoặc sử dụng Composer Script (All-in-one)

```bash
composer dev
```

Script này sẽ chạy đồng thời:
- Laravel Server (port 8000)
- Queue Worker
- Laravel Pail (Log viewer)
- Vite Dev Server (Hot reload)

### 🗓️ Scheduled Tasks

Ứng dụng sử dụng Laravel Scheduler để tự động xóa ảnh hết hạn trong thùng rác.

#### Thêm vào Crontab (Linux/Mac)
```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

#### Windows Task Scheduler
```bash
# Tạo task chạy mỗi phút
php artisan schedule:run
```

#### Test Scheduled Command
```bash
php artisan photos:delete-expired
```

## 📁 Cấu trúc thư mục

```
google-photos-clone/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── DeleteExpiredPhotos.php    # Auto-delete expired photos
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── PhotoController.php        # Photo CRUD + Bin management
│   │   │   ├── AlbumController.php        # Album management
│   │   │   ├── FavoriteController.php     # Favorites
│   │   │   └── ...
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php  # Inertia middleware
│   │   └── Requests/
│   └── Models/
│       ├── Photo.php                       # Photo model (SoftDeletes)
│       ├── Album.php                       # Album model
│       ├── User.php                        # User model
│       └── ...
├── database/
│   ├── migrations/                         # Database schema
│   └── seeders/                            # Sample data
├── resources/
│   ├── js/
│   │   ├── Pages/                          # React pages
│   │   │   ├── Photos.tsx                  # Main photo gallery
│   │   │   ├── Bin.tsx                     # Trash bin
│   │   │   ├── Albums.tsx                  # Albums list
│   │   │   ├── Favourites.tsx              # Favorites
│   │   │   └── ...
│   │   ├── Layouts/
│   │   │   └── app.tsx                     # Main layout
│   │   ├── Components/                     # Reusable components
│   │   └── assets/
│   │       └── css/                        # Stylesheets
│   └── views/
│       └── app.blade.php                   # Root template
├── routes/
│   ├── web.php                             # Web routes
│   └── console.php                         # Console commands
├── storage/
│   └── app/
│       └── public/                         # User uploads
├── public/
│   ├── storage -> ../storage/app/public    # Symlink
│   └── build/                              # Compiled assets
├── .env.example                            # Environment template
├── composer.json                           # PHP dependencies
├── package.json                            # JS dependencies
└── README.md                               # This file
```

## 🎯 API Endpoints

### Photos
```
GET     /photos                 # Danh sách ảnh
POST    /photos/upload          # Upload ảnh mới
POST    /photos/toggle-favorite # Toggle favorite
POST    /photos/delete-batch    # Soft delete (vào thùng rác)
POST    /photos/restore-batch   # Khôi phục từ thùng rác
POST    /photos/force-delete-batch # Xóa vĩnh viễn
GET     /api/photos/bin         # Lấy danh sách thùng rác
GET     /photos/{id}/download   # Download ảnh
```

### Albums
```
GET     /albums                 # Danh sách albums
POST    /albums                 # Tạo album mới
GET     /albums/{id}            # Chi tiết album
PUT     /albums/{id}            # Cập nhật album
DELETE  /albums/{id}            # Xóa album
POST    /albums/{id}/add-photos # Thêm ảnh vào album
```

### Favorites
```
GET     /favourites             # Danh sách ảnh yêu thích
```

### Archive
```
GET     /archive                # Danh sách ảnh lưu trữ
```

## 🧪 Testing

### Chạy Tests
```bash
php artisan test

# Với coverage
php artisan test --coverage
```

### Tạo Test mới
```bash
php artisan make:test PhotoTest
```

## 🐛 Troubleshooting

### Lỗi: "Storage link not found"
```bash
php artisan storage:link
```

### Lỗi: "SQLSTATE[HY000] [2002] Connection refused"
Kiểm tra MySQL/PostgreSQL đã chạy chưa:
```bash
# MySQL
sudo service mysql start

# PostgreSQL
sudo service postgresql start
```

### Lỗi: "Class 'App\Http\Controllers\...' not found"
```bash
composer dump-autoload
```

### Lỗi: "Vite manifest not found"
```bash
npm run build
```

### Xóa Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## 📦 Deployment

### Build cho Production

```bash
# 1. Cài dependencies
composer install --optimize-autoloader --no-dev

# 2. Build frontend
npm run build

# 3. Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Set permissions
chmod -R 775 storage bootstrap/cache
```

### Cấu hình Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/google-photos-clone/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Upload size
    client_max_body_size 100M;
}
```

### Environment Variables (Production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Session driver
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Cache
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.0.0 (2025-11-10)
- ✅ Quản lý ảnh/video cơ bản (upload, view, delete)
- ✅ Album management
- ✅ Favorites system
- ✅ Trash bin với 60-day retention
- ✅ Auto-delete expired photos
- ✅ Lightbox viewer fullscreen
- ✅ Responsive design
- ✅ Expiration badges với color warnings

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 👨‍💻 Author

**Your Name**
- GitHub: [@congntc](https://github.com/congntc)
- Email: nguyentheconght@gmail.com

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework
- [React](https://react.dev) - The UI Library
- [Inertia.js](https://inertiajs.com) - Modern Monolith
- [TailwindCSS](https://tailwindcss.com) - CSS Framework
- [Google Photos](https://photos.google.com) - Design Inspiration

---

<p align="center">Made with ❤️ using Laravel & React</p>
