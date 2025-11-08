# Hướng dẫn Test Tính năng Photos

## Các thay đổi đã thực hiện:

### 1. PhotoController.php
- **index()**: Query photos/videos từ database và truyền qua Inertia
- **upload()**: Nhận files upload, lưu vào `storage/app/public/photos/{userId}`, tạo record trong DB
- Trả về JSON response thay vì redirect

### 2. Photos.tsx
- **Nhận props `photos`** từ backend qua Inertia
- **Video auto-play on hover**: Thêm `onMouseEnter` và `onMouseLeave` events
  - Khi hover: video.play()
  - Khi rời chuột: video.pause() + reset currentTime = 0
- **Upload thực**: Gửi FormData lên `/photos/upload` qua fetch API
- Hiển thị video với `objectFit: cover` và `loop` để trải nghiệm tốt hơn

### 3. app.blade.php
- Thêm `<meta name="csrf-token">` để fetch API có thể lấy token
- Sửa Vite entry point từ `.jsx` sang `.tsx`

### 4. PhotoSeeder.php (mới)
- Tạo dữ liệu mẫu để test

## Cách test:

### Bước 1: Chạy migration (nếu chưa)
```powershell
php artisan migrate
```

### Bước 2: Tạo symbolic link cho storage (nếu chưa)
```powershell
php artisan storage:link
```

### Bước 3: Seed dữ liệu mẫu
```powershell
php artisan db:seed --class=PhotoSeeder
```

### Bước 4: Chạy dev servers
Terminal 1:
```powershell
npm run dev
```

Terminal 2:
```powershell
php artisan serve
```

### Bước 5: Test trên browser
1. Truy cập: http://127.0.0.1:8000
2. Đăng nhập với tài khoản: `test@example.com` / `password`
3. Vào trang Photos: http://127.0.0.1:8000/photos
4. **Test video hover**: Di chuột vào các video → sẽ tự động phát
5. **Test upload**: Click nút FAB (+) → chọn ảnh/video → upload

## Lưu ý:

- Seeder tạo photos với `file_path` giả (`photos/samples/...`). Để hiển thị ảnh thực, bạn cần:
  - Upload ảnh qua UI, hoặc
  - Copy ảnh mẫu vào `storage/app/public/photos/samples/` và đổi tên khớp với DB

- Video mẫu trong seeder dùng path giả. Khi upload video thực qua UI, mọi thứ sẽ hoạt động tự động.

- Upload file tối đa 50MB (có thể thay đổi trong PhotoController validation)

## Cấu trúc file upload:
```
storage/
  app/
    public/
      photos/
        {user_id}/
          {timestamp}_{original_name}.jpg
          {timestamp}_{original_name}.mp4
```

## Troubleshooting:

1. **Không thấy ảnh**: Kiểm tra symbolic link
   ```powershell
   php artisan storage:link
   ```

2. **Upload bị lỗi 419**: Kiểm tra CSRF token trong browser console

3. **Video không tự phát**: Trình duyệt cần policy cho phép autoplay với `muted` attribute (đã có trong code)
