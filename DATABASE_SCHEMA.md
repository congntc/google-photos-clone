# Cấu trúc Database - Google Photos Clone

## Tổng quan
Database được thiết kế để hỗ trợ đầy đủ các chức năng: quản lý người dùng, ảnh, album, chia sẻ, bạn bè, và thông báo.

---

## 1. Bảng `users` - Quản lý tài khoản người dùng

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL COMMENT 'URL ảnh đại diện',
    storage_used BIGINT UNSIGNED DEFAULT 0 COMMENT 'Dung lượng đã sử dụng (bytes)',
    storage_limit BIGINT UNSIGNED DEFAULT 5368709120 COMMENT 'Giới hạn 5GB mặc định',
    dark_mode BOOLEAN DEFAULT FALSE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Lưu thông tin đăng ký, đăng nhập
- Quản lý dung lượng lưu trữ của từng user
- Lưu preferences (dark mode, v.v.)

---

## 2. Bảng `password_reset_tokens` - Quên mật khẩu

```sql
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Hỗ trợ tính năng "Quên mật khẩu"
- Lưu token reset password có thời hạn

---

## 3. Bảng `friendships` - Quản lý bạn bè

```sql
CREATE TABLE friendships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Người gửi lời mời',
    friend_id BIGINT UNSIGNED NOT NULL COMMENT 'Người nhận lời mời',
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Quản lý quan hệ bạn bè
- Hỗ trợ: kết bạn, xóa bạn, block
- Status: `pending` (chờ chấp nhận), `accepted` (đã là bạn), `blocked` (đã chặn)

---

## 4. Bảng `photos` - Quản lý ảnh

