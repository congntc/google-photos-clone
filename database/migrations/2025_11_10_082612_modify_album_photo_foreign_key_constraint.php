<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Sửa foreign key constraint từ CASCADE sang RESTRICT
     * Mục đích: Khi soft delete photo, không tự động xóa khỏi album_photo
     * Chỉ xóa khỏi album_photo khi force delete (xóa vĩnh viễn)
     */
    public function up(): void
    {
        Schema::table('album_photo', function (Blueprint $table) {
            // Xóa foreign key cũ (có CASCADE)
            $table->dropForeign(['photo_id']);
            
            // Thêm foreign key mới với RESTRICT
            // RESTRICT = không cho xóa photo nếu vẫn còn trong album
            // Phải xóa khỏi album_photo trước, mới xóa được photo
            $table->foreign('photo_id')
                ->references('id')
                ->on('photos')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('album_photo', function (Blueprint $table) {
            // Rollback: Xóa RESTRICT constraint
            $table->dropForeign(['photo_id']);
            
            // Thêm lại CASCADE constraint như cũ
            $table->foreign('photo_id')
                ->references('id')
                ->on('photos')
                ->onDelete('cascade');
        });
    }
};
