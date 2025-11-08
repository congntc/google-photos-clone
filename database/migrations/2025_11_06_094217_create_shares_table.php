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
        Schema::create('shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->comment('Người tạo share');
            $table->string('shareable_type', 50)->comment('App\\Models\\Photo hoặc App\\Models\\Album');
            $table->unsignedBigInteger('shareable_id')->comment('ID của photo hoặc album');
            $table->string('share_token', 64)->unique()->comment('Token công khai để truy cập');
            $table->enum('share_type', ['public', 'friends', 'specific'])->default('public');
            $table->string('password')->nullable()->comment('Mật khẩu bảo vệ (optional)');
            $table->timestamp('expires_at')->nullable()->comment('Thời gian hết hạn (optional)');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('view_count')->default(0)->comment('Số lượt xem');
            $table->timestamps();
            
            $table->index('share_token');
            $table->index('user_id');
            $table->index(['shareable_type', 'shareable_id'], 'idx_shareable');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shares');
    }
};
