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
        Schema::table('photos', function (Blueprint $table) {
            // Thêm unique constraint để đảm bảo 1 user không có 2 file giống nhau
            // Điều này ngăn chặn việc tạo duplicate records khi toggle favorite
            $table->unique(['user_id', 'stored_filename'], 'unique_user_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            // Xóa unique constraint khi rollback
            $table->dropUnique('unique_user_file');
        });
    }
};