```sql
CREATE TABLE photos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL COMMENT 'Tên file đã hash để lưu trữ',
    file_path VARCHAR(500) NOT NULL COMMENT 'Đường dẫn đầy đủ',
    thumbnail_path VARCHAR(500) NULL COMMENT 'Đường dẫn thumbnail',
    file_size BIGINT UNSIGNED NOT NULL COMMENT 'Kích thước file (bytes)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'image/jpeg, image/png, video/mp4, etc.',
    width INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
    
    -- Metadata từ EXIF
    taken_at TIMESTAMP NULL COMMENT 'Ngày chụp từ EXIF',
    camera_make VARCHAR(100) NULL COMMENT 'Hãng camera',
    camera_model VARCHAR(100) NULL COMMENT 'Model camera',
    latitude DECIMAL(10, 8) NULL COMMENT 'Vĩ độ GPS',
    longitude DECIMAL(11, 8) NULL COMMENT 'Kinh độ GPS',
    location_name VARCHAR(255) NULL COMMENT 'Tên địa điểm (geocoded)',
    
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete - thùng rác',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_taken_at (taken_at),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_location (latitude, longitude),
    INDEX idx_is_favorite (is_favorite),
    INDEX idx_is_archived (is_archived),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Lưu thông tin file ảnh/video
- Lưu metadata EXIF (ngày chụp, GPS, camera)
- Hỗ trợ tính năng yêu thích, lưu trữ, xóa mềm (thùng rác)
- Hỗ trợ nhóm ảnh theo ngày chụp và địa điểm

---

## 5. Bảng `albums` - Quản lý Album

```sql
CREATE TABLE albums (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cover_photo_id BIGINT UNSIGNED NULL COMMENT 'Ảnh bìa album',
    is_auto BOOLEAN DEFAULT FALSE COMMENT 'Album tự động tạo từ metadata',
    auto_type ENUM('date', 'location', 'camera', 'person') NULL COMMENT 'Loại album tự động',
    auto_criteria JSON NULL COMMENT 'Tiêu chí tự động (ví dụ: {"location": "Paris", "date_range": "2024-01"})',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_auto (is_auto),
    INDEX idx_auto_type (auto_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Tạo album thủ công và tự động
- Album tự động: nhóm theo ngày, địa điểm, camera, người
- `auto_criteria` lưu JSON để filter ảnh động

---

## 6. Bảng `album_photo` - Liên kết Album và Photo (Many-to-Many)

```sql
CREATE TABLE album_photo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    album_id BIGINT UNSIGNED NOT NULL,
    photo_id BIGINT UNSIGNED NOT NULL,
    order INT UNSIGNED DEFAULT 0 COMMENT 'Thứ tự sắp xếp trong album',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_album_photo (album_id, photo_id),
    INDEX idx_album_id (album_id),
    INDEX idx_photo_id (photo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- 1 ảnh có thể thuộc nhiều album
- 1 album có thể chứa nhiều ảnh
- Hỗ trợ sắp xếp thứ tự ảnh trong album

---

## 7. Bảng `shares` - Quản lý chia sẻ

```sql
CREATE TABLE shares (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Người tạo share',
    shareable_type VARCHAR(50) NOT NULL COMMENT 'App\\Models\\Photo hoặc App\\Models\\Album',
    shareable_id BIGINT UNSIGNED NOT NULL COMMENT 'ID của photo hoặc album',
    share_token VARCHAR(64) UNIQUE NOT NULL COMMENT 'Token công khai để truy cập',
    share_type ENUM('public', 'friends', 'specific') DEFAULT 'public',
    password VARCHAR(255) NULL COMMENT 'Mật khẩu bảo vệ (optional)',
    expires_at TIMESTAMP NULL COMMENT 'Thời gian hết hạn (optional)',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT UNSIGNED DEFAULT 0 COMMENT 'Số lượt xem',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_share_token (share_token),
    INDEX idx_user_id (user_id),
    INDEX idx_shareable (shareable_type, shareable_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Tạo link chia sẻ công khai với token unique
- Hỗ trợ chia sẻ: public (mọi người), friends (chỉ bạn bè), specific (người cụ thể)
- Hỗ trợ mật khẩu bảo vệ và tự động hết hạn
- Polymorphic relationship: chia sẻ Photo hoặc Album

---

## 8. Bảng `share_recipients` - Người nhận chia sẻ cụ thể

```sql
CREATE TABLE share_recipients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    share_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL COMMENT 'User nhận chia sẻ',
    can_download BOOLEAN DEFAULT TRUE,
    can_reshare BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP NULL COMMENT 'Lần đầu xem',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_share_recipient (share_id, recipient_id),
    INDEX idx_share_id (share_id),
    INDEX idx_recipient_id (recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Quản lý quyền của từng người nhận khi chia sẻ cụ thể
- Theo dõi ai đã xem share

---

## 9. Bảng `notifications` - Thông báo

```sql
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Người nhận thông báo',
    type VARCHAR(100) NOT NULL COMMENT 'photo_uploaded, share_received, friend_request, etc.',
    title VARCHAR(255) NOT NULL,
    message TEXT NULL,
    data JSON NULL COMMENT 'Dữ liệu bổ sung (photo_id, share_id, etc.)',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Thông báo upload thành công
- Thông báo khi nhận chia sẻ từ bạn bè
- Thông báo lời mời kết bạn
- `data` field chứa JSON với thông tin chi tiết

---

## 10. Bảng `tags` - Thẻ gắn ảnh

```sql
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Tạo tag tùy chỉnh cho ảnh
- Mỗi user có bộ tag riêng

---

## 11. Bảng `photo_tag` - Liên kết Photo và Tag (Many-to-Many)

```sql
CREATE TABLE photo_tag (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    photo_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_photo_tag (photo_id, tag_id),
    INDEX idx_photo_id (photo_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- 1 ảnh có nhiều tag
- 1 tag gắn cho nhiều ảnh

---

## 12. Bảng `people` - Nhận diện khuôn mặt

```sql
CREATE TABLE people (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NULL COMMENT 'Tên người (có thể để trống)',
    avatar_photo_id BIGINT UNSIGNED NULL COMMENT 'Ảnh đại diện',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (avatar_photo_id) REFERENCES photos(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Quản lý danh sách người/thú cưng được nhận diện
- Có thể đặt tên hoặc để "Unnamed Person"

---

## 13. Bảng `photo_person` - Liên kết Photo và People (Many-to-Many)

```sql
CREATE TABLE photo_person (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    photo_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    face_coordinates JSON NULL COMMENT 'Tọa độ khuôn mặt trong ảnh {x, y, width, height}',
    confidence DECIMAL(5, 2) NULL COMMENT 'Độ tin cậy nhận diện 0.00-100.00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_photo_person (photo_id, person_id),
    INDEX idx_photo_id (photo_id),
    INDEX idx_person_id (person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Liên kết ảnh với người được nhận diện
- Lưu vị trí khuôn mặt trong ảnh
- Lưu độ tin cậy của thuật toán nhận diện

---

## 14. Bảng `jobs` - Queue jobs (Laravel)

```sql
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    
    INDEX idx_queue (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Queue xử lý thumbnail, optimize ảnh, trích xuất EXIF
- Xử lý background tasks không đồng bộ

---

## 15. Bảng `failed_jobs` - Failed queue jobs

```sql
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Log các job thất bại để debug

---

## 16. Bảng `sessions` - Laravel sessions

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Mục đích:**
- Quản lý session người dùng

---

## Sơ đồ quan hệ (Entity Relationship)

```
users (1) ----< (N) photos
users (1) ----< (N) albums
users (1) ----< (N) shares
users (1) ----< (N) notifications
users (1) ----< (N) tags
users (1) ----< (N) people

photos (N) ----< (M) albums (through album_photo)
photos (N) ----< (M) tags (through photo_tag)
photos (N) ----< (M) people (through photo_person)

albums (1) ----< (N) album_photo >---- (1) photos
shares (1) ----< (N) share_recipients >---- (1) users

friendships: users <---> users (self-referencing)
shares: polymorphic (shareable_type, shareable_id) -> photos | albums
```

---

## Indexes quan trọng

1. **photos table:**
   - `idx_user_id`: Truy vấn ảnh của user
   - `idx_taken_at`: Nhóm theo ngày chụp
   - `idx_location`: Tìm ảnh theo GPS
   - `idx_deleted_at`: Lọc thùng rác

2. **album_photo table:**
   - `unique_album_photo`: Đảm bảo không trùng lặp
   - `idx_album_id`: Lấy ảnh trong album

3. **shares table:**
   - `idx_share_token`: Truy cập link chia sẻ nhanh
   - `idx_expires_at`: Cleanup link hết hạn

4. **notifications table:**
   - `idx_user_id + idx_is_read`: Lấy thông báo chưa đọc

---

## Lưu ý triển khai

### 1. Storage Management
- Khi user upload ảnh: cập nhật `users.storage_used`
- Khi xóa ảnh khỏi `deleted_at` (xóa vĩnh viễn): trừ `storage_used`
- Kiểm tra `storage_limit` trước khi upload

### 2. Soft Delete
- `photos.deleted_at`: Ảnh vào thùng rác (hiển thị trong /bin)
- Tự động xóa vĩnh viễn sau 30 ngày bằng scheduled job

### 3. Auto Albums
- Chạy nightly job để tạo/cập nhật album tự động
- Query photos matching `auto_criteria` và sync với `album_photo`

### 4. Metadata Extraction
- Sử dụng Queue Job để extract EXIF sau khi upload
- Libraries: `intervention/image` hoặc `php-exif`
- Geocode GPS coordinates thành `location_name` (Google Maps API)

### 5. Notifications
- Tạo notification khi:
  - Upload thành công (type: `photo_uploaded`)
  - Nhận share (type: `share_received`)
  - Lời mời kết bạn (type: `friend_request`)
- Cleanup notification cũ hơn 90 ngày

### 6. Performance
- Cache photo counts per album
- Cache location names (geocoding API expensive)
- Index đầy đủ cho query nhanh
- Pagination với `cursor` thay vì `offset` cho infinite scroll

---

## Migration Commands

```bash
# Tạo migrations theo thứ tự
php artisan make:migration create_users_table
php artisan make:migration create_password_reset_tokens_table
php artisan make:migration create_friendships_table
php artisan make:migration create_photos_table
php artisan make:migration create_albums_table
php artisan make:migration create_album_photo_table
php artisan make:migration create_shares_table
php artisan make:migration create_share_recipients_table
php artisan make:migration create_notifications_table
php artisan make:migration create_tags_table
php artisan make:migration create_photo_tag_table
php artisan make:migration create_people_table
php artisan make:migration create_photo_person_table
php artisan make:migration create_jobs_table
php artisan make:migration create_failed_jobs_table
php artisan make:migration create_sessions_table

# Chạy migrations
php artisan migrate
```

---

## Next Steps

1. **Tạo Models với relationships:**
   - `User hasMany Photos, Albums, Shares`
   - `Photo belongsToMany Albums, Tags, People`
   - `Album belongsToMany Photos`
   - `Share morphTo Shareable (Photo/Album)`

2. **Tạo Seeders:**
   - UserSeeder
   - PhotoSeeder (với sample data)
   - AlbumSeeder

3. **Tạo Controllers:**
   - PhotoController (upload, delete, restore, index)
   - AlbumController (CRUD)
   - ShareController (create, view, manage)
   - FriendshipController (add, accept, block)

4. **Tạo Jobs:**
   - ProcessPhotoUpload (thumbnail, optimize, EXIF)
   - CleanupDeletedPhotos (xóa sau 30 ngày)
   - CreateAutoAlbums (nightly)

5. **Tạo API Resources:**
   - PhotoResource
   - AlbumResource
   - ShareResource

---

**File này chưa tạo bất kỳ code nào trong project. Đây chỉ là documentation thiết kế database.**
