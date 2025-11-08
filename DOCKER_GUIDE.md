# 🐳 Docker Setup Guide - Google Photos Clone

## Cấu trúc Docker

Dự án sử dụng 4 containers:

1. **nginx** (port 8080) - Web server
2. **app** (PHP 8.3-FPM) - Laravel backend
3. **node** (port 5173) - Vite dev server (React frontend)
4. **db** (MySQL 8.0, port 3307) - Database

## 🚀 Khởi động dự án

### Lần đầu tiên (First time setup)

```bash
# 1. Build và start containers
docker-compose up -d --build

# 2. Cài đặt PHP dependencies
docker-compose exec app composer install

# 3. Copy .env file
docker-compose exec app cp .env.example .env

# 4. Generate application key
docker-compose exec app php artisan key:generate

# 5. Chạy migrations
docker-compose exec app php artisan migrate

# 6. Tạo storage link
docker-compose exec app php artisan storage:link

# 7. Set permissions
docker-compose exec app chmod -R 775 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Khởi động bình thường

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f node
```

## 🌐 Truy cập ứng dụng

- **Frontend/Backend:** http://localhost:8080
- **Vite Dev Server:** http://localhost:5173 (HMR)
- **MySQL:** localhost:3307
  - Database: `google_photos_clone`
  - Username: `gg_user`
  - Password: `gg1234`
  - Root password: `root_password`

## 📝 Lệnh thường dùng

### Laravel Artisan Commands

```bash
# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:list

# Create migration
docker-compose exec app php artisan make:migration create_photos_table

# Create controller
docker-compose exec app php artisan make:controller PhotoController
```

### Composer

```bash
# Install package
docker-compose exec app composer require package/name

# Update dependencies
docker-compose exec app composer update

# Dump autoload
docker-compose exec app composer dump-autoload
```

### NPM (Frontend)

```bash
# Install package
docker-compose exec node npm install package-name

# Run build
docker-compose exec node npm run build

# Run dev (already running in container)
docker-compose exec node npm run dev
```

### Database

```bash
# Access MySQL CLI
docker-compose exec db mysql -u gg_user -pgg1234 google_photos_clone

# Backup database
docker-compose exec db mysqldump -u gg_user -pgg1234 google_photos_clone > backup.sql

# Restore database
docker-compose exec -T db mysql -u gg_user -pgg1234 google_photos_clone < backup.sql
```

### Shell Access

```bash
# Access app container bash
docker-compose exec app sh

# Access node container bash
docker-compose exec node sh

# Access database container bash
docker-compose exec db bash
```

## 🔧 Troubleshooting

### Permission Issues

```bash
# Fix storage permissions
docker-compose exec app chmod -R 775 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Clear All Caches

```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

### Rebuild Containers

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

### Node Modules Issues

```bash
# Reinstall node modules
docker-compose exec node rm -rf node_modules package-lock.json
docker-compose exec node npm install
```

### Database Connection Failed

```bash
# Check if database is ready
docker-compose exec db mysqladmin ping -h localhost -u gg_user -pgg1234

# Check database exists
docker-compose exec db mysql -u gg_user -pgg1234 -e "SHOW DATABASES;"
```

## 🔒 Environment Variables

Cấu hình trong `.env`:

```env
APP_NAME="Google Photos Clone"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=google_photos_clone
DB_USERNAME=gg_user
DB_PASSWORD=gg1234

FILESYSTEM_DISK=public
```

## 📦 Volume Management

```bash
# List volumes
docker volume ls

# Remove specific volume
docker volume rm google-photos-clone_gpc_db_data

# Remove all unused volumes
docker volume prune
```

## 🎯 Production Deployment

Khi deploy production:

1. Thay `image: node:20-alpine` bằng build process
2. Chạy `npm run build` thay vì `npm run dev`
3. Set `APP_ENV=production` và `APP_DEBUG=false`
4. Sử dụng managed database (không dùng container)
5. Setup SSL/HTTPS cho Nginx
6. Configure proper backup strategy

## 📊 Container Status

```bash
# Check running containers
docker-compose ps

# Check container stats
docker stats

# Inspect container
docker inspect gpc_app
```

## 🔄 Update Workflow

```bash
# Pull latest code
git pull

# Rebuild containers if Dockerfile changed
docker-compose up -d --build

# Update dependencies
docker-compose exec app composer install
docker-compose exec node npm install

# Run migrations
docker-compose exec app php artisan migrate

# Clear caches
docker-compose exec app php artisan optimize:clear
```

## ✅ Health Check

Kiểm tra tất cả services hoạt động:

```bash
# 1. Check containers running
docker-compose ps

# 2. Check app health
curl http://localhost:8080

# 3. Check database connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo();

# 4. Check Vite HMR
curl http://localhost:5173/@vite/client
```

---

**Lưu ý:** Tất cả commands trên chạy từ thư mục root của project (nơi có file `docker-compose.yml`)
