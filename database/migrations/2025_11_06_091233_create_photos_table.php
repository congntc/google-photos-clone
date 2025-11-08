<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_filename');
            $table->string('stored_filename')->comment('Tên file đã hash để lưu trữ');
            $table->string('file_path', 500)->comment('Đường dẫn đầy đủ');
            $table->string('thumbnail_path', 500)->nullable()->comment('Đường dẫn thumbnail');
            $table->unsignedBigInteger('file_size')->comment('Kích thước file (bytes)');
            $table->string('mime_type', 100)->comment('image/jpeg, image/png, video/mp4, etc.');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            
            // EXIF Metadata
            $table->timestamp('taken_at')->nullable()->comment('Ngày chụp từ EXIF');
            $table->string('camera_make', 100)->nullable()->comment('Hãng camera');
            $table->string('camera_model', 100)->nullable()->comment('Model camera');
            $table->decimal('latitude', 10, 8)->nullable()->comment('Vĩ độ GPS');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Kinh độ GPS');
            $table->string('location_name')->nullable()->comment('Tên địa điểm (geocoded)');
            
            $table->boolean('is_favorite')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->timestamp('deleted_at')->nullable()->comment('Soft delete - thùng rác');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('taken_at');
            $table->index('uploaded_at');
            $table->index(['latitude', 'longitude'], 'idx_location');
            $table->index('is_favorite');
            $table->index('is_archived');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
