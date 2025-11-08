# /google-photo-clone/docker/php/Dockerfile

FROM php:8.3-fpm-alpine

# Cài các dependencies cần thiết cho Laravel + Image Processing
RUN apk add --no-cache \
    build-base \
    libzip-dev \
    zip \
    unzip \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libexif-dev \
    oniguruma-dev

# Configure và cài các extension PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        zip \
        pcntl \
        gd \
        exif \
        bcmath \
        opcache

# Cài Composer (trình quản lý package PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set thư mục làm việc
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies (sẽ chạy khi build)
# RUN composer install --no-interaction --optimize-autoloader --no-dev

# Set permissions cho Laravel storage và cache
RUN mkdir -p storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]